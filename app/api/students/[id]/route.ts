import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { transformToDatabase } from '@/lib/supabase/types';
import { studentFormSchema } from '@/lib/form-schemas';
import { sanitizeName, sanitizeAddress, sanitizeContactNumber, sanitizeAdmissionNumber } from '@/lib/auth/sanitize';

// PUT - Update a student
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentId = params.id;
    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
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

    // Transform data
    const dbData = transformToDatabase(sanitizedData);

    // Update with RLS automatically enforced (user can only update their own records)
    const { data, error } = await supabase
      .from('students')
      .update(dbData)
      .eq('id', studentId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Student not found or access denied' }, { status: 404 });
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a student
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentId = params.id;
    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    // Delete with RLS automatically enforced (only admins or owners can delete)
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Student not found or access denied' }, { status: 404 });
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}