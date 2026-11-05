import Link from "next/link"
import {
  getAllMonths,
  getYelForYear,
} from "../../lib/storage"
import { calculateMonth } from "../../lib/calculations"
import PrintButton from "../../components/print-button"
import YelEditor from "../../components/yel-editor"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fi-FI", {
    style: "currency",
    currency: "EUR",
  }).format(value)
}

function monthName(year: number, month: number) {
  return new Intl.DateTimeFormat("fi-FI", { month: "long" }).format(
    new Date(year, month - 1, 1)
  )
}

export default async function YearSummaryPage({
  params,
}: {
  params: Promise<{ year: string }>
}) {
  const { year } = await params
  const selectedYear = Number(year)

  const [allMonths, yelAmount] = await Promise.all([
    getAllMonths(),
    getYelForYear(selectedYear),
  ])

  const months = allMonths
    .filter((month) => month.year === selectedYear)
    .sort((a, b) => a.month - b.month)

  const rows = months.map((month) => {
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

    return { month, calc }
  })

  const totals = rows.reduce(
    (acc, row) => {
      acc.serviceSalesGross += row.month.serviceSalesGross
      acc.productSalesGross += row.month.productSalesGross
      acc.productCommissionGross += row.month.productCommissionGross
      acc.rentGross += row.month.rentGross
      acc.taxableSalesGross += row.calc.taxableSalesGross
      acc.totalSalesVat += row.calc.totalSalesVat
      acc.totalDeductibleVat += row.calc.totalDeductibleVat
      acc.vatPayable += row.calc.vatPayable
      acc.payoutsReceived += row.month.payoutsReceived

      return acc
    },
    {
      serviceSalesGross: 0,
      productSalesGross: 0,
      productCommissionGross: 0,
      rentGross: 0,
      taxableSalesGross: 0,
      totalSalesVat: 0,
      totalDeductibleVat: 0,
      vatPayable: 0,
      payoutsReceived: 0,
    }
  )

  return (
    <main className="mx-auto max-w-6xl bg-white p-8 text-black print:p-0">
      <div className="mb-6 flex justify-between print:hidden">
        <Link href="/" className="text-blue-600 underline">
          Takaisin
        </Link>

        <PrintButton />
      </div>

      <section className="border-b pb-4">
        <h1 className="text-2xl font-bold">
          Vuosiyhteenveto {selectedYear}
        </h1>
        <p className="mt-1 text-sm">
          Vuosiyhteenveto kirjanpitäjälle
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Vuoden kokonaissummat</h2>

        <table className="mt-3 w-full border-collapse text-sm">
          <tbody>
            <tr className="border-b">
              <td className="py-2">Palvelumyynti sis. ALV</td>
              <td className="py-2 text-right">
                {formatCurrency(totals.serviceSalesGross)}
              </td>
            </tr>

            <tr className="border-b">
              <td className="py-2">Tuotemyynti sis. ALV</td>
              <td className="py-2 text-right">
                {formatCurrency(totals.productSalesGross)}
              </td>
            </tr>

            <tr className="border-b">
              <td className="py-2">Tuotemyyntiprovisio sis. ALV</td>
              <td className="py-2 text-right">
                {formatCurrency(totals.productCommissionGross)}
              </td>
            </tr>

            <tr className="border-b">
              <td className="py-2">Vuokran osuus sis. ALV</td>
              <td className="py-2 text-right">
                {formatCurrency(totals.rentGross)}
              </td>
            </tr>

            <tr className="border-b">
              <td className="py-2 font-semibold">
                Verotettava myynti sis. ALV
              </td>
              <td className="py-2 text-right font-semibold">
                {formatCurrency(totals.taxableSalesGross)}
              </td>
            </tr>

            <tr className="border-b">
              <td className="py-2 font-semibold">
                Vero kotimaan myynneistä 25,5 %
              </td>
              <td className="py-2 text-right font-semibold">
                {formatCurrency(totals.totalSalesVat)}
              </td>
            </tr>

            <tr className="border-b">
              <td className="py-2 font-semibold">Vähennettävä vero</td>
              <td className="py-2 text-right font-semibold">
                {formatCurrency(totals.totalDeductibleVat)}
              </td>
            </tr>

            <tr className="border-b">
              <td className="py-2 font-bold">Maksettava vero yhteensä</td>
              <td className="py-2 text-right font-bold">
                {formatCurrency(totals.vatPayable)}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <YelEditor
        year={selectedYear}
        initialAmount={yelAmount}
      />

      <section className="mt-8 border-t pt-4">
        <h2 className="text-lg font-semibold">
          Elinkeinotoiminnan vähennykset
        </h2>

        <table className="mt-3 w-full border-collapse text-sm">
          <tbody>
            <tr className="border-b">
              <td className="py-2">
                YEL-maksut {selectedYear}
              </td>
              <td className="py-2 text-right font-semibold">
                {formatCurrency(yelAmount)}
              </td>
            </tr>
          </tbody>
        </table>

        <p className="mt-2 text-xs text-gray-600">
          YEL-maksut ilmoitetaan erillisenä vähennyksenä
          elinkeinotoiminnan veroilmoituksessa. Ne eivät sisälly
          ALV-laskelmaan.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Kuukausierittely</h2>

        <table className="mt-3 w-full border-collapse text-xs">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Kuukausi</th>
              <th className="py-2 text-right">Palvelu</th>
              <th className="py-2 text-right">Tuote</th>
              <th className="py-2 text-right">Provisio</th>
              <th className="py-2 text-right">Vuokra</th>
              <th className="py-2 text-right">Myynnin ALV</th>
              <th className="py-2 text-right">Väh. ALV</th>
              <th className="py-2 text-right">Maksettava</th>
            </tr>
          </thead>

          <tbody>
            {rows.map(({ month, calc }) => (
              <tr key={month.id} className="border-b">
                <td className="py-2 capitalize">
                  {monthName(month.year, month.month)}
                </td>
                <td className="py-2 text-right">
                  {formatCurrency(month.serviceSalesGross)}
                </td>
                <td className="py-2 text-right">
                  {formatCurrency(month.productSalesGross)}
                </td>
                <td className="py-2 text-right">
                  {formatCurrency(month.productCommissionGross)}
                </td>
                <td className="py-2 text-right">
                  {formatCurrency(month.rentGross)}
                </td>
                <td className="py-2 text-right">
                  {formatCurrency(calc.totalSalesVat)}
                </td>
                <td className="py-2 text-right">
                  {formatCurrency(calc.totalDeductibleVat)}
                </td>
                <td className="py-2 text-right font-semibold">
                  {formatCurrency(calc.vatPayable)}
                </td>
              </tr>
            ))}

            <tr className="border-t-2 font-bold">
              <td className="py-2">Yhteensä</td>
              <td className="py-2 text-right">
                {formatCurrency(totals.serviceSalesGross)}
              </td>
              <td className="py-2 text-right">
                {formatCurrency(totals.productSalesGross)}
              </td>
              <td className="py-2 text-right">
                {formatCurrency(totals.productCommissionGross)}
              </td>
              <td className="py-2 text-right">
                {formatCurrency(totals.rentGross)}
              </td>
              <td className="py-2 text-right">
                {formatCurrency(totals.totalSalesVat)}
              </td>
              <td className="py-2 text-right">
                {formatCurrency(totals.totalDeductibleVat)}
              </td>
              <td className="py-2 text-right">
                {formatCurrency(totals.vatPayable)}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mt-8 border-t pt-4 text-xs text-gray-600">
        <p>Tulostettu: {new Date().toLocaleDateString("fi-FI")}</p>
      </section>
    </main>
  )
}