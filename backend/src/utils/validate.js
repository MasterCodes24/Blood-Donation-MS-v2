const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isNonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;
const isValidEmail = (v) => typeof v === 'string' && v.length <= 254 && EMAIL_REGEX.test(v.trim());
const isValidPassword = (v) => typeof v === 'string' && v.length >= 8 && v.length <= 72;
const isValidBloodGroup = (v) => BLOOD_GROUPS.includes(v);

const sendSuccess = (res, status, message, data = {}) =>
  res.status(status).json({ success: true, message, data });

const sendError = (res, status, message) =>
  res.status(status).json({ success: false, message });

// Returns an error message string, or null if valid
function validateDonorRegister(b) {
  if (!b || typeof b !== 'object') return 'Request body is required';
  if (!isNonEmpty(b.full_name)) return 'full_name is required';
  if (!isValidEmail(b.email)) return 'A valid email is required';
  if (!isValidPassword(b.password)) return 'password is required and must be at least 8 characters';
  if (!isNonEmpty(b.phone)) return 'phone is required';
  if (!isValidBloodGroup(b.blood_group)) return 'blood_group must be one of: ' + BLOOD_GROUPS.join(', ');
  if (!isNonEmpty(b.city_or_area)) return 'city_or_area is required';
  return null;
}

function validateStaffRegister(b) {
  if (!b || typeof b !== 'object') return 'Request body is required';
  if (!isNonEmpty(b.full_name)) return 'full_name is required';
  if (!isValidEmail(b.email)) return 'A valid email is required';
  if (!isValidPassword(b.password)) return 'password is required and must be at least 8 characters';
  if (b.role !== 'staff' && b.role !== 'admin') return 'role must be staff or admin';
  return null;
}

function validateLogin(b) {
  if (!b || typeof b !== 'object') return 'Request body is required';
  if (!isValidEmail(b.email)) return 'A valid email is required';
  if (typeof b.password !== 'string' || b.password.length === 0) return 'password is required';
  return null;
}

function validateDonorUpdate(b) {
  if (!b || typeof b !== 'object') return 'Request body is required';
  if (b.email !== undefined) return 'email cannot be changed';
  const { phone, blood_group, city_or_area } = b;
  if (phone === undefined && blood_group === undefined && city_or_area === undefined) {
    return 'Provide at least one of: phone, blood_group, city_or_area';
  }
  if (phone !== undefined && !isNonEmpty(phone)) return 'phone must be a non-empty string';
  if (blood_group !== undefined && !isValidBloodGroup(blood_group)) {
    return 'blood_group must be one of: ' + BLOOD_GROUPS.join(', ');
  }
  if (city_or_area !== undefined && !isNonEmpty(city_or_area)) return 'city_or_area must be a non-empty string';
  return null;
}

function validateAppointment(b) {
  if (!b || typeof b !== 'object') return 'Request body is required';
  const d = b.appointment_date;
  if (typeof d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    return 'appointment_date is required in YYYY-MM-DD format';
  }
  const parsed = new Date(d + 'T00:00:00Z');
  if (isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== d) {
    return 'appointment_date is not a valid date';
  }
  const today = new Date().toISOString().slice(0, 10);
  if (d <= today) return 'appointment_date must be a future date';
  return null;
}

const isValidId = (v) => /^\d+$/.test(String(v)) && Number(v) > 0 && Number(v) < 2147483647;

module.exports = {
  sendSuccess,
  sendError,
  validateDonorRegister,
  validateStaffRegister,
  validateLogin,
  validateDonorUpdate,
  validateAppointment,
  isValidId,
};