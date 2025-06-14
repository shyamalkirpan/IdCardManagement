"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import StudentForm from "@/components/student-form"
import IdCardPreview from "@/components/id-card-preview"

export interface StudentData {
  id?: string
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
}

export default function Home() {
  const [showForm, setShowForm] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [studentData, setStudentData] = useState<StudentData | null>(null)

  const handleFormSubmit = (data: StudentData) => {
    setStudentData(data)
    setShowForm(false)
    setShowPreview(true)
  }

  const handleSaveToDatabase = async () => {
    if (!studentData) return

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      })

      if (response.ok) {
        const savedStudent = await response.json()
        setStudentData(savedStudent)
        alert("Student data saved successfully!")
      } else {
        alert("Failed to save student data")
      }
    } catch (error) {
      console.error("Error saving student data:", error)
      alert("Error saving student data")
    }
  }

  const handleReset = () => {
    setShowForm(false)
    setShowPreview(false)
    setStudentData(null)
  }

  if (showPreview && studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Student ID Card Preview</h1>
            <p className="text-gray-600">Review the information and save to database</p>
          </div>

          <IdCardPreview studentData={studentData} />

          <div className="flex justify-center gap-4 mt-8">
            <Button variant="outline" onClick={() => setShowForm(true)}>
              Edit Information
            </Button>
            <Button onClick={handleSaveToDatabase} className="bg-green-600 hover:bg-green-700">
              Save to Database
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Start Over
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (showForm) {
    return <StudentForm onSubmit={handleFormSubmit} onCancel={() => setShowForm(false)} initialData={studentData} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Student ID Card System</CardTitle>
          <CardDescription>Create and manage student identification cards</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => setShowForm(true)} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
            Create New Student ID
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
