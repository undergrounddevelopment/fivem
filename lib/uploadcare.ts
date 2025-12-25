// Uploadcare configuration
export const UPLOADCARE_PUBLIC_KEY = "c63461e0c698d7dd97e0"
export const UPLOADCARE_SECRET_KEY = "46c58438878bfbe4d889"

export interface UploadcareFile {
  uuid: string
  cdnUrl: string
  name: string
  size: number
  isImage: boolean
  mimeType: string
}

// Upload file to Uploadcare
export async function uploadToUploadcare(file: File): Promise<UploadcareFile | null> {
  try {
    const formData = new FormData()
    formData.append("UPLOADCARE_PUB_KEY", UPLOADCARE_PUBLIC_KEY)
    formData.append("UPLOADCARE_STORE", "auto")
    formData.append("file", file)

    const response = await fetch("https://upload.uploadcare.com/base/", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Upload failed")
    }

    const data = await response.json()
    const uuid = data.file

    return {
      uuid,
      cdnUrl: `https://ucarecdn.com/${uuid}/`,
      name: file.name,
      size: file.size,
      isImage: file.type.startsWith("image/"),
      mimeType: file.type,
    }
  } catch (error) {
    console.error("Uploadcare upload error:", error)
    return null
  }
}

// Delete file from Uploadcare
export async function deleteFromUploadcare(uuid: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.uploadcare.com/files/${uuid}/storage/`, {
      method: "DELETE",
      headers: {
        Authorization: `Uploadcare.Simple ${UPLOADCARE_PUBLIC_KEY}:${UPLOADCARE_SECRET_KEY}`,
        Accept: "application/vnd.uploadcare-v0.7+json",
      },
    })

    return response.ok
  } catch (error) {
    console.error("Uploadcare delete error:", error)
    return false
  }
}

// Get file info from Uploadcare
export async function getUploadcareFileInfo(uuid: string): Promise<any> {
  try {
    const response = await fetch(`https://api.uploadcare.com/files/${uuid}/`, {
      headers: {
        Authorization: `Uploadcare.Simple ${UPLOADCARE_PUBLIC_KEY}:${UPLOADCARE_SECRET_KEY}`,
        Accept: "application/vnd.uploadcare-v0.7+json",
      },
    })

    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error("Uploadcare info error:", error)
    return null
  }
}
