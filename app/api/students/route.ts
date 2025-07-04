import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { transformToDatabase } from '@/lib/supabase/types';
import { studentFormSchema } from '@/lib/form-schemas';
import { sanitizeName, sanitizeAddress, sanitizeContactNumber, sanitizeAdmissionNumber } from '@/lib/auth/sanitize';

// GET - Fetch students for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch students with RLS automatically enforced
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new student
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    
    // Server-side validation using Zod schema
    const validationResult = studentFormSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const studentData = validationResult.data;

    // Additional server-side sanitization
    const sanitizedData = {
      ...studentData,
      name: sanitizeName(studentData.name),
      address: sanitizeAddress(studentData.address),
      contactNo: sanitizeContactNumber(studentData.contactNo),
      admissionNo: sanitizeAdmissionNumber(studentData.admissionNo),
    };

    // Transform and add user ownership
    const dbData = transformToDatabase(sanitizedData);
    const dataWithUser = { ...dbData, user_id: user.id };

    // Insert with RLS automatically enforced
    const { data, error } = await supabase
      .from('students')
      .insert([dataWithUser])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}