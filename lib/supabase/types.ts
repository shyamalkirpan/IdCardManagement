export interface StudentData {
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

export interface StudentFormData {
  name: string
  class: string
  section: string
  dateOfBirth: {
    day: string
    month: string
    year: string
  }
  admissionNo: string
  bloodGroup: string
  contactNo: string
  address: string
  photoUrl?: string
}

export const transformToDatabase = (formData: StudentFormData): Omit<StudentData, 'id' | 'created_at' | 'updated_at'> => ({
  name: formData.name,
  class: formData.class,
  section: formData.section,
  date_of_birth_day: formData.dateOfBirth.day,
  date_of_birth_month: formData.dateOfBirth.month,
  date_of_birth_year: formData.dateOfBirth.year,
  admission_no: formData.admissionNo,
  blood_group: formData.bloodGroup,
  contact_no: formData.contactNo,
  address: formData.address,
  photo_url: formData.photoUrl,
})

export const transformFromDatabase = (dbData: StudentData): StudentFormData => ({
  name: dbData.name,
  class: dbData.class,
  section: dbData.section,
  dateOfBirth: {
    day: dbData.date_of_birth_day,
    month: dbData.date_of_birth_month,
    year: dbData.date_of_birth_year,
  },
  admissionNo: dbData.admission_no,
  bloodGroup: dbData.blood_group,
  contactNo: dbData.contact_no,
  address: dbData.address,
  photoUrl: dbData.photo_url,
})