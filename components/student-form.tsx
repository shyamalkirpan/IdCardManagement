"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import PhotoUpload from "@/components/photo-upload"
import type { StudentData } from "@/app/page"

interface StudentFormProps {
  onSubmit: (data: StudentData) => void
  onCancel: () => void
  initialData?: StudentData | null
}

export default function StudentForm({ onSubmit, onCancel, initialData }: StudentFormProps) {
  const [formData, setFormData] = useState<StudentData>({
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
  })

  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        class: initialData.class,
        section: initialData.section,
        dateOfBirth: initialData.dateOfBirth,
        admissionNo: initialData.admissionNo,
        bloodGroup: initialData.bloodGroup,
        contactNo: initialData.contactNo,
        address: initialData.address,
        photoUrl: initialData.photoUrl,
        id: initialData.id,
      })
      setAccepted(true)
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!accepted) {
      alert("Please accept that the information is true and correct")
      return
    }
    onSubmit(formData)
  }

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
            <form onSubmit={handleSubmit} className="space-y-6">
              <PhotoUpload
                photoUrl={formData.photoUrl}
                onPhotoChange={(photoUrl) => setFormData({ ...formData, photoUrl: photoUrl || "" })}
                studentId={initialData?.id || formData.admissionNo}
              />

              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Type here ..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Select
                  value={formData.section}
                  onValueChange={(value) => setFormData({ ...formData, section: value })}
                >
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
              </div>

              <div className="space-y-2">
                <Label>Date of Birth *</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.dateOfBirth.day}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        dateOfBirth: { ...formData.dateOfBirth, day: value },
                      })
                    }
                  >
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

                  <Select
                    value={formData.dateOfBirth.month}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        dateOfBirth: { ...formData.dateOfBirth, month: value },
                      })
                    }
                  >
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

                  <Select
                    value={formData.dateOfBirth.year}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        dateOfBirth: { ...formData.dateOfBirth, year: value },
                      })
                    }
                  >
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="admissionNo">Admission No *</Label>
                <Input
                  id="admissionNo"
                  placeholder="Type here ..."
                  value={formData.admissionNo}
                  onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
                  required
                  className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select
                  value={formData.bloodGroup}
                  onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
                >
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

              <div className="space-y-2">
                <Label htmlFor="contactNo">Contact No *</Label>
                <Input
                  id="contactNo"
                  placeholder="Type here ..."
                  value={formData.contactNo}
                  onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                  required
                  className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Type here ..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

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
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full text-white font-semibold text-lg py-2 rounded-md shadow">
                  SUBMIT
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
