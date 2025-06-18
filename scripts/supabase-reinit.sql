-- =====================================================================
-- Student ID Card System - Complete Database Reinitialization Script
-- =====================================================================
-- This script will completely reinitialize the database for the
-- Student ID Card System. Run this in the Supabase SQL Editor.
-- 
-- WARNING: This will DROP existing tables and data!
-- =====================================================================

-- Drop existing objects if they exist (for reinitialization)
DO $$ 
BEGIN
    -- Drop trigger if it exists
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_students_updated_at') THEN
        DROP TRIGGER update_students_updated_at ON students;
    END IF;
    
    -- Drop table if it exists
    DROP TABLE IF EXISTS students CASCADE;
    
    -- Drop function if it exists
    DROP FUNCTION IF EXISTS update_updated_at_column();
    
    -- Drop sequence if it exists
    DROP SEQUENCE IF EXISTS students_id_seq;
    
    -- Drop view if it exists
    DROP VIEW IF EXISTS students_formatted;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Continue if any errors occur during cleanup
        RAISE NOTICE 'Cleanup completed (some objects may not have existed)';
END $$;

-- =====================================================================
-- 1. Create sequence for auto-incrementing student IDs
-- =====================================================================
CREATE SEQUENCE students_id_seq START 1;

-- =====================================================================
-- 2. Create students table
-- =====================================================================
CREATE TABLE students (
    -- Primary key with auto-generated format: STU0001, STU0002, etc.
    id VARCHAR(10) PRIMARY KEY DEFAULT ('STU' || LPAD(nextval('students_id_seq')::text, 4, '0')),
    
    -- Required fields
    name VARCHAR(255) NOT NULL,
    admission_no VARCHAR(50) NOT NULL UNIQUE,
    contact_no VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    
    -- Optional student information
    class VARCHAR(10),
    section VARCHAR(5),
    
    -- Date of birth stored as separate components for form compatibility
    date_of_birth_day VARCHAR(2),
    date_of_birth_month VARCHAR(2),
    date_of_birth_year VARCHAR(4),
    
    -- Blood group
    blood_group VARCHAR(5),
    
    -- Photo URL for student photo
    photo_url TEXT,
    
    -- System timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_class CHECK (class IN ('1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th')),
    CONSTRAINT chk_section CHECK (section IN ('A', 'B', 'C', 'D', 'E')),
    CONSTRAINT chk_blood_group CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    CONSTRAINT chk_dob_day CHECK (date_of_birth_day ~ '^(0[1-9]|[12][0-9]|3[01])$'),
    CONSTRAINT chk_dob_month CHECK (date_of_birth_month ~ '^(0[1-9]|1[0-2])$'),
    CONSTRAINT chk_dob_year CHECK (date_of_birth_year ~ '^(19|20)[0-9]{2}$')
);

-- =====================================================================
-- 3. Create updated_at trigger function
-- =====================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================================
-- 4. Create trigger for automatic updated_at updates
-- =====================================================================
CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON students
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- 5. Create indexes for performance
-- =====================================================================
-- Index on admission_no for fast unique lookups
CREATE INDEX idx_students_admission_no ON students(admission_no);

-- Index on name for search functionality
CREATE INDEX idx_students_name ON students(name);

-- Index on created_at for chronological queries
CREATE INDEX idx_students_created_at ON students(created_at DESC);

-- Composite index for class and section filtering
CREATE INDEX idx_students_class_section ON students(class, section);

-- =====================================================================
-- 6. Create formatted view for easier data access
-- =====================================================================
CREATE OR REPLACE VIEW students_formatted AS
SELECT 
    id,
    name,
    class,
    section,
    CONCAT(date_of_birth_day, '/', date_of_birth_month, '/', date_of_birth_year) AS date_of_birth,
    admission_no,
    blood_group,
    contact_no,
    address,
    photo_url,
    created_at,
    updated_at
FROM students;

-- =====================================================================
-- 7. Enable Row Level Security (RLS)
-- =====================================================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 8. Create RLS Policies
-- =====================================================================
-- Note: These are permissive policies for demo purposes.
-- In production, implement proper authentication-based policies.

-- Allow public read access
CREATE POLICY "Allow public read access" ON students
    FOR SELECT 
    USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access" ON students
    FOR INSERT 
    WITH CHECK (true);

-- Allow public update access
CREATE POLICY "Allow public update access" ON students
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- Allow public delete access (for admin functions)
CREATE POLICY "Allow public delete access" ON students
    FOR DELETE 
    USING (true);

-- =====================================================================
-- 9. Create Storage Bucket for Student Photos
-- =====================================================================
-- Note: This needs to be run in the Storage section or via the dashboard
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-photos', 'student-photos', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- 10. Create Storage Policies
-- =====================================================================
-- Allow public read access to photos
CREATE POLICY "Public read access for student photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'student-photos');

-- Allow public upload of photos (for demo purposes)
CREATE POLICY "Public upload access for student photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'student-photos');

-- Allow public update of photos (for demo purposes)
CREATE POLICY "Public update access for student photos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'student-photos');

-- Allow public delete of photos (for demo purposes)
CREATE POLICY "Public delete access for student photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'student-photos');

-- =====================================================================
-- 11. Insert sample data
-- =====================================================================
INSERT INTO students (
    name, 
    class, 
    section, 
    date_of_birth_day, 
    date_of_birth_month, 
    date_of_birth_year, 
    admission_no, 
    blood_group, 
    contact_no, 
    address
) VALUES
    (
        'John Doe',
        '10th',
        'A',
        '15',
        '08',
        '2008',
        'ADM2024001',
        'O+',
        '+1234567890',
        '123 Main Street, Springfield, IL 62701'
    ),
    (
        'Jane Smith',
        '9th',
        'B',
        '22',
        '05',
        '2009',
        'ADM2024002',
        'A+',
        '+1234567891',
        '456 Oak Avenue, Springfield, IL 62702'
    ),
    (
        'Mike Johnson',
        '11th',
        'A',
        '03',
        '12',
        '2007',
        'ADM2024003',
        'B+',
        '+1234567892',
        '789 Pine Road, Springfield, IL 62703'
    );

-- =====================================================================
-- 12. Success verification
-- =====================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Database reinitialization completed successfully!';
    RAISE NOTICE '📊 Students table created with all constraints and indexes';
    RAISE NOTICE '🔄 Automatic updated_at trigger configured';
    RAISE NOTICE '🔒 RLS policies set up for public access';
    RAISE NOTICE '📸 Storage bucket "student-photos" created with public access';
    RAISE NOTICE '📝 Sample data inserted';
END $$; 