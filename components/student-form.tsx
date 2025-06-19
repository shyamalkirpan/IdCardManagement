"use client"

import type React from "react"

import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import PhotoUpload from "@/components/photo-upload"
import type { StudentData } from "@/app/page"
import { studentFormSchema, type StudentFormData } from "@/lib/form-schemas"

interface StudentFormProps {
  onSubmit: (data: StudentData) => void
  onCancel: () => void
  initialData?: StudentData | null
}

export default function StudentForm({ onSubmit, onCancel, initialData }: StudentFormProps) {
  const [accepted, setAccepted] = useState(!!initialData)

  const form = useForm({
    defaultValues: {
      name: initialData?.name || "",
      class: initialData?.class || "",
      section: initialData?.section || "",
      dateOfBirth: initialData?.dateOfBirth || {
        day: "",
        month: "",
        year: "",
      },
      admissionNo: initialData?.admissionNo || "",
      bloodGroup: initialData?.bloodGroup || "",
      contactNo: initialData?.contactNo || "",
      address: initialData?.address || "",
      photoUrl: initialData?.photoUrl || "",
      id: initialData?.id,
    } as StudentFormData,
    onSubmit: async ({ value }) => {
      if (!accepted) {
        alert("Please accept that the information is true and correct")
        return
      }
      onSubmit(value as StudentData)
    },
    validatorAdapter: zodValidator(),
  })

  const classes = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"]
  const sections = ["A", "B", "C", "D", "E"]
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"))
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))
  const years = Array.from({ length: 50 }, (_, i) => String(2024 - i))

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
                  <PhotoUpload
                    photoUrl={field.state.value || ""}
                    onPhotoChange={(photoUrl) => field.handleChange(photoUrl || "")}
                    studentId={initialData?.id || form.getFieldValue("admissionNo")}
                  />
                )}
              </form.Field>

              <form.Field
                name="name"
                validators={{
                  onChange: studentFormSchema.shape.name,
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="Type here ..."
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="class"
                validators={{
                  onChange: studentFormSchema.shape.class,
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="class">Class</Label>
                    <Select value={field.state.value} onValueChange={field.handleChange}>
                      <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls} value={cls}>
                            {cls}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="section"
                validators={{
                  onChange: studentFormSchema.shape.section,
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="section">Section</Label>
                    <Select value={field.state.value} onValueChange={field.handleChange}>
                      <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map((section) => (
                          <SelectItem key={section} value={section}>
                            {section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <div className="space-y-2">
                <Label>Date of Birth *</Label>
                <div className="flex gap-2">
                  <form.Field
                    name="dateOfBirth.day"
                    validators={{
                      onChange: studentFormSchema.shape.dateOfBirth.shape.day,
                    }}
                  >
                    {(field) => (
                      <div>
                        <Select value={field.state.value} onValueChange={field.handleChange}>
                          <SelectTrigger className="w-20 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="DD" />
                          </SelectTrigger>
                          <SelectContent>
                            {days.map((day) => (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form.Field>

                  <form.Field
                    name="dateOfBirth.month"
                    validators={{
                      onChange: studentFormSchema.shape.dateOfBirth.shape.month,
                    }}
                  >
                    {(field) => (
                      <div>
                        <Select value={field.state.value} onValueChange={field.handleChange}>
                          <SelectTrigger className="w-20 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month} value={month}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form.Field>

                  <form.Field
                    name="dateOfBirth.year"
                    validators={{
                      onChange: studentFormSchema.shape.dateOfBirth.shape.year,
                    }}
                  >
                    {(field) => (
                      <div>
                        <Select value={field.state.value} onValueChange={field.handleChange}>
                          <SelectTrigger className="w-24 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="YY" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form.Field>
                </div>
                <form.Field name="dateOfBirth">
                  {(field) => (
                    field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                    )
                  )}
                </form.Field>
              </div>

              <form.Field
                name="admissionNo"
                validators={{
                  onChange: studentFormSchema.shape.admissionNo,
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="admissionNo">Admission No *</Label>
                    <Input
                      id="admissionNo"
                      placeholder="Type here ..."
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
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
                        {bloodGroups.map((group) => (
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
                validators={{
                  onChange: studentFormSchema.shape.contactNo,
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="contactNo">Contact No *</Label>
                    <Input
                      id="contactNo"
                      placeholder="Type here ..."
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="address"
                validators={{
                  onChange: studentFormSchema.shape.address,
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="Type here ..."
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="accept"
                  checked={accepted}
                  onCheckedChange={(checked) => setAccepted(checked as boolean)}
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