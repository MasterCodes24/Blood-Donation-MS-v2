# Blood Donation Management System - Backend

Node.js + Express + PostgreSQL REST API. The database and tables must already exist.

## Setup
1. Install Node.js and PostgreSQL.
2. `cd backend`
3. `npm install`
4. Copy `.env.example` to `.env` and fill in `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`.
5. Start: `npm start` (or `npm run dev` for auto-restart).

Server runs at `http://localhost:5000`.

## Authentication and role-based access
- Donors and staff log in with email + password. Passwords are stored as bcrypt hashes and compared with bcrypt on login.
- On login the server returns a JWT containing `{ id, role }` (`donor`, `staff` or `admin`), valid for 1 day.
- Send it on private routes: `Authorization: Bearer <token>`.
- `auth` middleware verifies the token (401 if missing/invalid).
- `staffOnly` allows only `staff` or `admin` (403 otherwise). Donor routes allow only `donor` (403 otherwise).
- `password_hash` is never returned by any endpoint.

## Response format
Success: `{ "success": true, "message": "...", "data": {} }`
Error: `{ "success": false, "message": "..." }`

Status codes: 200, 201, 400 (invalid input), 401 (bad/missing token or credentials), 403 (wrong role), 404 (not found), 409 (duplicate / invalid status transition), 500 (server error).

## Endpoints

### POST /api/donors/register
Request:
```json
{ "full_name": "Amit Patil", "email": "amit@example.com", "password": "secret123",
  "phone": "9876543210", "blood_group": "O+", "city_or_area": "Hingoli" }
```
201 response:
```json
{ "success": true, "message": "Donor registered successfully",
  "data": { "donor_id": 1, "full_name": "Amit Patil", "email": "amit@example.com",
            "phone": "9876543210", "blood_group": "O+", "city_or_area": "Hingoli" } }
```
409: `{ "success": false, "message": "Email or phone already exists" }`

### POST /api/donors/login
Request: `{ "email": "amit@example.com", "password": "secret123" }`
200 response:
```json
{ "success": true, "message": "Login successful",
  "data": { "token": "<jwt>", "donor": { "donor_id": 1, "full_name": "Amit Patil",
            "email": "amit@example.com", "phone": "9876543210",
            "blood_group": "O+", "city_or_area": "Hingoli" } } }
```
401: `{ "success": false, "message": "Invalid email or password" }`

### GET /api/donors/me  (donor token)
200 data: donor profile object (same fields as above).

### PUT /api/donors/me  (donor token)
Request (any of the three): `{ "phone": "9123456780", "blood_group": "A+", "city_or_area": "Nanded" }`
200 data: updated profile. Sending `email` returns 400.

### POST /api/appointments  (donor token)
Request: `{ "appointment_date": "2026-12-01" }`
201 response:
```json
{ "success": true, "message": "Appointment requested",
  "data": { "appointment_id": 5, "donor_id": 1, "appointment_date": "2026-12-01", "status": "requested" } }
```

### GET /api/appointments/me  (donor token)
200 data: array of `{ appointment_id, donor_id, appointment_date, status }`.

### GET /api/donations/me  (donor token)
200 data: array of `{ donation_id, donor_id, appointment_id, donation_date, appointment_date }`.

### POST /api/staff/register
Request: `{ "full_name": "Nurse Rao", "email": "rao@example.com", "password": "secret123", "role": "staff" }`
201 data: `{ "staff_id": 1, "full_name": "Nurse Rao", "email": "rao@example.com", "role": "staff" }`
409 if email exists.

### POST /api/staff/login
Request: `{ "email": "rao@example.com", "password": "secret123" }`
200 data: `{ "token": "<jwt>", "staff": { "staff_id": 1, "full_name": "Nurse Rao", "email": "rao@example.com", "role": "staff" } }`

### GET /api/staff/appointments  (staff/admin token)
200 data: array of
`{ appointment_id, donor_id, full_name, blood_group, appointment_date, status }`.

### PATCH /api/staff/appointments/:id/approve  (staff/admin token)
requested -> approved. 200 data: updated appointment. 409 if not `requested`, 404 if not found.

### PATCH /api/staff/appointments/:id/reject  (staff/admin token)
requested -> rejected. 200 data: updated appointment. 409 if not `requested`, 404 if not found.

### PATCH /api/staff/appointments/:id/complete  (staff/admin token)
approved -> completed, and a donation row is inserted, in one transaction (rolled back on failure).
200 response:
```json
{ "success": true, "message": "Appointment completed and donation recorded",
  "data": { "donation_id": 1, "donor_id": 1, "appointment_id": 5, "donation_date": "2026-10-23" } }
```
409 if the appointment is not `approved`, 404 if not found.