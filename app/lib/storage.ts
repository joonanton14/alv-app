import fs from "node:fs/promises"
import path from "node:path"
import { randomUUID } from "node:crypto"
import { MonthEntry, FileAttachment } from "./data"
import { MonthEntryInput } from "./validations"

const dataDirPath = path.join(process.cwd(), "data")
const dataFilePath = path.join(dataDirPath, "months.json")
const uploadsDirPath = path.join(dataDirPath, "uploads")

async function ensureDataFile() {
  await fs.mkdir(dataDirPath, { recursive: true })
  await fs.mkdir(uploadsDirPath, { recursive: true })

  try {
    await fs.access(dataFilePath)
  } catch {
    await fs.writeFile(dataFilePath, "[]", "utf8")
  }
}

export async function getAllMonths(): Promise<MonthEntry[]> {
  await ensureDataFile()

  const raw = await fs.readFile(dataFilePath, "utf8")

  if (!raw.trim()) {
    return []
  }

  const data = JSON.parse(raw) as MonthEntry[]

  return data.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return b.month - a.month
  })
}

export async function createMonthEntry(
  input: MonthEntryInput
): Promise<MonthEntry> {
  await ensureDataFile()

  const current = await getAllMonths()
  const now = new Date().toISOString()

  const entry: MonthEntry = {
    id: randomUUID(),
    year: input.year,
    month: input.month,
    serviceSalesGross: input.serviceSalesGross,
    productSalesGross: input.productSalesGross,
    rentGross: input.rentGross,
    productCommissionGross: input.productCommissionGross,
    vatRate: input.vatRate,
    rentVat: input.rentVat,
    accountantVat: input.accountantVat,
    otherDeductibleVat: input.otherDeductibleVat,
    payoutsReceived: input.payoutsReceived,
    notes: input.notes ?? "",
    attachments: input.attachments ?? "",
    files: [],
    createdAt: now,
    updatedAt: now,
  }

  const next = [...current, entry]

  await fs.writeFile(dataFilePath, JSON.stringify(next, null, 2), "utf8")

  return entry
}

export async function saveFileToDisk(
  monthId: string,
  fileBuffer: Buffer,
  originalFileName: string
): Promise<FileAttachment> {
  await ensureDataFile()

  const fileId = randomUUID()
  const ext = path.extname(originalFileName)
  const fileName = `${fileId}${ext}`
  const filePath = path.join(uploadsDirPath, fileName)

  await fs.writeFile(filePath, fileBuffer)

  const attachment: FileAttachment = {
    id: fileId,
    fileName,
    originalName: originalFileName,
    uploadedAt: new Date().toISOString(),
  }

  return attachment
}

export async function addFileToMonth(
  monthId: string,
  file: FileAttachment
): Promise<MonthEntry | null> {
  await ensureDataFile()

  const current = await getAllMonths()
  const monthIndex = current.findIndex((m) => m.id === monthId)

  if (monthIndex === -1) {
    return null
  }

  const month = current[monthIndex]
  month.files = [...(month.files ?? []), file]
  month.updatedAt = new Date().toISOString()

  current[monthIndex] = month

  await fs.writeFile(dataFilePath, JSON.stringify(current, null, 2), "utf8")

  return month
}

export async function deleteFileFromMonth(
  monthId: string,
  fileId: string
): Promise<boolean> {
  await ensureDataFile()

  const current = await getAllMonths()
  const monthIndex = current.findIndex((m) => m.id === monthId)

  if (monthIndex === -1) {
    return false
  }

  const month = current[monthIndex]
  const file = month.files?.find((f) => f.id === fileId)

  if (!file) {
    return false
  }

  // Delete file from disk
  const filePath = path.join(uploadsDirPath, file.fileName)
  try {
    await fs.unlink(filePath)
  } catch {
    // File might already be deleted
  }

  // Remove from month
  month.files = month.files?.filter((f) => f.id !== fileId) ?? []
  month.updatedAt = new Date().toISOString()

  current[monthIndex] = month

  await fs.writeFile(dataFilePath, JSON.stringify(current, null, 2), "utf8")

  return true
}

export async function getFileFromDisk(
  fileName: string
): Promise<Buffer | null> {
  const filePath = path.join(uploadsDirPath, fileName)

  try {
    return await fs.readFile(filePath)
  } catch {
    return null
  }
}