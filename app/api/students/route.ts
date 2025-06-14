import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for demo purposes
// In a real application, you would use a proper database
const students: Array<any> = []
let nextId = 1

export async function POST(request: NextRequest) {
  try {
    const studentData = await request.json()

    // Generate a unique ID
    const newStudent = {
      ...studentData,
      id: `STU${String(nextId).padStart(4, "0")}`,
      createdAt: new Date().toISOString(),
    }

    students.push(newStudent)
    nextId++

    return NextResponse.json(newStudent, { status: 201 })
  } catch (error) {
    console.error("Error saving student:", error)
    return NextResponse.json({ error: "Failed to save student data" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json(students)
}
