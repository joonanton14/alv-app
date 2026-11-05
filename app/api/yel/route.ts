import { NextResponse } from "next/server"
import { saveYelForYear } from "../../lib/storage"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const year = Number(body.year)
    const amount = Number(body.amount)

    if (
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 2100 ||
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      return NextResponse.json(
        { error: "Tarkista vuosi ja YEL-summa." },
        { status: 400 }
      )
    }

    const entry = await saveYelForYear(year, amount)

    return NextResponse.json({ success: true, entry })
  } catch {
    return NextResponse.json(
      { error: "YEL-tietojen tallentaminen epäonnistui." },
      { status: 500 }
    )
  }
}