import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "ALV-app",
  description: "Paikallinen ALV- ja kuukausiraportti-appi",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fi">
      <body className="min-h-screen bg-gray-50 text-gray-950">{children}</body>
    </html>
  )
}