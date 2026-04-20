import Link from "next/link"
import MonthForm from "../../components/month-form"

export default function NewMonthPage() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Uusi kuukausi</h1>
        </div>
        <Link href="/" className="rounded-xl border px-4 py-2 text-sm font-medium">
          Takaisin
        </Link>
      </div>

      <MonthForm />
    </main>
  )
}