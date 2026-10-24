CREATE TABLE Donors (
    donor_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL UNIQUE,
    blood_group VARCHAR(5) NOT NULL,
    city_or_area VARCHAR(100) NOT NULL,

    CONSTRAINT donors_blood_group_check
        CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'))
);


CREATE TABLE Appointments (
    appointment_id SERIAL PRIMARY KEY,
    donor_id INTEGER NOT NULL,
    appointment_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'requested',

    CONSTRAINT appointments_donor_fk
        FOREIGN KEY (donor_id)
        REFERENCES Donors(donor_id)
        ON DELETE CASCADE,

    CONSTRAINT appointments_status_check
        CHECK (status IN ('requested', 'approved', 'rejected', 'completed', 'cancelled'))
);


CREATE TABLE Donations (
    donation_id SERIAL PRIMARY KEY,
    donor_id INTEGER NOT NULL,
    appointment_id INTEGER NOT NULL,
    donation_date DATE NOT NULL,

    CONSTRAINT donations_donor_fk
        FOREIGN KEY (donor_id)
        REFERENCES Donors(donor_id)
        ON DELETE CASCADE,

    CONSTRAINT donations_appointment_fk
        FOREIGN KEY (appointment_id)
        REFERENCES Appointments(appointment_id)
        ON DELETE CASCADE
);


CREATE TABLE Staff (
    staff_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,

    CONSTRAINT staff_role_check
        CHECK (role IN ('staff', 'admin'))
);