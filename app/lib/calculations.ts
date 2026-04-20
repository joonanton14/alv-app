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
  totalSalesGross: number
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

  // Total sales shown (for reference)
  const totalSalesGross = round2(
    input.serviceSalesGross + input.productSalesGross
  )

  // Calculate VAT collected from revenue
  const serviceSalesVat = round2(input.serviceSalesGross * vatMultiplier)
  const productCommissionVat = round2(input.productCommissionGross * vatMultiplier)
  const totalCollectedVat = round2(serviceSalesVat + productCommissionVat)

  // Calculate VAT from rent (auto-calculated, then deducted)
  const calculatedRentVat = round2(input.rentGross * vatMultiplier)

  // Total deductible VAT (include calculated rent VAT, plus manually entered amounts)
  const totalDeductibleVat = round2(
    calculatedRentVat +
      input.rentVat +
      input.accountantVat +
      input.otherDeductibleVat
  )

  // VAT payable = collected VAT - all deductible VAT
  const vatPayable = round2(
    totalCollectedVat - totalDeductibleVat
  )

  // Taxable sales net (for reference/reporting)
  const taxableSalesGross = round2(
    input.serviceSalesGross +
      input.productCommissionGross
  )
  const taxableSalesNet = round2(
    taxableSalesGross - totalCollectedVat
  )

  const cashReceived = round2(input.payoutsReceived)

  return {
    totalSalesGross,
    taxableSalesGross,
    totalSalesVat: totalCollectedVat,
    taxableSalesNet,
    totalDeductibleVat,
    vatPayable,
    cashReceived,
  }
}