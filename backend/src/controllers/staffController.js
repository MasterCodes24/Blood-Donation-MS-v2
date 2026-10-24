const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const {
  sendSuccess,
  sendError,
  validateStaffRegister,
  validateLogin,
  isValidId,
} = require('../utils/validate');

async function register(req, res) {
  const error = validateStaffRegister(req.body);
  if (error) return sendError(res, 400, error);

  const { full_name, email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO staff (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING staff_id, full_name, email, role`,
      [full_name.trim(), email.trim().toLowerCase(), hash, role]
    );
    return sendSuccess(res, 201, 'Staff registered successfully', result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return sendError(res, 409, 'Email already exists');
    throw err;
  }
}

async function login(req, res) {
  const error = validateLogin(req.body);
  if (error) return sendError(res, 400, error);

  const { email, password } = req.body;
  const result = await pool.query(
    `SELECT staff_id, full_name, email, role, password_hash FROM staff WHERE email = $1`,
    [email.trim().toLowerCase()]
  );
  if (result.rows.length === 0) return sendError(res, 401, 'Invalid email or password');

  const staff = result.rows[0];
  const match = await bcrypt.compare(password, staff.password_hash);
  if (!match) return sendError(res, 401, 'Invalid email or password');

  const token = jwt.sign({ id: staff.staff_id, role: staff.role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
  delete staff.password_hash;
  return sendSuccess(res, 200, 'Login successful', { token, staff });
}

async function getAllAppointments(req, res) {
  const result = await pool.query(
    `SELECT a.appointment_id, a.donor_id, d.full_name, d.blood_group,
            a.appointment_date::text AS appointment_date, a.status
     FROM appointments a
     JOIN donors d ON d.donor_id = a.donor_id
     ORDER BY a.appointment_date DESC, a.appointment_id DESC`
  );
  return sendSuccess(res, 200, 'Appointments fetched', result.rows);
}

// Shared logic for approve / reject (requested -> newStatus)
async function changeFromRequested(req, res, newStatus, message) {
  if (!isValidId(req.params.id)) return sendError(res, 400, 'Invalid appointment id');
  const id = Number(req.params.id);

  const result = await pool.query(
    `UPDATE appointments SET status = $1
     WHERE appointment_id = $2 AND status = 'requested'
     RETURNING appointment_id, donor_id, appointment_date::text AS appointment_date, status`,
    [newStatus, id]
  );
  if (result.rows.length > 0) return sendSuccess(res, 200, message, result.rows[0]);

  const exists = await pool.query('SELECT 1 FROM appointments WHERE appointment_id = $1', [id]);
  if (exists.rows.length === 0) return sendError(res, 404, 'Appointment not found');
  return sendError(res, 409, 'Appointment is not in requested status');
}

const approve = (req, res) => changeFromRequested(req, res, 'approved', 'Appointment approved');
const reject = (req, res) => changeFromRequested(req, res, 'rejected', 'Appointment rejected');

async function complete(req, res) {
  if (!isValidId(req.params.id)) return sendError(res, 400, 'Invalid appointment id');
  const id = Number(req.params.id);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const found = await client.query(
      'SELECT appointment_id, donor_id, status FROM appointments WHERE appointment_id = $1 FOR UPDATE',
      [id]
    );
    if (found.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, 404, 'Appointment not found');
    }
    const appt = found.rows[0];
    if (appt.status !== 'approved') {
      await client.query('ROLLBACK');
      return sendError(res, 409, 'Appointment is not in approved status');
    }

    await client.query("UPDATE appointments SET status = 'completed' WHERE appointment_id = $1", [id]);

    const donation = await client.query(
      `INSERT INTO donations (donor_id, appointment_id, donation_date)
       VALUES ($1, $2, CURRENT_DATE)
       RETURNING donation_id, donor_id, appointment_id, donation_date::text AS donation_date`,
      [appt.donor_id, appt.appointment_id]
    );

    await client.query('COMMIT');
    return sendSuccess(res, 200, 'Appointment completed and donation recorded', donation.rows[0]);
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('Rollback failed:', rollbackErr.message);
    }
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { register, login, getAllAppointments, approve, reject, complete };