import { NextResponse } from "next/server"
import fs from "node:fs/promises"
import path from "node:path"

export const runtime = "nodejs"

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".docx"]

function sanitizeFilename(filename: string) {
  return filename
    .replace(/[^\w.\-åäöÅÄÖ]/g, "_")
    .replace(/_+/g, "_")
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const uploadDir = path.join(process.cwd(), "data", "attachments", id)

    try {
      await fs.access(uploadDir)
    } catch {
      return NextResponse.json([])
    }

    const filenames = await fs.readdir(uploadDir)

    const files = filenames.map((filename) => ({
      filename,
      url: `/api/months/${id}/files/${encodeURIComponent(filename)}`,
    }))

    return NextResponse.json(files)
  } catch (error) {
    console.error("File list failed:", error)

    return NextResponse.json(
      { error: "Liitteiden haku epäonnistui" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Tiedostoa ei löytynyt" },
        { status: 400 }
      )
    }

    const extension = path.extname(file.name).toLowerCase()

    const isAllowedMime = allowedMimeTypes.includes(file.type)
    const isAllowedExtension = allowedExtensions.includes(extension)

    if (!isAllowedMime && !isAllowedExtension) {
      return NextResponse.json(
        { error: "Sallitut tiedostotyypit ovat PDF, JPG, JPEG ja DOCX" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), "data", "attachments", id)
    await fs.mkdir(uploadDir, { recursive: true })

    const safeFilename = `${Date.now()}-${sanitizeFilename(file.name)}`
    const filePath = path.join(uploadDir, safeFilename)

    await fs.writeFile(filePath, buffer)

    return NextResponse.json({
      filename: safeFilename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
    })
  } catch (error) {
    console.error("File upload failed:", error)

    return NextResponse.json(
      { error: "Tiedoston tallennus epäonnistui" },
      { status: 500 }
    )
  }
}