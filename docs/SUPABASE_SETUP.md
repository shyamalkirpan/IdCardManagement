# Supabase Setup Guide

## 1. Supabase Project Setup

### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key (already configured in `.env.local`)

### Database Schema Setup
Run the following SQL in the Supabase SQL Editor:

```sql
-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(10) PRIMARY KEY DEFAULT ('STU' || LPAD(nextval('students_id_seq')::text, 4, '0')),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sequence for auto-incrementing student IDs
CREATE SEQUENCE IF NOT EXISTS students_id_seq START 1;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON students
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_admission_no ON students(admission_no);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at);

-- Insert some sample data (optional)
INSERT INTO students (name, class, section, date_of_birth_day, date_of_birth_month, date_of_birth_year, admission_no, blood_group, contact_no, address) VALUES
('John Doe', '10th', 'A', '15', '08', '2008', 'ADM2024001', 'O+', '+1234567890', '123 Main Street, City, State'),
('Jane Smith', '9th', 'B', '22', '05', '2009', 'ADM2024002', 'A+', '+1234567891', '456 Oak Avenue, City, State'),
('Mike Johnson', '11th', 'A', '03', '12', '2007', 'ADM2024003', 'B+', '+1234567892', '789 Pine Road, City, State');
```

## 2. Row Level Security (RLS) Setup

For this student ID app, we'll set up basic RLS policies:

```sql
-- Enable RLS on students table
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Allow public read access (since this is a demo app)
CREATE POLICY "Allow public read access" ON students
FOR SELECT USING (true);

-- Allow public insert access (for creating new students)
CREATE POLICY "Allow public insert access" ON students
FOR INSERT WITH CHECK (true);

-- Allow public update access (for editing student information)
CREATE POLICY "Allow public update access" ON students
FOR UPDATE USING (true);

-- Allow public delete access (if needed for admin functions)
CREATE POLICY "Allow public delete access" ON students
FOR DELETE USING (true);
```

**Note**: In a production environment, you would want to implement proper authentication and more restrictive RLS policies.

## 3. Environment Variables

Ensure your `.env.local` file has the correct values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Testing the Setup

You can test the database connection by running the development server:

```bash
bun run dev
```

The application should now:
- Connect directly to Supabase
- Save student data to the database
- Retrieve and display student data
- Maintain data persistence across browser sessions

## 5. Additional Supabase Features

### Real-time Subscriptions (Optional)
To enable real-time updates, you can add subscriptions:

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Subscribe to changes
const subscription = supabase
  .channel('students')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'students'
  }, (payload) => {
    console.log('Change received!', payload)
  })
  .subscribe()
```

### Storage (For Student Photo Uploads)
To enable file storage for student photos:

1. Go to Storage in Supabase dashboard
2. Create a bucket named `student-photos` with public access enabled
3. Set appropriate policies for the bucket:

```sql
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
```

4. Run the photo column migration script:

```sql
-- Add photo_url column to existing students table
ALTER TABLE students ADD COLUMN photo_url TEXT;
```

Or use the provided migration script at `scripts/add-photo-column.sql`

### Authentication (For Future Admin Features)
To add authentication:

1. Enable desired auth providers in Supabase dashboard
2. Uncomment the auth redirect logic in `middleware.ts`
3. Create login/logout components

## 6. Database Management

### Backup
Supabase automatically backs up your database. You can also create manual backups from the dashboard.

### Monitoring
Use the Supabase dashboard to monitor:
- Database performance
- API usage
- Real-time connections
- Storage usage

### Scaling
Supabase automatically scales with your usage. Monitor your project's metrics and upgrade your plan as needed.

## 7. Production Considerations

### Environment Variables
Set the same environment variables in your production deployment platform.

### Database Performance
- Monitor query performance in the Supabase dashboard
- Add additional indexes if needed based on usage patterns
- Consider database optimization for large datasets

### Security
- Review and tighten RLS policies for production
- Implement proper authentication
- Enable additional security features in Supabase dashboard

### Monitoring
- Set up alerts for database usage
- Monitor API rate limits
- Track error rates and performance metrics