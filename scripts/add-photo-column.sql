-- =====================================================================
-- Add photo_url column to students table
-- =====================================================================
-- This script adds photo storage functionality to the existing
-- Student ID Card System. Run this in the Supabase SQL Editor.
-- =====================================================================

-- Add photo_url column to students table
ALTER TABLE students 
ADD COLUMN photo_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN students.photo_url IS 'URL to student photo stored in Supabase Storage';

-- =====================================================================
-- Create Storage Bucket for Student Photos
-- =====================================================================
-- Note: This needs to be run in the Supabase Storage section or via the dashboard

-- Create the storage bucket (run this in Storage > Buckets)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('student-photos', 'student-photos', true);

-- =====================================================================
-- Storage Policies
-- =====================================================================
-- Allow public read access to photos
-- CREATE POLICY "Public read access for student photos" 
-- ON storage.objects FOR SELECT 
-- USING (bucket_id = 'student-photos');

-- Allow authenticated users to upload photos
-- CREATE POLICY "Authenticated users can upload photos" 
-- ON storage.objects FOR INSERT 
-- WITH CHECK (bucket_id = 'student-photos' AND auth.role() = 'authenticated');

-- Allow authenticated users to update photos
-- CREATE POLICY "Authenticated users can update photos" 
-- ON storage.objects FOR UPDATE 
-- USING (bucket_id = 'student-photos' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete photos
-- CREATE POLICY "Authenticated users can delete photos" 
-- ON storage.objects FOR DELETE 
-- USING (bucket_id = 'student-photos' AND auth.role() = 'authenticated');

-- =====================================================================
-- Update the formatted view to include photo_url
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
-- Success Message
-- =====================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Photo column added successfully to students table!';
    RAISE NOTICE '📸 Students can now upload photos to their ID cards';
    RAISE NOTICE '🔧 Remember to create the storage bucket "student-photos" in Supabase Storage';
    RAISE NOTICE '🔒 Storage policies need to be configured manually in the Supabase dashboard';
END $$;