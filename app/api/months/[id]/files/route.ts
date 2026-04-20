import { NextResponse } from "next/server"
import { saveFileToDisk, addFileToMonth } from "../../../../lib/storage"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "Tiedosto puuttuu" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.includes("pdf")) {
      return NextResponse.json(
        { error: "Vain PDF-tiedostot ovat sallittuja" },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Tiedoston koko ylittää 10MB rajan" },
        { status: 400 }
      )
    }

    const buffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(buffer)

    const attachment = await saveFileToDisk(id, fileBuffer, file.name)
    const updated = await addFileToMonth(id, attachment)

    if (!updated) {
      return NextResponse.json(
        { error: "Kuukausi ei löytynyt" },
        { status: 404 }
      )
    }

    return NextResponse.json(attachment, { status: 201 })
  } catch (error) {
    console.error("POST /api/months/[id]/files failed:", error)
    return NextResponse.json(
      { error: "Tiedoston lataus epäonnistui" },
      { status: 500 }
    )
  }
}
