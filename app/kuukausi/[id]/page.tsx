"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { calculateMonth } from "../../lib/calculations"
import { MonthEntry } from "../../lib/data"
import MonthAttachments from "../../components/month-attachments"

type PageProps = {
  params: Promise<{ id: string }>
}

function formatCurrency(value: number | undefined | null) {
  const safeValue = Number.isFinite(value) ? Number(value) : 0

  return new Intl.NumberFormat("fi-FI", {
    style: "currency",
    currency: "EUR",
  }).format(safeValue)
}

function monthName(year: number, month: number) {
  return new Intl.DateTimeFormat("fi-FI", { month: "long" }).format(
    new Date(year, month - 1, 1)
  )
}

export default function MonthDetailsPage({ params }: PageProps) {
  const [month, setMonth] = useState<MonthEntry | null>(null)
  const [monthId, setMonthId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    params.then((p) => setMonthId(p.id))
  }, [params])

  useEffect(() => {
    if (!monthId) return

    async function fetchMonth() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/months/${monthId}`)

        if (!response.ok) {
          throw new Error("Kuukautta ei löytynyt")
        }

        const data = await response.json()
        setMonth(data)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Kuukauden lataus epäonnistui"
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchMonth()
  }, [monthId])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files

    if (!files || !monthId) return

    setUploading(true)
    setError(null)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()

        formData.append("file", file)

        const response = await fetch(`/api/months/${monthId}/files`, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const payload = await response.json()
          throw new Error(payload.error || "Tiedoston lataus epäonnistui")
        }
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      setRefreshKey((current) => current + 1)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Tiedoston lataus epäonnistui"
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <p>Ladataan...</p>
      </main>
    )
  }

  if (!month || !monthId) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <p className="text-red-600">
          {error || "Kuukautta ei löytynyt"}
        </p>

        <Link href="/" className="mt-4 inline-block text-blue-600 underline">
          Takaisin
        </Link>
      </main>
    )
  }

  const calc = calculateMonth({
    serviceSalesGross: month.serviceSalesGross ?? 0,
    productSalesGross: month.productSalesGross ?? 0,
    rentGross: month.rentGross ?? 0,
    productCommissionGross: month.productCommissionGross ?? 0,
    vatRate: month.vatRate ?? 25.5,
    rentVat: month.rentVat ?? 0,
    accountantVat: month.accountantVat ?? 0,
    otherDeductibleVat: month.otherDeductibleVat ?? 0,
    payoutsReceived: month.payoutsReceived ?? 0,
  })

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">
            {monthName(month.year, month.month)} {month.year}
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Kuukauden tiedot ja liitteet
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/kuukausi/${monthId}/tulosta`}
            target="_blank"
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Tulosta yhteenveto
          </Link>

          <Link
            href="/"
            className="rounded-xl border px-4 py-2 text-sm font-medium"
          >
            Takaisin
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Yhteenveto</h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-gray-500">Palvelumyynti</p>
              <p className="text-lg font-semibold">
                {formatCurrency(month.serviceSalesGross)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Tuotemyynti</p>
              <p className="text-lg font-semibold">
                {formatCurrency(month.productSalesGross)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Vuokra</p>
              <p className="text-lg font-semibold">
                {formatCurrency(month.rentGross)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Tuotemyyntiprovisio</p>
              <p className="text-lg font-semibold">
                {formatCurrency(month.productCommissionGross)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Omavero-luvut</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-900">
                Vero kotimaan myynneistä 25,5 %
              </p>
              <p className="mt-2 text-2xl font-bold text-green-700">
                {formatCurrency(calc.totalSalesVat)}
              </p>
            </div>

            <div className="rounded-xl border bg-white p-4">
              <p className="text-sm font-medium text-gray-700">
                Vähennettävä vero
              </p>
              <p className="mt-2 text-2xl font-bold">
                {formatCurrency(calc.totalDeductibleVat)}
              </p>
            </div>

            <div className="rounded-xl border bg-white p-4">
              <p className="text-sm font-medium text-gray-700">
                Maksettava vero
              </p>
              <p className="mt-2 text-2xl font-bold">
                {formatCurrency(calc.vatPayable)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Lisää liitteitä</h2>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              Lataa tiedostoja
            </span>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.docx,application/pdf,image/jpeg,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full rounded-xl border px-3 py-2 text-sm"
            />

            <p className="mt-2 text-xs text-gray-500">
              Sallitut tiedostot: PDF, JPG, JPEG ja DOCX
            </p>
          </label>

          {uploading && (
            <p className="mt-3 text-sm text-gray-600">Ladataan tiedostoja...</p>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </section>

        <MonthAttachments key={refreshKey} monthId={monthId} />

        {month.notes && (
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Muistiinpanot</h2>

            <p className="whitespace-pre-wrap text-sm text-gray-700">
              {month.notes}
            </p>
          </section>
        )}
      </div>
    </main>
  )
}