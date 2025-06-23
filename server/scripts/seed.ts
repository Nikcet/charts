import binanceService from '../services/binance.service.js';
import pool from '../utils/db.js';
import { DEPTH_OF_DATA_HISTORY, MIN_INTERVAL } from '../utils/config.js';
import { saveData } from '../utils/utils.js';

async function seedHistoricalData() {
  const past = new Date();
  past.setFullYear(past.getFullYear() - DEPTH_OF_DATA_HISTORY);

  let currentStartTime = past.getTime();
  let totalRecords = 0;
  const batchIntervalMs = 1000 * 60 * 60 * 1000 * MIN_INTERVAL;

  while (true) {
    const currentEndTime = currentStartTime + batchIntervalMs;
    const data = await binanceService.fetchData(
      currentStartTime,
      `${MIN_INTERVAL}h`,
      1000,
      currentEndTime
    );

    await saveData(data);

    totalRecords += data.length;

    if (currentEndTime > Date.now()) break;

    currentStartTime = currentEndTime + 1;
  }

  console.log(`Seeded ${totalRecords} historical records`);
  await pool.end();
}

seedHistoricalData().catch(console.error);