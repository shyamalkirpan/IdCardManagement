import { createClient } from './client'

export const uploadStudentPhoto = async (file: File, studentId: string): Promise<string | null> => {
  const supabase = createClient()
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${studentId}-${Date.now()}.${fileExt}`
  const filePath = `student-photos/${fileName}`

  try {
    // Upload file to storage
    const { data, error } = await supabase.storage
      .from('student-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('student-photos')
      .getPublicUrl(filePath)

    return publicUrlData.publicUrl
  } catch (error) {
    console.error('Error uploading photo:', error)
    return null
  }
}

export const deleteStudentPhoto = async (photoUrl: string): Promise<boolean> => {
  const supabase = createClient()
  
  try {
    // Extract file path from URL
    const urlParts = photoUrl.split('/')
    const filePath = urlParts.slice(-2).join('/')
    
    const { error } = await supabase.storage
      .from('student-photos')
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting photo:', error)
    return false
  }
}