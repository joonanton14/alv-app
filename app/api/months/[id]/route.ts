import { NextResponse } from "next/server"
import { getAllMonths } from "../../../lib/storage"

export const runtime = "nodejs"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const months = await getAllMonths()
    const month = months.find((m) => m.id === id)

    if (!month) {
      return NextResponse.json({ error: "Kuukausi ei löytynyt" }, { status: 404 })
    }

    return NextResponse.json(month)
  } catch (error) {
    console.error("GET /api/months/[id] failed:", error)
    return NextResponse.json(
      { error: "Tiedon haku epäonnistui" },
      { status: 500 }
    )
  }
}
