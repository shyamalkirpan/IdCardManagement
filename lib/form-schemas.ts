import { z } from "zod"

export const studentFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  class: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  dateOfBirth: z.object({
    day: z.string().min(1, "Day is required"),
    month: z.string().min(1, "Month is required"),
    year: z.string().min(1, "Year is required"),
  }),
  admissionNo: z.string().min(1, "Admission number is required").max(50, "Admission number must be less than 50 characters"),
  bloodGroup: z.string().optional(),
  contactNo: z.string()
    .min(1, "Contact number is required")
    .regex(/^[0-9+\-\s()]+$/, "Please enter a valid contact number"),
  address: z.string().min(1, "Address is required").max(500, "Address must be less than 500 characters"),
  photoUrl: z.string().optional(),
  id: z.string().optional(),
})

export type StudentFormData = z.infer<typeof studentFormSchema>