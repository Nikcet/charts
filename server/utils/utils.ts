import pool from '../utils/db.js';

export async function saveData(data: { timestamp: Date; price: number }[]) {
  for (const item of data) {
    // Форматируем timestamp в ISO-строку с указанием временной зоны
    const timestampISO = new Date(item.timestamp).toISOString();

    await pool.query(
      `INSERT INTO bitcoin_prices (timestamp, price) 
         VALUES ($1::timestamptz, $2)
         ON CONFLICT (timestamp) DO NOTHING`,
      [timestampISO, item.price]
    );
  }
}

export async function getData(interval: string, start: Date, end: Date) {
    return await prisma.$queryRaw`
      SELECT 
        date_trunc(${interval}, timestamp) as time_bucket,
        AVG(price) as avg_price
      FROM bitcoin_prices
      WHERE timestamp BETWEEN ${start} AND ${end}
      GROUP BY time_bucket
      ORDER BY time_bucket ASC
    `
}