const pool = require('../config/db');
const { sendSuccess } = require('../utils/validate');

async function getMyDonations(req, res) {
  const result = await pool.query(
    `SELECT d.donation_id, d.donor_id, d.appointment_id,
            d.donation_date::text AS donation_date,
            a.appointment_date::text AS appointment_date
     FROM donations d
     LEFT JOIN appointments a ON a.appointment_id = d.appointment_id
     WHERE d.donor_id = $1
     ORDER BY d.donation_date DESC, d.donation_id DESC`,
    [req.user.id]
  );
  return sendSuccess(res, 200, 'Donation history fetched', result.rows);
}

module.exports = { getMyDonations };