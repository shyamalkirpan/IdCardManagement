"use client"

import { useState, useRef, useCallback } from "react"
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import "react-image-crop/dist/ReactCrop.css"

interface ImageCropperProps {
  src: string
  isOpen: boolean
  onClose: () => void
  onCropComplete: (croppedImageUrl: string) => void
}

// Passport photo aspect ratio is 3:4 (width:height)
const PASSPORT_ASPECT_RATIO = 3 / 4

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}

export default function ImageCropper({ src, isOpen, onClose, onCropComplete }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, PASSPORT_ASPECT_RATIO))
  }, [])

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      toast.error("Please select a crop area")
      return
    }

    setIsProcessing(true)
    
    try {
      const image = imgRef.current
      const canvas = canvasRef.current
      const crop = completedCrop

      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("No 2D context")
      }

      // Set canvas size to passport photo dimensions
      // Standard passport photo: 2x2 inches at 300 DPI = 600x600 pixels
      // But we maintain 3:4 ratio, so 450x600 pixels
      const passportWidth = 450
      const passportHeight = 600
      
      canvas.width = passportWidth
      canvas.height = passportHeight

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        passportWidth,
        passportHeight
      )

      // Convert canvas to blob and create URL
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Failed to process image")
          setIsProcessing(false)
          return
        }

        const croppedImageUrl = URL.createObjectURL(blob)
        onCropComplete(croppedImageUrl)
        setIsProcessing(false)
        onClose()
      }, "image/jpeg", 0.9)

    } catch (error) {
      console.error("Error cropping image:", error)
      toast.error("Failed to crop image")
      setIsProcessing(false)
    }
  }, [completedCrop, onCropComplete, onClose])

  const handleCancel = () => {
    setCrop(undefined)
    setCompletedCrop(undefined)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Crop Photo to Passport Size</DialogTitle>
          <p className="text-sm text-gray-600">
            Adjust the crop area to create a passport-sized photo (3:4 ratio). 
            Position the head and shoulders within the frame.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={PASSPORT_ASPECT_RATIO}
              className="max-w-full max-h-96"
            >
              <img
                ref={imgRef}
                alt="Crop preview"
                src={src}
                onLoad={onImageLoad}
                className="max-w-full max-h-96 object-contain"
              />
            </ReactCrop>
          </div>

          {/* Passport Photo Guidelines */}
          <div className="bg-blue-50 p-4 rounded-lg text-sm">
            <h4 className="font-semibold text-blue-800 mb-2">Passport Photo Guidelines:</h4>
            <ul className="text-blue-700 space-y-1 text-xs">
              <li>• Head should be centered and take up 70-80% of the frame</li>
              <li>• Face should be looking directly at the camera</li>
              <li>• Neutral expression with mouth closed</li>
              <li>• Eyes should be open and clearly visible</li>
              <li>• Plain background preferred</li>
            </ul>
          </div>

          {/* Hidden canvas for processing */}
          <canvas
            ref={canvasRef}
            className="hidden"
          />
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={getCroppedImg} 
            disabled={!completedCrop || isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? "Processing..." : "Apply Crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}