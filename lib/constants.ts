// Form Constants
export const FORM_CLASSES = [
  "1st", "2nd", "3rd", "4th", "5th", "6th", 
  "7th", "8th", "9th", "10th", "11th", "12th"
] as const

export const FORM_SECTIONS = ["A", "B", "C", "D", "E"] as const

export const BLOOD_GROUPS = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
] as const

// Generate days (01-31)
export const FORM_DAYS = Array.from({ length: 31 }, (_, i) => 
  String(i + 1).padStart(2, "0")
) as readonly string[]

// Generate months (01-12)
export const FORM_MONTHS = Array.from({ length: 12 }, (_, i) => 
  String(i + 1).padStart(2, "0")
) as readonly string[]

// Generate years (dynamic based on current year - reasonable range for students)
export const getFormYears = (): readonly string[] => {
  const currentYear = new Date().getFullYear()
  const startYear = currentYear - 25 // Students up to 25 years old
  const endYear = currentYear - 3   // Minimum 3 years old
  
  return Array.from({ length: startYear - endYear + 1 }, (_, i) => 
    String(startYear - i)
  )
}

// Validation constants
export const VALIDATION_LIMITS = {
  NAME_MAX_LENGTH: 100,
  ADMISSION_NO_MAX_LENGTH: 50,
  ADDRESS_MAX_LENGTH: 500,
  CONTACT_MIN_LENGTH: 10,
  CONTACT_MAX_LENGTH: 15,
} as const

// Contact number regex - more specific validation
export const CONTACT_NUMBER_REGEX = /^(\+91[-\s]?)?[6-9]\d{9}$/

// Birth year range for validation
export const BIRTH_YEAR_RANGE = {
  MIN: new Date().getFullYear() - 25,
  MAX: new Date().getFullYear() - 3,
} as const