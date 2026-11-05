export type FileAttachment = {
  id: string
  fileName: string
  originalName: string
  uploadedAt: string
}

export type MonthEntry = {
  id: string
  year: number
  month: number
  serviceSalesGross: number
  productSalesGross: number
  rentGross: number
  productCommissionGross: number
  vatRate: number
  rentVat: number
  accountantVat: number
  otherDeductibleVat: number
  payoutsReceived: number
  notes: string
  attachments: string
  files: FileAttachment[]
  createdAt: string
  updatedAt: string
}

export type YelEntry = {
  year: number
  amount: number
  updatedAt: string
}