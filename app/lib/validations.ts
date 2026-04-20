import { z } from "zod"

export const monthEntrySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100),
  month: z.coerce.number().int().min(1).max(12),
  serviceSalesGross: z.coerce.number().min(0),
  productSalesGross: z.coerce.number().min(0),
  rentGross: z.coerce.number().min(0),
  productCommissionGross: z.coerce.number().min(0),
  vatRate: z.coerce.number().min(0),
  rentVat: z.coerce.number().min(0),
  accountantVat: z.coerce.number().min(0),
  otherDeductibleVat: z.coerce.number().min(0),
  payoutsReceived: z.coerce.number().min(0),
  notes: z.string().default(""),
  attachments: z.string().default(""),
})

export type MonthEntryInput = z.infer<typeof monthEntrySchema>