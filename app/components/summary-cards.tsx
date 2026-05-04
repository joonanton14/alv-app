import { calculateMonth } from "../lib/calculations"
import { MonthEntry } from "../lib/data"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fi-FI", {
    style: "currency",
    currency: "EUR",
  }).format(value)
}

export default function SummaryCards({ months }: { months: MonthEntry[] }) {
  const totals = months.reduce(
    (acc, month) => {
      const calc = calculateMonth({
        serviceSalesGross: month.serviceSalesGross,
        productSalesGross: month.productSalesGross,
        rentGross: month.rentGross,
        productCommissionGross: month.productCommissionGross,
        vatRate: month.vatRate,
        rentVat: month.rentVat,
        accountantVat: month.accountantVat,
        otherDeductibleVat: month.otherDeductibleVat,
        payoutsReceived: month.payoutsReceived,
      })

      acc.totalReportedSalesGross += calc.totalReportedSalesGross
      acc.taxableSalesGross += calc.taxableSalesGross
      acc.totalSalesVat += calc.totalSalesVat
      acc.totalDeductibleVat += calc.totalDeductibleVat
      acc.vatPayable += calc.vatPayable

      return acc
    },
    {
      totalReportedSalesGross: 0,
      taxableSalesGross: 0,
      totalSalesVat: 0,
      totalDeductibleVat: 0,
      vatPayable: 0,
    }
  )

  const cards = [
    {
      label: "Myynti yhteensä",
      value: formatCurrency(totals.totalReportedSalesGross),
    },
    {
      label: "Verotettava myynti",
      value: formatCurrency(totals.taxableSalesGross),
    },
    {
      label: "Myynnin ALV",
      value: formatCurrency(totals.totalSalesVat),
    },
    {
      label: "Vähennettävä ALV",
      value: formatCurrency(totals.totalDeductibleVat),
    },
    {
      label: "Maksettava ALV",
      value: formatCurrency(totals.vatPayable),
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border bg-white p-5 shadow-sm"
        >
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold">{card.value}</p>
        </div>
      ))}
    </div>
  )
}