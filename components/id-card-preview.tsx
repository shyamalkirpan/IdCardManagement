import { Card, CardContent } from "@/components/ui/card"
import type { StudentData } from "@/lib/form-schemas"
import { School, Calendar, Phone, MapPin, Droplet, Hash } from "lucide-react"

interface IdCardPreviewProps {
  studentData: StudentData
}

export default function IdCardPreview({ studentData }: IdCardPreviewProps) {
  const formatDate = (dateObj: { day: string; month: string; year: string }) => {
    return `${dateObj.day}/${dateObj.month}/${dateObj.year}`
  }

  return (
    <div className="flex justify-center">
      <Card className="w-[400px] bg-blue-50 text-gray-800 shadow-lg rounded-lg overflow-hidden border-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">STUDENT IDENTIFICATION</h1>
              <p className="text-sm text-white/90 mt-1">Academic Year 2024-25</p>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <School className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Photo */}
          <div className="flex justify-center mb-6">
            <div className="w-28 h-36 bg-white rounded-lg overflow-hidden shadow-sm border border-blue-100">
              {studentData.photoUrl ? (
                <div className="w-full h-full flex items-center justify-center">
                  <img 
                    src={studentData.photoUrl} 
                    alt={studentData.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl text-blue-700 font-bold">{studentData.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Student Info */}
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">{studentData.name}</h2>
            </div>

            <div className="bg-white rounded-lg p-4 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Hash className="w-4 h-4 text-blue-600" />
                <span className="font-medium">{studentData.admissionNo}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <School className="w-4 h-4 text-blue-600" />
                <span>Class {studentData.class} - Section {studentData.section}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Droplet className="w-4 h-4 text-blue-600" />
                <span>Blood Group: {studentData.bloodGroup}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Date of Birth: {formatDate(studentData.dateOfBirth)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>{studentData.contactNo}</span>
              </div>
              <div className="flex items-start gap-2 text-gray-700">
                <MapPin className="w-4 h-4 text-blue-600 mt-1" />
                <span className="text-sm leading-relaxed">{studentData.address}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-center items-center pt-4 border-t border-blue-100">
              <div className="text-sm text-gray-600">
                {studentData.id && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">ID:</span>
                    <span>{studentData.id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
