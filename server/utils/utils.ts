import pool from './db.js'
import prisma, { waitForPrisma } from './prisma.js'

export async function saveData(data: { timestamp: Date; price: number }[]) {
  for (const item of data) {
    const timestamp = new Date(item.timestamp)
    const timestampISO = timestamp.toISOString()

    await pool.query(
      `INSERT INTO bitcoin_prices (timestamp, price) 
       VALUES ($1::timestamptz, $2)
       ON CONFLICT (timestamp) DO NOTHING`,
      [timestampISO, item.price]
    )
  }
}

const allowedIntervals = ['day', 'week', 'month', 'year'] as const
type Interval = typeof allowedIntervals[number]

export async function getData(interval: Interval, start: Date, end: Date) {
  if (!allowedIntervals.includes(interval)) {
    throw new Error(`Invalid interval: ${interval}`)
  }
  await waitForPrisma();

  const query = `
    SELECT 
      date_trunc('${interval}', timestamp) as time_bucket,
      AVG(price) as avg_price
    FROM bitcoin_prices
    WHERE timestamp BETWEEN $1 AND $2
    GROUP BY time_bucket
    ORDER BY time_bucket ASC
  `

  const result = await prisma.$queryRawUnsafe(query, start, end)
  return result
}
