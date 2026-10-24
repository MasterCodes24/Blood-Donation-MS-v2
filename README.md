# LifeDrop — Blood Donation Management System (v2)

<div align="center">

![LifeDrop Banner](https://img.shields.io/badge/Blood%20Donation-Management%20System-e63946?style=for-the-badge&logo=heart&logoColor=white)

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

**Connecting generous blood donors with healthcare staff and hospitals to save lives.**  
*A modern, secure, full-stack DBMS application built with React, Node.js, Express, and PostgreSQL.*

[Features](#-key-features) • [Architecture](#-system-architecture) • [Database Schema](#-database-schema) • [API Reference](#-api-endpoints) • [Getting Started](#-getting-started) • [Environment Setup](#-environment-variables)

</div>

---

## 📖 Overview

**LifeDrop** is a full-featured Blood Donation Management System designed to bridge the gap between voluntary blood donors and blood bank healthcare staff. The platform streamlines the complete lifecycle of blood donation: from donor onboarding and profile management, to scheduling donation appointments, approving requests, and recording verified donation histories through transactional database integrity.

---

## ✨ Key Features

### 🩸 Donor Portal
- **Donor Registration & Authentication**: Secure sign-up with phone and email uniqueness validation, along with bcrypt password encryption.
- **Profile Management**: View and edit contact details, city/locality, and blood group (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`).
- **Appointment Booking**: Schedule donation appointments for future dates with built-in validation checks.
- **Real-Time Appointment Tracking**: Monitor status (`requested`, `approved`, `rejected`, `completed`) with live status indicators.
- **Donation History**: Track past verified blood donations with timestamps and linked appointment references.

### 🏥 Staff & Administrative Portal
- **Role-Based Access Control**: Granular permissions distinguishing Donors, Staff members, and System Admins.
- **Centralized Appointment Queue**: View all donor appointments with real-time status and donor blood group information.
- **One-Click Approval / Rejection**: Approve pending requests or reject conflicting schedules.
- **Atomic Donation Recording**: Mark appointments as `completed` while automatically inserting a permanent donation record in a single PostgreSQL transaction (`BEGIN ... COMMIT`) with automatic rollback on error.

### 🛡️ Security & Reliability
- **Stateless JWT Authentication**: Secure bearer tokens containing role and user identity, expiring after 24 hours.
- **Bcrypt Password Hashing**: Passwords are salted and hashed (10 rounds) before persistence; hash values are never leaked in API responses.
- **Rate Limiting**: Defends against brute-force attacks on login endpoints (10 attempts per 15 min) and API abuse (100 requests per 15 min).
- **Security Headers & Sanitization**: Powered by `helmet`, CORS policy restriction, and parameterized SQL queries to prevent SQL injection.

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Client["Frontend (React + Vite)"]
        UI[User Interface & Pages]
        AuthCtx[Auth Context & State]
        AxiosClient[Axios API Client]
        UI --> AuthCtx
        AuthCtx --> AxiosClient
    end

    subgraph Server["Backend (Node.js + Express)"]
        MW[Middleware: Helmet / Cors / RateLimit / Auth]
        Routes[API Routes: /donors, /staff, /appointments, /donations]
        Controllers[Controllers & Business Logic]
        
        AxiosClient -->|HTTP / JSON + Bearer Token| MW
        MW --> Routes
        Routes --> Controllers
    end

    subgraph Database["Database (PostgreSQL)"]
        DB[(PostgreSQL Pool)]
        Controllers -->|Parameterized SQL Queries & Transactions| DB
    end
```

### 🔄 Appointment Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> Requested: Donor books appointment
    Requested --> Approved: Staff approves
    Requested --> Rejected: Staff rejects
    Approved --> Completed: Staff completes donation
    Completed --> [*]: Transaction inserts Donation record
    Rejected --> [*]
```

---

## 🗄️ Database Schema

The database relies on PostgreSQL with foreign key constraints, unique constraints, and check constraints to guarantee ACID compliance.

```sql
-- 1. Donors Table
CREATE TABLE donors (
    donor_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    city_or_area VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Staff Table
CREATE TABLE staff (
    staff_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('staff', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Appointments Table
CREATE TABLE appointments (
    appointment_id SERIAL PRIMARY KEY,
    donor_id INT NOT NULL REFERENCES donors(donor_id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'rejected', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Donations Table
CREATE TABLE donations (
    donation_id SERIAL PRIMARY KEY,
    donor_id INT NOT NULL REFERENCES donors(donor_id) ON DELETE CASCADE,
    appointment_id INT REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    donation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📂 Project Structure

```text
Blood-Donation-MS/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # PostgreSQL connection pool
│   │   ├── controllers/
│   │   │   ├── appointmentController.js
│   │   │   ├── donationController.js
│   │   │   ├── donorController.js
│   │   │   └── staffController.js
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verification & RBAC middleware
│   │   │   └── errorHandler.js       # Global 404 & 500 error handler
│   │   ├── routes/
│   │   │   ├── appointmentRoutes.js
│   │   │   ├── donationRoutes.js
│   │   │   ├── donorRoutes.js
│   │   │   └── staffRoutes.js
│   │   ├── utils/
│   │   │   └── validate.js           # Validation rules & standardized response helpers
│   │   ├── app.js                    # Express app configuration & middlewares
│   │   └── server.js                 # HTTP server entry point
│   ├── .env                          # Backend environment variables
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js              # Axios instance with auth interceptor
│   │   │   ├── donorApi.js           # Donor HTTP requests
│   │   │   └── staffApi.js           # Staff HTTP requests
│   │   ├── components/
│   │   │   ├── Common.jsx            # Reusable UI alerts, cards, and buttons
│   │   │   ├── Navbar.jsx            # Dynamic navigation header
│   │   │   ├── ProtectedRoute.jsx    # Route guard based on authentication & roles
│   │   │   └── StatusBadge.jsx       # Color-coded appointment status pills
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Authentication state & persistent token storage
│   │   ├── pages/
│   │   │   ├── AuthPages.jsx         # Donor/Staff Login & Register forms
│   │   │   ├── DonorPages.jsx        # Dashboard, Book Appointment, History, Profile
│   │   │   ├── Home.jsx              # Landing page
│   │   │   └── StaffPages.jsx        # Staff Dashboard & Appointment Queue
│   │   ├── App.jsx                   # React Router route registry
│   │   ├── main.jsx                  # React DOM root entry
│   │   └── styles.css                # Custom styling system
│   ├── .env                          # Frontend environment variables
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) (v14 or higher)
- `git` installed on your machine

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/MasterCodes24/Blood-Donation-MS-v2.git
cd Blood-Donation-MS-v2
```

---

### Step 2: Database Setup
1. Open your PostgreSQL terminal (`psql`) or a GUI tool like pgAdmin / DBeaver:
   ```sql
   CREATE DATABASE blood_donation_db;
   ```
2. Connect to `blood_donation_db` and execute the SQL statements from the [Database Schema](#-database-schema) section above.

---

### Step 3: Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables by editing `.env`:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://<username>:<password>@localhost:5432/blood_donation_db
   JWT_SECRET=your_super_secret_jwt_key
   CLIENT_URL=http://localhost:5173
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will run on `http://localhost:5000`.*

---

### Step 4: Frontend Setup
1. In a new terminal, navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure frontend environment variables in `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to the printed local URL (typically `http://localhost:5173`).

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Port the Express server listens on | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/blood_donation_db` |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens | `bloodDonation_secure_secret_key` |
| `CLIENT_URL` | Frontend origin permitted by CORS | `http://localhost:5173` |

### Frontend (`frontend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL pointing to the backend API | `http://localhost:5000/api` |

---

## 📡 API Endpoints

All responses follow a consistent JSON format:
- **Success**: `{ "success": true, "message": "...", "data": { ... } }`
- **Error**: `{ "success": false, "message": "..." }`

### 🩸 Donor Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/donors/register` | Public | Register a new blood donor |
| `POST` | `/api/donors/login` | Public | Donor login (returns JWT token) |
| `GET` | `/api/donors/me` | Donor | Retrieve profile of the logged-in donor |
| `PUT` | `/api/donors/me` | Donor | Update phone, blood group, or city/area |

### 📅 Appointment Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/appointments` | Donor | Request a new donation appointment |
| `GET` | `/api/appointments/me` | Donor | Get all appointments booked by the donor |

### 🩸 Donation History Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/donations/me` | Donor | Fetch verified completed donation records |

### 🏥 Staff & Admin Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/staff/register` | Public | Register staff or admin account |
| `POST` | `/api/staff/login` | Public | Staff/Admin login (returns JWT token) |
| `GET` | `/api/staff/appointments` | Staff / Admin | View all appointments with donor info |
| `PATCH` | `/api/staff/appointments/:id/approve` | Staff / Admin | Change status from `requested` to `approved` |
| `PATCH` | `/api/staff/appointments/:id/reject` | Staff / Admin | Change status from `requested` to `rejected` |
| `PATCH` | `/api/staff/appointments/:id/complete`| Staff / Admin | Mark appointment `completed` and record donation |

---

## 👥 Role-Based Access Control (RBAC)

| Feature / Resource | Public | Donor | Staff / Admin |
| :--- | :---: | :---: | :---: |
| View Home & Landing Info | ✅ | ✅ | ✅ |
| Register & Login | ✅ | ✅ | ✅ |
| Book & Track Personal Appointments | ❌ | ✅ | ❌ |
| Update Donor Profile | ❌ | ✅ | ❌ |
| View Personal Donation History | ❌ | ✅ | ❌ |
| View All Donor Appointments | ❌ | ❌ | ✅ |
| Approve / Reject Appointments | ❌ | ❌ | ✅ |
| Complete Appointment & Record Donation | ❌ | ❌ | ✅ |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/NewFeature`).
3. Commit your Changes (`git commit -m 'Add NewFeature'`).
4. Push to the Branch (`git push origin feature/NewFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
