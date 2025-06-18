"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Upload, X, User, Crop } from "lucide-react"
import ImageCropper from "./image-cropper"
import { uploadStudentPhoto } from "@/lib/supabase/storage"

interface PhotoUploadProps {
  photoUrl?: string
  onPhotoChange: (photoUrl: string | null) => void
  disabled?: boolean
  studentId?: string
}

export default function PhotoUpload({ photoUrl, onPhotoChange, disabled, studentId }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(photoUrl || null)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB")
      return
    }

    // Create preview URL and show cropper
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setOriginalImageUrl(result)
      setShowCropper(true)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = async (croppedImageUrl: string) => {
    try {
      setIsUploading(true)
      
      // Convert base64 to File object
      const response = await fetch(croppedImageUrl)
      const blob = await response.blob()
      const file = new File([blob], "student-photo.jpg", { type: "image/jpeg" })
      
      // Upload to Supabase
      const uploadedUrl = await uploadStudentPhoto(file, studentId || 'temp')
      
      if (uploadedUrl) {
        setPreviewUrl(uploadedUrl)
        onPhotoChange(uploadedUrl)
        toast.success("Photo uploaded successfully!")
      } else {
        throw new Error("Failed to upload photo")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload photo")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemovePhoto = () => {
    setPreviewUrl(null)
    setOriginalImageUrl(null)
    onPhotoChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCropPhoto = () => {
    if (originalImageUrl) {
      setShowCropper(true)
    } else {
      toast.error("No original image available for cropping")
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <Label>Student Photo</Label>
      <div className="flex flex-col items-center space-y-4">
        {/* Photo Preview */}
        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
          {previewUrl ? (
            <div className="relative w-full h-full">
              <img 
                src={previewUrl} 
                alt="Student photo preview" 
                className="w-full h-full object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ) : (
            <div className="text-center">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-sm text-gray-500 mt-2">No photo selected</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!disabled && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleUploadClick}
              disabled={isUploading}
              className="flex items-center space-x-2"
            >
              <Upload size={16} />
              <span>{isUploading ? 'Uploading...' : previewUrl ? 'Change Photo' : 'Upload Photo'}</span>
            </Button>
            
            {previewUrl && originalImageUrl && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCropPhoto}
                className="flex items-center space-x-2"
              >
                <Crop size={16} />
                <span>Crop</span>
              </Button>
            )}
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {/* Helper Text */}
        <p className="text-xs text-gray-500 text-center">
          Supported formats: JPG, PNG, GIF<br />
          Maximum size: 5MB
        </p>
      </div>

      {/* Image Cropper Modal */}
      {originalImageUrl && (
        <ImageCropper
          src={originalImageUrl}
          isOpen={showCropper}
          onClose={() => setShowCropper(false)}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  )
}