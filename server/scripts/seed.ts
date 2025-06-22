import binanceService from '../services/binance.service.js';
import pool from '../utils/db.js';

async function seedHistoricalData() {
  const twoYearsAgo = Date.now() - 365 * 2 * 24 * 60 * 60 * 1000;
  const data = await binanceService.fetchData(twoYearsAgo);
  
  for (const item of data) {
    await pool.query(
      'INSERT INTO bitcoin_prices (timestamp, price) VALUES ($1, $2) ON CONFLICT (timestamp) DO NOTHING',
      [item.timestamp, item.price]
    );
  }
  console.log(`Seeded ${data.length} historical records`);
  await pool.end();
  process.exit(0);
}

seedHistoricalData().catch(console.error);