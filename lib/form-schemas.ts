import { z } from "zod"
import { 
  VALIDATION_LIMITS, 
  CONTACT_NUMBER_REGEX, 
  BIRTH_YEAR_RANGE,
  FORM_CLASSES,
  FORM_SECTIONS,
  BLOOD_GROUPS 
} from "./constants"

// Date utility functions
export const formatDateToComponents = (date: Date | null | undefined): { day: string; month: string; year: string } => {
  if (!date || isNaN(date.getTime())) {
    return { day: "", month: "", year: "" }
  }
  
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear().toString()
  
  return { day, month, year }
}

export const parseComponentsToDate = (day: string, month: string, year: string): Date | null => {
  if (!day || !month || !year) {
    return null
  }
  
  const dayNum = parseInt(day)
  const monthNum = parseInt(month)
  const yearNum = parseInt(year)
  
  if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
    return null
  }
  
  const date = new Date(yearNum, monthNum - 1, dayNum)
  
  // Validate that the date is actually valid
  if (date.getDate() !== dayNum || date.getMonth() !== monthNum - 1 || date.getFullYear() !== yearNum) {
    return null
  }
  
  return date
}

export const isValidDateInRange = (date: Date): boolean => {
  const year = date.getFullYear()
  return year >= BIRTH_YEAR_RANGE.MIN && year <= BIRTH_YEAR_RANGE.MAX
}

// Custom date validation - supports both Date objects and legacy string components
const dateOfBirthSchema = z.union([
  // New Date object schema
  z.date({
    required_error: "Date of birth is required",
    invalid_type_error: "Please enter a valid date",
  }).refine((date) => {
    return isValidDateInRange(date)
  }, {
    message: `Date of birth must be between ${BIRTH_YEAR_RANGE.MIN} and ${BIRTH_YEAR_RANGE.MAX}`,
  }),
  // Legacy string components schema (for backward compatibility)
  z.object({
    day: z.string()
      .min(1, "Day is required")
      .regex(/^(0[1-9]|[12][0-9]|3[01])$/, "Day must be between 01-31"),
    month: z.string()
      .min(1, "Month is required")
      .regex(/^(0[1-9]|1[0-2])$/, "Month must be between 01-12"),
    year: z.string()
      .min(1, "Year is required")
      .refine((year) => {
        const yearNum = parseInt(year)
        return yearNum >= BIRTH_YEAR_RANGE.MIN && yearNum <= BIRTH_YEAR_RANGE.MAX
      }, `Year must be between ${BIRTH_YEAR_RANGE.MIN} and ${BIRTH_YEAR_RANGE.MAX}`),
  }).refine((date) => {
    // Skip validation if any field is empty
    if (!date || !date.day || !date.month || !date.year) {
      return true // Let individual field validations handle empty values
    }
    
    // Validate that the date is actually valid
    const parsedDate = parseComponentsToDate(date.day, date.month, date.year)
    return parsedDate !== null
  }, {
    message: "Please enter a valid date",
    path: ["day"] // Show error on day field
  })
])

export const studentFormSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(VALIDATION_LIMITS.NAME_MAX_LENGTH, `Name must be less than ${VALIDATION_LIMITS.NAME_MAX_LENGTH} characters`)
    .regex(/^[a-zA-Z\s.'-]+$/, "Name can only contain letters, spaces, dots, apostrophes, and hyphens"),
  
  class: z.string()
    .min(1, "Class is required")
    .refine((val) => FORM_CLASSES.includes(val as any), "Please select a valid class"),
  
  section: z.string()
    .min(1, "Section is required")
    .refine((val) => FORM_SECTIONS.includes(val as any), "Please select a valid section"),
  
  dateOfBirth: dateOfBirthSchema,
  
  admissionNo: z.string()
    .min(1, "Admission number is required")
    .max(VALIDATION_LIMITS.ADMISSION_NO_MAX_LENGTH, `Admission number must be less than ${VALIDATION_LIMITS.ADMISSION_NO_MAX_LENGTH} characters`)
    .regex(/^[A-Za-z0-9\-/]+$/, "Admission number can only contain letters, numbers, hyphens, and forward slashes"),
  
  bloodGroup: z.string()
    .optional()
    .refine((val) => !val || BLOOD_GROUPS.includes(val as any), "Please select a valid blood group"),
  
  contactNo: z.string()
    .min(1, "Contact number is required")
    .min(VALIDATION_LIMITS.CONTACT_MIN_LENGTH, `Contact number must be at least ${VALIDATION_LIMITS.CONTACT_MIN_LENGTH} digits`)
    .max(VALIDATION_LIMITS.CONTACT_MAX_LENGTH, `Contact number must be less than ${VALIDATION_LIMITS.CONTACT_MAX_LENGTH} characters`)
    .regex(CONTACT_NUMBER_REGEX, "Please enter a valid Indian mobile number (e.g., +91 9876543210 or 9876543210)"),
  
  address: z.string()
    .min(1, "Address is required")
    .max(VALIDATION_LIMITS.ADDRESS_MAX_LENGTH, `Address must be less than ${VALIDATION_LIMITS.ADDRESS_MAX_LENGTH} characters`)
    .min(10, "Address must be at least 10 characters long"),
  
  photoUrl: z.string().optional(),
  
  id: z.string().optional(),
})

export type StudentFormData = z.infer<typeof studentFormSchema>

// Type for the consolidated student data (matches app/page.tsx)
export interface StudentData {
  id?: string
  name: string
  class: string
  section: string
  dateOfBirth: Date | {
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

// Helper type guards
export const isDateObject = (dateOfBirth: Date | { day: string; month: string; year: string }): dateOfBirth is Date => {
  return dateOfBirth instanceof Date
}

export const isDateComponents = (dateOfBirth: Date | { day: string; month: string; year: string }): dateOfBirth is { day: string; month: string; year: string } => {
  return typeof dateOfBirth === 'object' && dateOfBirth !== null && !isDateObject(dateOfBirth)
}