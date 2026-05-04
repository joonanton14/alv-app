import Link from "next/link"
import { calculateMonth } from "../lib/calculations"
import { MonthEntry } from "../lib/data"

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

export default function MonthTable({ months }: { months: MonthEntry[] }) {
  if (months.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-sm text-gray-600 shadow-sm">
        Ei vielä kuukausimerkintöjä.{" "}
        <Link href="/kuukausi/uusi" className="underline">
          Lisää ensimmäinen
        </Link>
        .
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-600">
          <tr>
            <th className="px-4 py-3">Kuukausi</th>
            <th className="px-4 py-3">Palvelu</th>
            <th className="px-4 py-3">Tuotemyynti</th>
            <th className="px-4 py-3">Vuokra</th>
            <th className="px-4 py-3">Provisio</th>
            <th className="px-4 py-3">Verotettava myynti</th>
            <th className="px-4 py-3">Myynnin ALV</th>
            <th className="px-4 py-3">Vähennettävä ALV</th>
            <th className="px-4 py-3">Maksettava ALV</th>
            <th className="px-4 py-3">Tilitykset</th>
          </tr>
        </thead>

        <tbody>
          {months.map((month) => {
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
              <tr key={month.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium capitalize">
                  <Link
                    href={`/kuukausi/${month.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {monthName(month.year, month.month)} {month.year}
                  </Link>
                </td>

                <td className="px-4 py-3">
                  {formatCurrency(month.serviceSalesGross)}
                </td>

                <td className="px-4 py-3">
                  {formatCurrency(month.productSalesGross)}
                </td>

                <td className="px-4 py-3">
                  {formatCurrency(month.rentGross)}
                </td>

                <td className="px-4 py-3">
                  {formatCurrency(month.productCommissionGross)}
                </td>

                <td className="px-4 py-3">
                  {formatCurrency(calc.taxableSalesGross)}
                </td>

                <td className="px-4 py-3">
                  {formatCurrency(calc.totalSalesVat)}
                </td>

                <td className="px-4 py-3">
                  {formatCurrency(calc.totalDeductibleVat)}
                </td>

                <td className="px-4 py-3 font-semibold">
                  {formatCurrency(calc.vatPayable)}
                </td>

                <td className="px-4 py-3">
                  {formatCurrency(month.payoutsReceived)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}