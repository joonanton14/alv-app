export type MonthInput = {
  serviceSalesGross: number
  productSalesGross: number
  rentGross: number
  productCommissionGross: number
  vatRate: number
  rentVat: number
  accountantVat: number
  otherDeductibleVat: number
  payoutsReceived: number
}

export type MonthCalculation = {
  totalReportedSalesGross: number
  taxableSalesGross: number
  totalSalesVat: number
  taxableSalesNet: number
  totalDeductibleVat: number
  vatPayable: number
  cashReceived: number
}

export const round2 = (value: number) => Math.round(value * 100) / 100

export function calculateMonth(input: MonthInput): MonthCalculation {
  const vatMultiplier = input.vatRate / (100 + input.vatRate)

  // Raportilla näkyvä myynti yhteensä, vain tiedoksi
  const totalReportedSalesGross = round2(
    input.serviceSalesGross + input.productSalesGross
  )

  // Tämä on Omaveroon menevän myynnin ALV:n pohja
  const taxableSalesGross = round2(
    input.serviceSalesGross + input.productCommissionGross
  )

  const totalSalesVat = round2(taxableSalesGross * vatMultiplier)

  const taxableSalesNet = round2(taxableSalesGross - totalSalesVat)

  const totalDeductibleVat = round2(
    input.rentVat +
      input.accountantVat +
      input.otherDeductibleVat
  )

  const vatPayable = round2(totalSalesVat - totalDeductibleVat)

  const cashReceived = round2(input.payoutsReceived)

  return {
    totalReportedSalesGross,
    taxableSalesGross,
    totalSalesVat,
    taxableSalesNet,
    totalDeductibleVat,
    vatPayable,
    cashReceived,
  }
}