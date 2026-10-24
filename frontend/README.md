# LifeDrop — Blood Donation Management System (Frontend)

React + Vite frontend for the DBMS microproject. It follows the supplied project specification and calls the backend REST API using Axios. It does not connect directly to PostgreSQL.

## Requirements
- Node.js (LTS version)
- VS Code (recommended)
- Backend API running at `http://localhost:5000/api` for real login, registration and appointment actions

## Run the frontend
1. Extract `blood-donation-frontend.zip`.
2. Open the extracted `blood-donation-frontend` folder in VS Code.
3. Open Terminal → New Terminal.
4. Run `npm install`.
5. Copy `.env.example` to a new file named `.env`. Keep the API URL as `VITE_API_URL=http://localhost:5000/api` unless your backend team gives you a different URL.
6. Run `npm run dev`.
7. Open the local address Vite prints, usually `http://localhost:5173`.

## Pages
- `/donor/register`, `/donor/login`
- `/staff/register`, `/staff/login`
- `/donor/dashboard`, `/donor/profile`, `/donor/book-appointment`, `/donor/appointments`, `/donor/donations`
- `/staff/dashboard`, `/staff/appointments`

## API contract
The frontend expects the endpoints in the DBMS project PDF:
- `POST /donors/register`, `POST /donors/login`, `GET /donors/me`, `PUT /donors/me`
- `POST /staff/register`, `POST /staff/login`, `GET /staff/appointments`
- `POST /appointments`, `GET /appointments/me`
- `GET /donations/me`
- `PATCH /staff/appointments/:id/approve`, `/reject`, `/complete`

The API client accepts common response shapes such as `{ success, message, data }`. If your backend returns a different shape, coordinate with the backend teammate before changing the frontend.

## Important notes
- The frontend can start without the backend, but API-driven features will show an error until the backend is running.
- The staff registration page includes a staff/admin role selector because it is required by the project brief. In a real deployed system, public admin registration should be restricted.
- This project is a learning/demo project. Use fictional demo data and do not put real donor information in screenshots or public repositories.
