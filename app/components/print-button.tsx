"use client"

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-black px-4 py-2 text-sm text-white"
    >
      Tulosta
    </button>
  )
}