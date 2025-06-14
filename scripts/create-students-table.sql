-- Create students table for storing student information
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    class VARCHAR(10),
    section VARCHAR(5),
    date_of_birth_day VARCHAR(2),
    date_of_birth_month VARCHAR(2),
    date_of_birth_year VARCHAR(4),
    admission_no VARCHAR(50) NOT NULL UNIQUE,
    blood_group VARCHAR(5),
    contact_no VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index on admission_no for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_admission_no ON students(admission_no);

-- Create index on name for search functionality
CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
