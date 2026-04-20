"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { MonthEntry, FileAttachment } from "../../lib/data"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fi-FI", {
    style: "currency",
    currency: "EUR",
  }).format(value)
}

export default function MonthDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [month, setMonth] = useState<MonthEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [id, setId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    params.then((p) => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return

    const fetchMonth = async () => {
      try {
        const res = await fetch(`/api/months/${id}`)
        if (!res.ok) throw new Error("Kuukausi ei löytynyt")
        const data = await res.json()
        setMonth(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Lataus epäonnistui"
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchMonth()
  }, [id])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files || !id) return

    setUploading(true)
    setError(null)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch(`/api/months/${id}/files`, {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          const payload = await res.json()
          throw new Error(payload.error || "Lataus epäonnistui")
        }
      }

      // Refresh month data
      const refreshRes = await fetch(`/api/months/${id}`)
      if (refreshRes.ok) {
        const data = await refreshRes.json()
        setMonth(data)
      }

      // Reset input safely
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lataus epäonnistui"
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    if (!id || !confirm("Poista tiedosto?")) return

    try {
      const res = await fetch(`/api/months/${id}/files/${fileId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Poisto epäonnistui")

      // Refresh month data
      const refreshRes = await fetch(`/api/months/${id}`)
      if (refreshRes.ok) {
        const data = await refreshRes.json()
        setMonth(data)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Poisto epäonnistui"
      setError(message)
    }
  }

  const handleDownloadFile = (file: FileAttachment) => {
    const link = document.createElement("a")
    link.href = `/api/months/${id}/files/${file.id}?fileName=${file.fileName}`
    link.download = file.originalName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <p>Ladataan...</p>
      </main>
    )
  }

  if (!month) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <p className="text-red-600">Kuukautta ei löytynyt</p>
        <Link href="/" className="mt-4 inline-block text-blue-600 underline">
          Takaisin
        </Link>
      </main>
    )
  }

  const monthName = new Intl.DateTimeFormat("fi-FI", { month: "long" }).format(
    new Date(month.year, month.month - 1, 1)
  )

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">
            {monthName} {month.year}
          </h1>
          <p className="mt-2 text-sm text-gray-600">Hallinnoi kuukauden tiedostoja</p>
        </div>
        <Link href="/" className="rounded-xl border px-4 py-2 text-sm font-medium">
          Takaisin
        </Link>
      </div>

      <div className="grid gap-6">
        {/* Month Summary */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Yhteenveto</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">Palvelumyynti</p>
              <p className="text-lg font-semibold">
                {formatCurrency(month.serviceSalesGross)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tuotemyyntiprovisio</p>
              <p className="text-lg font-semibold">
                {formatCurrency(month.productCommissionGross)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Vuokra</p>
              <p className="text-lg font-semibold">
                {formatCurrency(month.rentGross)}
              </p>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Tiedostot</h2>

          <div className="mb-6">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Lataa PDF-tiedostoja
              </span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="block w-full rounded-xl border px-3 py-2 text-sm"
              />
              <p className="mt-2 text-xs text-gray-500">
                PDF-tiedostot
              </p>
            </label>
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {month.files && month.files.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">
                Ladatut tiedostot ({month.files.length})
              </p>
              <ul className="space-y-2">
                {month.files.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between rounded-lg border bg-gray-50 p-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{file.originalName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(file.uploadedAt).toLocaleDateString("fi-FI")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownloadFile(file)}
                        className="rounded px-3 py-1 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Lataa
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="rounded px-3 py-1 text-xs font-medium bg-red-600 text-white hover:bg-red-700"
                      >
                        Poista
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Ei vielä ladattuja tiedostoja</p>
          )}
        </div>

        {/* Notes */}
        {month.notes && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Muistiinpanot</h2>
            <p className="whitespace-pre-wrap text-sm text-gray-700">
              {month.notes}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
