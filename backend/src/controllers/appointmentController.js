const pool = require('../config/db');
const { sendSuccess, sendError, validateAppointment } = require('../utils/validate');

async function bookAppointment(req, res) {
  const error = validateAppointment(req.body);
  if (error) return sendError(res, 400, error);

  const result = await pool.query(
    `INSERT INTO appointments (donor_id, appointment_date, status)
     VALUES ($1, $2, 'requested')
     RETURNING appointment_id, donor_id, appointment_date::text AS appointment_date, status`,
    [req.user.id, req.body.appointment_date]
  );
  return sendSuccess(res, 201, 'Appointment requested', result.rows[0]);
}

async function getMyAppointments(req, res) {
  const result = await pool.query(
    `SELECT appointment_id, donor_id, appointment_date::text AS appointment_date, status
     FROM appointments
     WHERE donor_id = $1
     ORDER BY appointment_date DESC, appointment_id DESC`,
    [req.user.id]
  );
  return sendSuccess(res, 200, 'Appointments fetched', result.rows);
}

module.exports = { bookAppointment, getMyAppointments };