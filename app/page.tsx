import Link from "next/link"
import MonthTable from "./components/month-table"
import SummaryCards from "./components/summary-cards"
import { getAllMonths } from "./lib/storage"

export default async function HomePage() {
  const months = await getAllMonths()

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">ALV-raportti</h1>
        </div>

        <Link
          href="/kuukausi/uusi"
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Lisää kuukausi
        </Link>
      </div>

      <div className="space-y-6">
        <SummaryCards months={months} />
        <MonthTable months={months} />
      </div>
    </main>
  )
}