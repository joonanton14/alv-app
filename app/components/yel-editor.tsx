"use client"

import { useState } from "react"

type YelEditorProps = {
  year: number
  initialAmount: number
}

export default function YelEditor({
  year,
  initialAmount,
}: YelEditorProps) {
  const [amount, setAmount] = useState(String(initialAmount))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")

    const parsedAmount = Number(amount.replace(",", "."))

    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      setMessage("Anna kelvollinen YEL-summa.")
      return
    }

    setSaving(true)

    try {
      const response = await fetch("/api/yel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year,
          amount: parsedAmount,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Tallentaminen epäonnistui.")
      }

      setAmount(data.entry.amount.toFixed(2))
      setMessage("YEL-summa tallennettu.")
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Tallentaminen epäonnistui."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-gray-300 p-5 print:hidden">
      <h2 className="text-lg font-semibold">
        YEL-maksut {year}
      </h2>

      <p className="mt-1 text-sm text-gray-600">
        Syötä vuoden aikana maksettujen YEL-maksujen kokonaissumma.
        Summa käsitellään erillisenä elinkeinotoiminnan vähennyksenä,
        eikä se vaikuta ALV-laskentaan.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-wrap items-end gap-3"
      >
        <div>
          <label
            htmlFor="yel-amount"
            className="mb-1 block text-sm font-medium"
          >
            YEL-maksut yhteensä (€)
          </label>

          <input
            id="yel-amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-48 rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Tallennetaan..." : "Tallenna YEL"}
        </button>
      </form>

      {message && (
        <p className="mt-3 text-sm" aria-live="polite">
          {message}
        </p>
      )}
    </section>
  )
}