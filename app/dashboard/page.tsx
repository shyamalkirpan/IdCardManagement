"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { transformFromDatabase, transformToDatabase, type DatabaseStudentData } from "@/lib/supabase/types"
import type { StudentData } from "@/lib/form-schemas"
import { useAuth } from "@/lib/auth/context"
import StudentForm from "@/components/student-form"
import IdCardPreview from "@/components/id-card-preview"
import { Eye, Pencil, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

type SortField = 'name' | 'admissionNo' | 'class' | 'section' | 'contactNo'
type SortOrder = 'asc' | 'desc'

export default function Dashboard() {
  const [students, setStudents] = useState<StudentData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const { user } = useAuth()

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        const transformedData = data.map(record => ({
          ...transformFromDatabase(record),
          id: record.id
        }))
        setStudents(transformedData)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      toast.error("Failed to fetch student records")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student record?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success("Student record deleted successfully")
      fetchStudents() // Refresh the list
    } catch (error) {
      console.error("Error deleting student:", error)
      toast.error("Failed to delete student record")
    }
  }

  const handleEdit = (student: StudentData) => {
    setSelectedStudent(student)
    setShowForm(true)
  }

  const handlePreview = (student: StudentData) => {
    setSelectedStudent(student)
    setShowPreview(true)
  }

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
        setSelectedStudent({ ...transformedData, id: result.id })
        setShowForm(false)
        setShowPreview(true)
        toast.success(data.id ? "Student information updated successfully!" : "Student information saved successfully!")
        fetchStudents() // Refresh the list
      }
    } catch (error) {
      console.error("Error saving student data:", error)
      toast.error("Error saving student information")
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const filteredStudents = students
    .filter(student => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.section.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (sortField === 'class') {
        // Special handling for class sorting (1st, 2nd, etc.)
        const aNum = parseInt(aValue)
        const bNum = parseInt(bValue)
        return sortOrder === 'asc' ? aNum - bNum : bNum - aNum
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      return 0
    })

  if (showForm) {
    return (
      <StudentForm 
        onSubmit={handleFormSubmit} 
        onCancel={() => setShowForm(false)} 
        initialData={selectedStudent} 
      />
    )
  }

  if (showPreview && selectedStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Student ID Card Preview</h1>
            <p className="text-gray-600">Student information has been saved</p>
          </div>

          <IdCardPreview studentData={selectedStudent} />

          <div className="flex justify-center gap-4 mt-8">
            <Button variant="outline" onClick={() => setShowForm(true)}>
              Edit Information
            </Button>
            <Button onClick={() => {
              setShowPreview(false)
              setSelectedStudent(null)
            }} className="bg-blue-600 hover:bg-blue-700">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-gray-800">Student Records</CardTitle>
              <Button onClick={() => {
                setSelectedStudent(null)
                setShowForm(true)
              }} className="bg-blue-600 hover:bg-blue-700">
                Add New Student
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search by name, admission number, class, or section..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('name')}
                          className="flex items-center gap-1"
                        >
                          Name {getSortIcon('name')}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('admissionNo')}
                          className="flex items-center gap-1"
                        >
                          Admission No {getSortIcon('admissionNo')}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('class')}
                          className="flex items-center gap-1"
                        >
                          Class {getSortIcon('class')}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('section')}
                          className="flex items-center gap-1"
                        >
                          Section {getSortIcon('section')}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('contactNo')}
                          className="flex items-center gap-1"
                        >
                          Contact {getSortIcon('contactNo')}
                        </Button>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                            {student.photoUrl ? (
                              <img
                                src={student.photoUrl}
                                alt={student.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.admissionNo}</TableCell>
                        <TableCell>{student.class}</TableCell>
                        <TableCell>{student.section}</TableCell>
                        <TableCell>{student.contactNo}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handlePreview(student)}
                              className="h-8 w-8"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(student)}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => student.id && handleDelete(student.id)}
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredStudents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No student records found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 