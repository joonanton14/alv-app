"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { calculateMonth } from "../lib/calculations"

type FormState = {
  year: string
  month: string
  serviceSalesGross: string
  productSalesGross: string
  rentGross: string
  productCommissionGross: string
  vatRate: string
  accountantVat: string
  otherDeductibleVat: string
  payoutsReceived: string
  notes: string
  attachments: string
}

const currentDate = new Date()

const initialState: FormState = {
  year: String(currentDate.getFullYear()),
  month: String(currentDate.getMonth() + 1),
  serviceSalesGross: "",
  productSalesGross: "",
  rentGross: "",
  productCommissionGross: "",
  vatRate: "25.5",
  accountantVat: "",
  otherDeductibleVat: "0",
  payoutsReceived: "",
  notes: "",
  attachments: "",
}

function euroInputProps() {
  return {
    type: "number",
    step: "0.01",
    min: "0",
  } as const
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fi-FI", {
    style: "currency",
    currency: "EUR",
  }).format(value)
}

export default function MonthForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(initialState)
  const [files, setFiles] = useState<FileList | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculation = useMemo(() => {
    const serviceSalesGross = Number(form.serviceSalesGross || 0)
    const productSalesGross = Number(form.productSalesGross || 0)
    const rentGross = Number(form.rentGross || 0)
    const productCommissionGross = Number(form.productCommissionGross || 0)
    const vatRate = Number(form.vatRate || 0)
    const accountantVat = Number(form.accountantVat || 0)
    const otherDeductibleVat = Number(form.otherDeductibleVat || 0)
    const payoutsReceived = Number(form.payoutsReceived || 0)

    return calculateMonth({
      serviceSalesGross,
      productSalesGross,
      rentGross,
      productCommissionGross,
      vatRate,
      rentVat: 0,
      accountantVat,
      otherDeductibleVat,
      payoutsReceived,
    })
  }, [form])

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/months", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year: Number(form.year),
          month: Number(form.month),
          serviceSalesGross: Number(form.serviceSalesGross || 0),
          productSalesGross: Number(form.productSalesGross || 0),
          rentGross: Number(form.rentGross || 0),
          productCommissionGross: Number(form.productCommissionGross || 0),
          vatRate: Number(form.vatRate || 0),
          rentVat: 0,
          accountantVat: Number(form.accountantVat || 0),
          otherDeductibleVat: Number(form.otherDeductibleVat || 0),
          payoutsReceived: Number(form.payoutsReceived || 0),
          notes: form.notes,
          attachments: form.attachments,
        }),
      })

      if (!response.ok) {
        const payload = await response.json()
        throw new Error(payload.error || "Tallennus epäonnistui")
      }

      const monthData = await response.json()
      const monthId = monthData.id

      // Upload files if any
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const formData = new FormData()
          formData.append("file", file)

          const fileResponse = await fetch(`/api/months/${monthId}/files`, {
            method: "POST",
            body: formData,
          })

          if (!fileResponse.ok) {
            const payload = await fileResponse.json()
            throw new Error(payload.error || "Tiedoston lataus epäonnistui")
          }
        }
      }

      router.push("/")
      router.refresh()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Tallennus epäonnistui"
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border bg-white p-6 shadow-sm"
      >
        <h2 className="text-xl font-semibold">Kuukausimerkintä</h2>
        <p className="mt-2 text-sm text-gray-600">
          Syötä raportin luvut tähän. Laskelmat näkyvät oikealla heti.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span>Vuosi</span>
            <input
              className="rounded-xl border px-3 py-2"
              value={form.year}
              onChange={(e) => updateField("year", e.target.value)}
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span>Kuukausi (1–12)</span>
            <input
              className="rounded-xl border px-3 py-2"
              value={form.month}
              onChange={(e) => updateField("month", e.target.value)}
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span>Palvelumyynti (sis. ALV)</span>
            <input
              {...euroInputProps()}
              className="rounded-xl border px-3 py-2"
              value={form.serviceSalesGross}
              onChange={(e) => updateField("serviceSalesGross", e.target.value)}
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span>Tuotemyynti yhteensä (sis. ALV)</span>
            <input
              {...euroInputProps()}
              className="rounded-xl border px-3 py-2"
              value={form.productSalesGross}
              onChange={(e) => updateField("productSalesGross", e.target.value)}
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span>Vuokran osuus (sis. ALV)</span>
            <input
              {...euroInputProps()}
              className="rounded-xl border px-3 py-2"
              value={form.rentGross}
              onChange={(e) => updateField("rentGross", e.target.value)}
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span>Tuotemyyntiprovisio (sis. ALV)</span>
            <input
              {...euroInputProps()}
              className="rounded-xl border px-3 py-2"
              value={form.productCommissionGross}
              onChange={(e) =>
                updateField("productCommissionGross", e.target.value)
              }
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span>ALV-kanta (%)</span>
            <input
              {...euroInputProps()}
              className="rounded-xl border px-3 py-2"
              value={form.vatRate}
              onChange={(e) => updateField("vatRate", e.target.value)}
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span>Kirjanpitäjän ALV</span>
            <input
              {...euroInputProps()}
              className="rounded-xl border px-3 py-2"
              value={form.accountantVat}
              onChange={(e) => updateField("accountantVat", e.target.value)}
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span>Muu vähennettävä ALV</span>
            <input
              {...euroInputProps()}
              className="rounded-xl border px-3 py-2"
              value={form.otherDeductibleVat}
              onChange={(e) =>
                updateField("otherDeductibleVat", e.target.value)
              }
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span>Maksetut tilitykset</span>
            <input
              {...euroInputProps()}
              className="rounded-xl border px-3 py-2"
              value={form.payoutsReceived}
              onChange={(e) => updateField("payoutsReceived", e.target.value)}
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4">
          <label className="grid gap-2 text-sm">
            <span>PDF-tiedostot</span>
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={(e) => setFiles(e.currentTarget.files)}
              className="rounded-xl border px-3 py-2"
            />
            <p className="text-xs text-gray-500">Voit ladata useita PDF-tiedostoja kerralla</p>
          </label>

          <label className="grid gap-2 text-sm">
            <span>Muistiinpanot</span>
            <textarea
              className="min-h-28 rounded-xl border px-3 py-2"
              placeholder="Mahdolliset huomiot kuukaudesta"
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
            />
          </label>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Tallennetaan..." : "Tallenna kuukausi ja tiedostot"}
          </button>
        </div>
      </form>

      <aside className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Laskelma ALV</h3>

        <div className="mt-4 space-y-4 text-sm">
          <div className="border-b pb-3">
            <p className="text-xs font-semibold text-gray-600 uppercase">Kerätty ALV</p>
            <div className="mt-2 space-y-1.5">
              <div className="flex justify-between">
                <p className="text-gray-500">Palvelumyynti ALV</p>
                <p className="font-medium">
                  {formatCurrency(Number(form.serviceSalesGross || 0) * (Number(form.vatRate || 25.5) / (100 + Number(form.vatRate || 25.5))))}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500">Tuotemyyntiprovisio ALV</p>
                <p className="font-medium">
                  {formatCurrency(Number(form.productCommissionGross || 0) * (Number(form.vatRate || 25.5) / (100 + Number(form.vatRate || 25.5))))}
                </p>
              </div>
            </div>
          </div>

          <div className="border-b pb-3">
            <div className="flex justify-between">
              <p className="text-gray-500">Kerätty ALV yhteensä</p>
              <p className="font-bold">
                {formatCurrency(calculation.totalSalesVat)}
              </p>
            </div>
          </div>

          <div className="border-b pb-3">
            <p className="text-xs font-semibold text-gray-600 uppercase">Vähennettävä ALV</p>
            <div className="mt-2 space-y-1.5">
              <div className="flex justify-between">
                <p className="text-gray-500">Vuokran ALV</p>
                <p className="font-medium">
                  {formatCurrency(Number(form.rentGross || 0) * (Number(form.vatRate || 25.5) / (100 + Number(form.vatRate || 25.5))))}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500">Kirjanpitäjän ALV</p>
                <p className="font-medium">
                  {formatCurrency(Number(form.accountantVat || 0))}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500">Muu ALV</p>
                <p className="font-medium">
                  {formatCurrency(Number(form.otherDeductibleVat || 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-gray-500">Maksettava ALV</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(calculation.vatPayable)}
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}