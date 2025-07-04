"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import StudentForm from "@/components/student-form"
import IdCardPreview from "@/components/id-card-preview"
import { createClient } from "@/lib/supabase/client"
import { transformToDatabase, transformFromDatabase } from "@/lib/supabase/types"
import type { StudentData } from "@/lib/form-schemas"
import { useAuth } from "@/lib/auth/context"

function HomeContent() {
  const [showForm, setShowForm] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const { user } = useAuth()
  const searchParams = useSearchParams()

  // Check for create parameter from navbar
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setShowForm(true)
      // Clear the search param without causing a page refresh
      window.history.replaceState({}, '', '/')
    }
  }, [searchParams])

  const handleFormSubmit = async (data: StudentData) => {
    try {
      const supabase = createClient()
      const dbData = transformToDatabase(data)
      
      let result
      if (data.id) {
        // Update existing record
        const { data: updatedData, error } = await supabase
          .from('students')
          .update(dbData)
          .eq('id', data.id)
          .select()
          .single()
        
        if (error) throw error
        result = updatedData
      } else {
        // Insert new record - include user_id for RLS
        const { data: newData, error } = await supabase
          .from('students')
          .insert([{ ...dbData, user_id: user?.id }])
          .select()
          .single()
        
        if (error) throw error
        result = newData
      }

      if (result) {
        const transformedData = transformFromDatabase(result)
        setStudentData({ ...transformedData, id: result.id })
        setShowForm(false)
        setShowPreview(true)
        toast.success(data.id ? "Student information updated successfully!" : "Student information saved successfully!")
      }
    } catch (error) {
      console.error("Error saving student data:", error)
      toast.error("Error saving student information")
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
            <p className="text-gray-600">Student information has been saved</p>
          </div>

          <IdCardPreview studentData={studentData} />

          <div className="flex justify-center gap-4 mt-8">
            <Button variant="outline" onClick={() => setShowForm(true)}>
              Edit Information
            </Button>
            <Button onClick={handleReset} className="bg-blue-600 hover:bg-blue-700">
              Create New ID Card
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
        <CardContent className="text-center space-y-4">
          <Button onClick={() => setShowForm(true)} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
            Create New Student ID
          </Button>
          <Button 
            onClick={() => window.location.href = '/dashboard'} 
            variant="outline" 
            size="lg" 
            className="w-full"
          >
            View All Records
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}
