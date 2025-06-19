import type { StudentData } from "../form-schemas"
import { formatDateToComponents, isDateObject, isDateComponents } from "../form-schemas"

// Database-specific interface (matches Supabase table structure)
export interface DatabaseStudentData {
  id?: string
  name: string
  class: string
  section: string
  date_of_birth_day: string
  date_of_birth_month: string
  date_of_birth_year: string
  admission_no: string
  blood_group: string
  contact_no: string
  address: string
  photo_url?: string
  created_at?: string
  updated_at?: string
}

export const transformToDatabase = (formData: StudentData): Omit<DatabaseStudentData, 'id' | 'created_at' | 'updated_at'> => {
  // Handle both Date objects and legacy string components
  let dateComponents: { day: string; month: string; year: string }
  
  if (isDateObject(formData.dateOfBirth)) {
    dateComponents = formatDateToComponents(formData.dateOfBirth)
  } else if (isDateComponents(formData.dateOfBirth)) {
    dateComponents = formData.dateOfBirth
  } else {
    dateComponents = { day: "", month: "", year: "" }
  }
  
  return {
    name: formData.name,
    class: formData.class,
    section: formData.section,
    date_of_birth_day: dateComponents.day,
    date_of_birth_month: dateComponents.month,
    date_of_birth_year: dateComponents.year,
    admission_no: formData.admissionNo,
    blood_group: formData.bloodGroup,
    contact_no: formData.contactNo,
    address: formData.address,
    photo_url: formData.photoUrl,
  }
}

export const transformFromDatabase = (dbData: DatabaseStudentData): StudentData => {
  // Return string components for backward compatibility
  // The form will handle conversion to Date object internally
  return {
    id: dbData.id,
    name: dbData.name,
    class: dbData.class,
    section: dbData.section,
    dateOfBirth: {
      day: dbData.date_of_birth_day || "",
      month: dbData.date_of_birth_month || "",
      year: dbData.date_of_birth_year || "",
    },
    admissionNo: dbData.admission_no,
    bloodGroup: dbData.blood_group,
    contactNo: dbData.contact_no,
    address: dbData.address,
    photoUrl: dbData.photo_url,
  }
}