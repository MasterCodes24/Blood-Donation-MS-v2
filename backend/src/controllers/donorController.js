const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const {
  sendSuccess,
  sendError,
  validateDonorRegister,
  validateLogin,
  validateDonorUpdate,
} = require('../utils/validate');

const PROFILE_COLS = 'donor_id, full_name, email, phone, blood_group, city_or_area';

async function register(req, res) {
  const error = validateDonorRegister(req.body);
  if (error) return sendError(res, 400, error);

  const { full_name, email, password, phone, blood_group, city_or_area } = req.body;
  const hash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO donors (full_name, email, password_hash, phone, blood_group, city_or_area)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${PROFILE_COLS}`,
      [full_name.trim(), email.trim().toLowerCase(), hash, phone.trim(), blood_group, city_or_area.trim()]
    );
    return sendSuccess(res, 201, 'Donor registered successfully', result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return sendError(res, 409, 'Email or phone already exists');
    }
    throw err;
  }
}

async function login(req, res) {
  const error = validateLogin(req.body);
  if (error) return sendError(res, 400, error);

  const { email, password } = req.body;
  const result = await pool.query(
    `SELECT ${PROFILE_COLS}, password_hash FROM donors WHERE email = $1`,
    [email.trim().toLowerCase()]
  );
  if (result.rows.length === 0) return sendError(res, 401, 'Invalid email or password');

  const donor = result.rows[0];
  const match = await bcrypt.compare(password, donor.password_hash);
  if (!match) return sendError(res, 401, 'Invalid email or password');

  const token = jwt.sign({ id: donor.donor_id, role: 'donor' }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
  delete donor.password_hash;
  return sendSuccess(res, 200, 'Login successful', { token, donor });
}

async function getMe(req, res) {
  const result = await pool.query(`SELECT ${PROFILE_COLS} FROM donors WHERE donor_id = $1`, [
    req.user.id,
  ]);
  if (result.rows.length === 0) return sendError(res, 404, 'Donor not found');
  return sendSuccess(res, 200, 'Profile fetched', result.rows[0]);
}

async function updateMe(req, res) {
  const error = validateDonorUpdate(req.body);
  if (error) return sendError(res, 400, error);

  const { phone, blood_group, city_or_area } = req.body;
  try {
    const result = await pool.query(
      `UPDATE donors
       SET phone = COALESCE($1, phone),
           blood_group = COALESCE($2, blood_group),
           city_or_area = COALESCE($3, city_or_area)
       WHERE donor_id = $4
       RETURNING ${PROFILE_COLS}`,
      [
        phone !== undefined ? phone.trim() : null,
        blood_group !== undefined ? blood_group : null,
        city_or_area !== undefined ? city_or_area.trim() : null,
        req.user.id,
      ]
    );
    if (result.rows.length === 0) return sendError(res, 404, 'Donor not found');
    return sendSuccess(res, 200, 'Profile updated', result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return sendError(res, 409, 'Phone already exists');
    throw err;
  }
}

module.exports = { register, login, getMe, updateMe };