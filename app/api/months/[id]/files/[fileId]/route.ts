import { NextResponse } from "next/server"
import { getFileFromDisk, deleteFileFromMonth } from "../../../../../lib/storage"

export const runtime = "nodejs"

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string; fileId: string }>
  }
) {
  try {
    const { fileId } = await params
    const searchParams = new URL(request.url).searchParams
    const fileName = searchParams.get("fileName")

    if (!fileName) {
      return NextResponse.json(
        { error: "Tiedostonimi puuttuu" },
        { status: 400 }
      )
    }

    const buffer = await getFileFromDisk(fileName)

    if (!buffer) {
      return NextResponse.json(
        { error: "Tiedostoa ei löytynyt" },
        { status: 404 }
      )
    }

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error("GET /api/months/[id]/files/[fileId] failed:", error)
    return NextResponse.json(
      { error: "Tiedoston lataus epäonnistui" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string; fileId: string }>
  }
) {
  try {
    const { id, fileId } = await params

    const deleted = await deleteFileFromMonth(id, fileId)

    if (!deleted) {
      return NextResponse.json(
        { error: "Tiedostoa ei löytynyt" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/months/[id]/files/[fileId] failed:", error)
    return NextResponse.json(
      { error: "Tiedoston poisto epäonnistui" },
      { status: 500 }
    )
  }
}
