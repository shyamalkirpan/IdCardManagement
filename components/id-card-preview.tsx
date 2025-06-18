import { Card, CardContent } from "@/components/ui/card"
import type { StudentData } from "@/app/page"

interface IdCardPreviewProps {
  studentData: StudentData
}

export default function IdCardPreview({ studentData }: IdCardPreviewProps) {
  const formatDate = (dateObj: { day: string; month: string; year: string }) => {
    return `${dateObj.day}/${dateObj.month}/${dateObj.year}`
  }

  return (
    <div className="flex justify-center">
      <Card className="w-96 bg-gradient-to-br from-blue-600 to-purple-700 text-white shadow-2xl">
        <CardContent className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">STUDENT ID CARD</h2>
            <div className="w-16 h-16 bg-white rounded-full mx-auto mt-3 flex items-center justify-center overflow-hidden">
              {studentData.photoUrl ? (
                <img 
                  src={studentData.photoUrl} 
                  alt={studentData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl text-blue-600 font-bold">{studentData.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>

          {/* Student Information */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold">Name:</span>
              <span className="text-right flex-1 ml-2">{studentData.name}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold">Class:</span>
              <span>{studentData.class}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold">Section:</span>
              <span>{studentData.section}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold">Admission No:</span>
              <span>{studentData.admissionNo}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold">DOB:</span>
              <span>{formatDate(studentData.dateOfBirth)}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold">Blood Group:</span>
              <span>{studentData.bloodGroup}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold">Contact:</span>
              <span>{studentData.contactNo}</span>
            </div>

            <div className="pt-2">
              <span className="font-semibold">Address:</span>
              <p className="text-xs mt-1 leading-relaxed">{studentData.address}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/30 text-center">
            <p className="text-xs opacity-80">Valid for Academic Year 2024-25</p>
            {studentData.id && <p className="text-xs opacity-60 mt-1">ID: {studentData.id}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
