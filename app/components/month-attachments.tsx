"use client"

import { useEffect, useState } from "react"

type Attachment = {
  filename: string
  url: string
}

function getFileType(filename: string) {
  const lower = filename.toLowerCase()

  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image"
  if (lower.endsWith(".pdf")) return "pdf"
  if (lower.endsWith(".docx")) return "docx"

  return "other"
}

export default function MonthAttachments({ monthId }: { monthId: string }) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAttachments() {
      try {
        const res = await fetch(`/api/months/${monthId}/files`)
        const data = await res.json()
        setAttachments(data)
      } catch (err) {
        console.error("Liitteiden haku epäonnistui", err)
      } finally {
        setLoading(false)
      }
    }

    loadAttachments()
  }, [monthId])

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-gray-500">
        Ladataan liitteitä...
      </div>
    )
  }

  if (attachments.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-gray-500">
        Ei liitteitä.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Liitteet</h2>

      <div className="mt-4 grid gap-4">
        {attachments.map((file) => {
          const type = getFileType(file.filename)

          return (
            <div key={file.filename} className="rounded-xl border p-4">
              <p className="mb-3 text-sm font-medium">{file.filename}</p>

              {type === "image" && (
                <img
                  src={file.url}
                  alt={file.filename}
                  className="max-h-96 w-full rounded-lg object-contain"
                />
              )}

              {type === "pdf" && (
                <div className="flex gap-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Avaa PDF
                  </a>
                </div>
              )}

              {type === "docx" && (
                <div className="flex gap-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-purple-600 px-3 py-1 text-sm font-medium text-white hover:bg-purple-700"
                  >
                    Avaa Word-tiedosto
                  </a>
                </div>
              )}

              {type === "other" && (
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Avaa tiedosto
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}