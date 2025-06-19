"use client"

import type React from "react"

import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import PhotoUpload from "@/components/photo-upload"
import { 
  studentFormSchema, 
  type StudentData, 
  formatDateToComponents, 
  parseComponentsToDate, 
  isDateObject, 
  isDateComponents 
} from "@/lib/form-schemas"
import { 
  FORM_CLASSES, 
  FORM_SECTIONS, 
  BLOOD_GROUPS
} from "@/lib/constants"

interface StudentFormProps {
  onSubmit: (data: StudentData) => void
  onCancel: () => void
  initialData?: StudentData | null
}

export default function StudentForm({ onSubmit, onCancel, initialData }: StudentFormProps) {
  const [accepted, setAccepted] = useState(!!initialData)
  const [calendarOpen, setCalendarOpen] = useState(false)

  // No longer need years array for Calendar component

  // Create safe default values with Date object support
  const getDefaultDateOfBirth = (): Date | null => {
    if (!initialData?.dateOfBirth) return null
    
    if (isDateObject(initialData.dateOfBirth)) {
      return initialData.dateOfBirth
    }
    
    if (isDateComponents(initialData.dateOfBirth)) {
      return parseComponentsToDate(
        initialData.dateOfBirth.day,
        initialData.dateOfBirth.month,
        initialData.dateOfBirth.year
      )
    }
    
    return null
  }

  const defaultValues: Omit<StudentData, 'dateOfBirth'> & { dateOfBirth: Date | null } = {
    name: initialData?.name || "",
    class: initialData?.class || "",
    section: initialData?.section || "",
    dateOfBirth: getDefaultDateOfBirth(),
    admissionNo: initialData?.admissionNo || "",
    bloodGroup: initialData?.bloodGroup || "",
    contactNo: initialData?.contactNo || "",
    address: initialData?.address || "",
    photoUrl: initialData?.photoUrl || "",
    id: initialData?.id,
  }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }: { value: Omit<StudentData, 'dateOfBirth'> & { dateOfBirth: Date | null } }) => {
      if (!accepted) {
        alert("Please accept that the information is true and correct")
        return
      }
      
      // Convert Date back to string components for compatibility
      const submissionData: StudentData = {
        ...value,
        dateOfBirth: value.dateOfBirth ? formatDateToComponents(value.dateOfBirth) : { day: "", month: "", year: "" }
      }
      
      onSubmit(submissionData)
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: studentFormSchema,
    },
  })

  // Memoize photo change handler
  const handlePhotoChange = useCallback((photoUrl: string | null) => {
    form.setFieldValue("photoUrl", photoUrl || "")
  }, [form])

  // Memoize checkbox change handler
  const handleAcceptedChange = useCallback((checked: boolean) => {
    setAccepted(checked)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-xl">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Student Information Form</CardTitle>
            <CardDescription className="text-gray-600">Please fill the relevant information carefully</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }}
              className="space-y-6"
            >
              <form.Field name="photoUrl">
                {(field) => (
                  <div className="flex justify-center">
                    <PhotoUpload
                      photoUrl={field.state.value || ""}
                      onPhotoChange={handlePhotoChange}
                      studentId={initialData?.id || ""}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field
                name="name"
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter student's full name"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      aria-invalid={field.state.meta.errors.length > 0}
                      aria-describedby={field.state.meta.errors.length > 0 ? "name-error" : undefined}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600" role="alert" aria-live="polite">
                        {typeof field.state.meta.errors[0] === 'string' 
                          ? field.state.meta.errors[0] 
                          : field.state.meta.errors[0]?.message || 'Invalid input'}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="class"
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="class">Class</Label>
                    <Select value={field.state.value} onValueChange={field.handleChange}>
                      <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        {FORM_CLASSES.map((cls) => (
                          <SelectItem key={cls} value={cls}>
                            Class {cls}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600" role="alert" aria-live="polite">
                        {typeof field.state.meta.errors[0] === 'string' 
                          ? field.state.meta.errors[0] 
                          : field.state.meta.errors[0]?.message || 'Invalid input'}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="section"
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="section">Section</Label>
                    <Select value={field.state.value} onValueChange={field.handleChange}>
                      <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                      <SelectContent>
                        {FORM_SECTIONS.map((section) => (
                          <SelectItem key={section} value={section}>
                            Section {section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600" role="alert" aria-live="polite">
                        {typeof field.state.meta.errors[0] === 'string' 
                          ? field.state.meta.errors[0] 
                          : field.state.meta.errors[0]?.message || 'Invalid input'}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="dateOfBirth">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="dateOfBirth"
                          className="w-full justify-between font-normal bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          aria-invalid={field.state.meta.errors.length > 0}
                          aria-describedby={field.state.meta.errors.length > 0 ? "dateOfBirth-error" : undefined}
                        >
                          {field.state.value 
                            ? field.state.value.toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })
                            : "Select date of birth"
                          }
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.state.value || undefined}
                          onSelect={(date) => {
                            field.handleChange(date || null)
                            setCalendarOpen(false)
                          }}
                          captionLayout="dropdown"
                          fromYear={1950}
                          toYear={new Date().getFullYear()}
                          defaultMonth={field.state.value || new Date(2010, 0)}
                          className="rounded-lg border shadow-sm"
                        />
                      </PopoverContent>
                    </Popover>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600" role="alert" aria-live="polite" id="dateOfBirth-error">
                        {typeof field.state.meta.errors[0] === 'string' 
                          ? field.state.meta.errors[0] 
                          : field.state.meta.errors[0]?.message || 'Invalid date'}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="admissionNo"
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="admissionNo">Admission No *</Label>
                    <Input
                      id="admissionNo"
                      placeholder="Enter admission number"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600" role="alert" aria-live="polite">
                        {typeof field.state.meta.errors[0] === 'string' 
                          ? field.state.meta.errors[0] 
                          : field.state.meta.errors[0]?.message || 'Invalid input'}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="bloodGroup">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Select value={field.state.value} onValueChange={field.handleChange}>
                      <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select Blood Group" />
                      </SelectTrigger>
                      <SelectContent>
                        {BLOOD_GROUPS.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>

              <form.Field
                name="contactNo"
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="contactNo">Contact No *</Label>
                    <Input
                      id="contactNo"
                      placeholder="Enter mobile number (e.g., 9876543210)"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600" role="alert" aria-live="polite">
                        {typeof field.state.meta.errors[0] === 'string' 
                          ? field.state.meta.errors[0] 
                          : field.state.meta.errors[0]?.message || 'Invalid input'}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="address"
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter complete address"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600" role="alert" aria-live="polite">
                        {typeof field.state.meta.errors[0] === 'string' 
                          ? field.state.meta.errors[0] 
                          : field.state.meta.errors[0]?.message || 'Invalid input'}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="accept"
                  checked={accepted}
                  onCheckedChange={(checked) => handleAcceptedChange(checked as boolean)}
                />
                <Label htmlFor="accept" className="text-sm text-gray-600">
                  I accept that the above information is true and correct
                </Label>
              </div>

              <div className="flex justify-end pt-4">
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button 
                      type="submit" 
                      disabled={!canSubmit || isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 w-full text-white font-semibold text-lg py-2 rounded-md shadow disabled:opacity-50"
                    >
                      {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}