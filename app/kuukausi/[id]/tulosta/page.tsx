import Link from "next/link"
import { getMonthById } from "../../../lib/storage"
import { calculateMonth } from "../../../lib/calculations"
import PrintButton from "../../../components/print-button"

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

export default async function PrintMonthPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const month = await getMonthById(id)

    if (!month) {
        return (
            <main className="p-8">
                <p>Kuukautta ei löytynyt.</p>
                <Link href="/">Takaisin</Link>
            </main>
        )
    }

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

    return (
        <main className="mx-auto max-w-3xl bg-white p-8 text-black print:p-0">
            <div className="mb-6 flex justify-between print:hidden">
                <Link href={`/kuukausi/${id}`} className="text-blue-600 underline">
                    Takaisin
                </Link>

                <PrintButton />
            </div>

            <section className="border-b pb-4">
                <h1 className="text-2xl font-bold">
                    Kuukausiyhteenveto: {monthName(month.year, month.month)} {month.year}
                </h1>
                <p className="mt-1 text-sm">
                    Kirjanpitoyhteenveto
                </p>
            </section>

            <section className="mt-6">
                <h2 className="text-lg font-semibold">Omaveroon ilmoitetut luvut</h2>

                <table className="mt-3 w-full border-collapse text-sm">
                    <tbody>
                        <tr className="border-b">
                            <td className="py-2">Vero kotimaan myynneistä 25,5 %</td>
                            <td className="py-2 text-right font-semibold">
                                {formatCurrency(calc.totalSalesVat)}
                            </td>
                        </tr>

                        <tr className="border-b">
                            <td className="py-2">Vähennettävä vero</td>
                            <td className="py-2 text-right font-semibold">
                                {formatCurrency(calc.totalDeductibleVat)}
                            </td>
                        </tr>

                        <tr className="border-b">
                            <td className="py-2">Maksettava vero</td>
                            <td className="py-2 text-right font-bold">
                                {formatCurrency(calc.vatPayable)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <section className="mt-6">
                <h2 className="text-lg font-semibold">Laskelman pohjatiedot</h2>

                <table className="mt-3 w-full border-collapse text-sm">
                    <tbody>
                        <tr className="border-b">
                            <td className="py-2">Palvelumyynti sis. ALV</td>
                            <td className="py-2 text-right">
                                {formatCurrency(month.serviceSalesGross)}
                            </td>
                        </tr>

                        <tr className="border-b">
                            <td className="py-2">Tuotemyynti sis. ALV</td>
                            <td className="py-2 text-right">
                                {formatCurrency(month.productSalesGross)}
                            </td>
                        </tr>

                        <tr className="border-b">
                            <td className="py-2">Tuotemyyntiprovisio sis. ALV</td>
                            <td className="py-2 text-right">
                                {formatCurrency(month.productCommissionGross)}
                            </td>
                        </tr>

                        <tr className="border-b">
                            <td className="py-2">Vuokran osuus sis. ALV</td>
                            <td className="py-2 text-right">
                                {formatCurrency(month.rentGross)}
                            </td>
                        </tr>

                        <tr className="border-b">
                            <td className="py-2">Verotettava myynti sis. ALV</td>
                            <td className="py-2 text-right font-semibold">
                                {formatCurrency(calc.taxableSalesGross)}
                            </td>
                        </tr>

                        <tr className="border-b">
                            <td className="py-2">Veroton myynti</td>
                            <td className="py-2 text-right">
                                {formatCurrency(calc.taxableSalesNet)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <section className="mt-6">
                <h2 className="text-lg font-semibold">Vähennettävät ALV:t</h2>

                <table className="mt-3 w-full border-collapse text-sm">
                    <tbody>
                        <tr className="border-b">
                            <td className="py-2">Vuokran ALV</td>
                            <td className="py-2 text-right">
                                {formatCurrency(month.rentVat)}
                            </td>
                        </tr>

                        <tr className="border-b">
                            <td className="py-2">Kirjanpitäjän ALV</td>
                            <td className="py-2 text-right">
                                {formatCurrency(month.accountantVat)}
                            </td>
                        </tr>

                        <tr className="border-b">
                            <td className="py-2">Muu vähennettävä ALV</td>
                            <td className="py-2 text-right">
                                {formatCurrency(month.otherDeductibleVat)}
                            </td>
                        </tr>

                        <tr className="border-b">
                            <td className="py-2 font-semibold">Yhteensä</td>
                            <td className="py-2 text-right font-semibold">
                                {formatCurrency(calc.totalDeductibleVat)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </main>
    )
}