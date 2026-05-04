import { NextResponse } from "next/server"
import fs from "node:fs/promises"
import path from "node:path"

export const runtime = "nodejs"

function getContentType(filename: string) {
  const ext = path.extname(filename).toLowerCase()

  if (ext === ".pdf") return "application/pdf"
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg"
  if (ext === ".docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  }

  return "application/octet-stream"
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; filename: string }> }
) {
  try {
    const { id, filename } = await context.params

    const safeFilename = path.basename(decodeURIComponent(filename))
    const filePath = path.join(
      process.cwd(),
      "data",
      "attachments",
      id,
      safeFilename
    )

    const file = await fs.readFile(filePath)

    return new NextResponse(file, {
      headers: {
        "Content-Type": getContentType(safeFilename),
        "Content-Disposition": `inline; filename="${safeFilename}"`,
      },
    })
  } catch (error) {
    console.error("File read failed:", error)

    return NextResponse.json(
      { error: "Tiedostoa ei löytynyt" },
      { status: 404 }
    )
  }
}