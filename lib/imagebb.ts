/**
 * ImgBB avatar hosting.
 *
 * Files picked from the device are always sent as `FormData` with
 * `method: "POST"`; the public URL ImgBB returns is what gets stored on the
 * user record so the navbar and every dashboard can render the same photo.
 */

const IMAGEBB_UPLOAD_URL = "https://api.imgbb.com/1/upload"

/** Largest image we accept from the picker (ImgBB allows more, 10 MB is plenty). */
const MAX_FILE_SIZE = 10 * 1024 * 1024

/** Thrown for configuration, validation and upload failures — the message is user facing. */
export class ImageUploadError extends Error {}

/** Rejects non-images and oversized files before we spend time uploading them. */
function assertImageFile(file: File): void {
  if (!file.type.startsWith("image/")) {
    throw new ImageUploadError("Please choose an image file (JPG, PNG, WEBP…).")
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new ImageUploadError("Image must be 10 MB or smaller.")
  }
}

/**
 * Uploads one image file to ImgBB and resolves with its public URL.
 *
 * @example
 * const url = await uploadToImageBB(file) // "https://i.ibb.co/…/photo.jpg"
 */
export async function uploadToImageBB(file: File): Promise<string> {
  const key = process.env.NEXT_PUBLIC_IMAGEBB_API_KEY
  if (!key) {
    throw new ImageUploadError("Image upload is not configured (missing API key).")
  }

  assertImageFile(file)

  const formData = new FormData()
  formData.append("image", file)

  let response: Response
  try {
    response = await fetch(`${IMAGEBB_UPLOAD_URL}?key=${encodeURIComponent(key)}`, {
      method: "POST",
      body: formData,
    })
  } catch {
    throw new ImageUploadError("Could not reach the image host. Check your connection and try again.")
  }

  const payload = (await response.json().catch(() => null)) as {
    data?: { display_url?: string; url?: string }
    error?: { message?: string }
  } | null

  const url = payload?.data?.display_url ?? payload?.data?.url
  if (!response.ok || !url) {
    throw new ImageUploadError(payload?.error?.message ?? "Upload failed. Please try again.")
  }

  return url
}
