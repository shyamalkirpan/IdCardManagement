-- =====================================================================
-- Student ID Card System - Database Initialization Script
-- =====================================================================
-- This script will completely reinitialize the database for the
-- Student ID Card System. Run this in the Supabase SQL Editor.
-- 
-- WARNING: This will DROP existing tables and data!
-- =====================================================================

-- Drop existing objects if they exist (for reinitialization)
-- Note: Use DO block to handle cases where table doesn't exist
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
-- 6. Enable Row Level Security (RLS)
-- =====================================================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 7. Create RLS Policies
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
-- 8. Insert sample data
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
    ),
    (
        'Sarah Wilson',
        '12th',
        'C',
        '18',
        '09',
        '2006',
        'ADM2024004',
        'AB+',
        '+1234567893',
        '321 Elm Street, Springfield, IL 62704'
    ),
    (
        'David Brown',
        '8th',
        'D',
        '07',
        '11',
        '2010',
        'ADM2024005',
        'O-',
        '+1234567894',
        '654 Maple Drive, Springfield, IL 62705'
    );

-- =====================================================================
-- 9. Create views for common queries (optional)
-- =====================================================================
-- View for students with formatted birth dates
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
    created_at,
    updated_at
FROM students;

-- View for current academic year students (example)
CREATE OR REPLACE VIEW current_students AS
SELECT *
FROM students
WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());

-- =====================================================================
-- 10. Grant necessary permissions
-- =====================================================================
-- Grant usage on sequence to authenticated and anon roles
GRANT USAGE ON SEQUENCE students_id_seq TO anon, authenticated;

-- Grant permissions on table
GRANT ALL ON students TO anon, authenticated;

-- Grant permissions on views
GRANT SELECT ON students_formatted TO anon, authenticated;
GRANT SELECT ON current_students TO anon, authenticated;

-- =====================================================================
-- 11. Verification queries
-- =====================================================================
-- Uncomment these to verify the setup after running the script

-- Check table structure
-- \d students

-- Verify sample data
-- SELECT COUNT(*) as total_students FROM students;

-- Test ID generation
-- SELECT id, name, admission_no FROM students ORDER BY created_at;

-- Verify indexes
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'students';

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies WHERE tablename = 'students';

-- =====================================================================
-- Success Message
-- =====================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Student ID Card System database initialization completed successfully!';
    RAISE NOTICE '📊 Sample data: % students inserted', (SELECT COUNT(*) FROM students);
    RAISE NOTICE '🔑 Next student ID will be: %', ('STU' || LPAD((currval('students_id_seq') + 1)::text, 4, '0'));
    RAISE NOTICE '🚀 Ready to use with the Student ID Card application!';
END $$;