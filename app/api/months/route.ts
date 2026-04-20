import { NextResponse } from "next/server"
import { createMonthEntry, getAllMonths } from "../../lib/storage"
import { monthEntrySchema } from "../../lib/validations"

export const runtime = "nodejs"

export async function GET() {
  try {
    const months = await getAllMonths()
    return NextResponse.json(months)
  } catch (error) {
    console.error("GET /api/months failed:", error)
    return NextResponse.json(
      { error: "Tietojen haku epäonnistui" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = monthEntrySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Virheellinen syöte",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      )
    }

    const created = await createMonthEntry(parsed.data)

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("POST /api/months failed:", error)
    return NextResponse.json(
      { error: "Tallennus epäonnistui" },
      { status: 500 }
    )
  }
}