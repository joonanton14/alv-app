import fs from "node:fs/promises"
import path from "node:path"
import { randomUUID } from "node:crypto"
import { MonthEntry, FileAttachment, YelEntry } from "./data"
import { MonthEntryInput } from "./validations"

const dataDirPath = path.join(process.cwd(), "data")
const dataFilePath = path.join(dataDirPath, "months.json")
const yelFilePath = path.join(dataDirPath, "yel.json")
const uploadsDirPath = path.join(dataDirPath, "uploads")

async function ensureDataFile() {
  await fs.mkdir(dataDirPath, { recursive: true })
  await fs.mkdir(uploadsDirPath, { recursive: true })

  try {
    await fs.access(dataFilePath)
  } catch {
    await fs.writeFile(dataFilePath, "[]", "utf8")
  }

  try {
    await fs.access(yelFilePath)
  } catch {
    await fs.writeFile(yelFilePath, "[]", "utf8")
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

  const filePath = path.join(uploadsDirPath, file.fileName)

  try {
    await fs.unlink(filePath)
  } catch {
    // File might already be deleted
  }

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

export async function getMonthById(
  id: string
): Promise<MonthEntry | null> {
  const months = await getAllMonths()
  return months.find((month) => month.id === id) ?? null
}

// YEL-vuosikirjaukset

export async function getAllYelEntries(): Promise<YelEntry[]> {
  await ensureDataFile()

  const raw = await fs.readFile(yelFilePath, "utf8")

  if (!raw.trim()) {
    return []
  }

  return JSON.parse(raw) as YelEntry[]
}

export async function getYelForYear(year: number): Promise<number> {
  const entries = await getAllYelEntries()
  const entry = entries.find((item) => item.year === year)

  return entry?.amount ?? 0
}

export async function saveYelForYear(
  year: number,
  amount: number
): Promise<YelEntry> {
  await ensureDataFile()

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error("Virheellinen vuosi.")
  }

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("YEL-summan pitää olla nolla tai suurempi.")
  }

  const entries = await getAllYelEntries()
  const now = new Date().toISOString()

  const existingIndex = entries.findIndex((item) => item.year === year)

  const entry: YelEntry = {
    year,
    amount: Math.round(amount * 100) / 100,
    updatedAt: now,
  }

  if (existingIndex >= 0) {
    entries[existingIndex] = entry
  } else {
    entries.push(entry)
  }

  await fs.writeFile(yelFilePath, JSON.stringify(entries, null, 2), "utf8")

  return entry
}