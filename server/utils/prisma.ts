import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const MAX_RETRIES = 10
const RETRY_DELAY_MS = 3000

export async function waitForPrisma() {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log('✅ Connected to database via Prisma')
      return
    } catch (error) {
      console.warn(`⏳ Waiting for Prisma DB connection (${i + 1}/${MAX_RETRIES})...`)
      await new Promise((res) => setTimeout(res, RETRY_DELAY_MS))
    }
  }

  console.error('❌ Prisma failed to connect to DB after multiple attempts')
  process.exit(1)
}

export default prisma
