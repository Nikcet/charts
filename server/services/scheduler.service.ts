import binanceService from './binance.service.js';
import pool from '../utils/db.js';
import { saveData } from '../utils/utils.js';
import { DEPTH_OF_DATA_HISTORY, MIN_INTERVAL } from '../utils/config.js';



async function exists(timestamp: Date): Promise<boolean> {
  const res = await pool.query(
    'SELECT 1 FROM bitcoin_prices WHERE timestamp = $1',
    [timestamp]
  );
  if (!res?.rowCount) return false;
  return res?.rowCount > 0;
}


export async function fetchAndSave() {

  try {
    const lastEntry = await pool.query(
      'SELECT timestamp FROM bitcoin_prices ORDER BY timestamp DESC LIMIT 1'
    );

    const past = new Date();
    past.setFullYear(past.getFullYear() - DEPTH_OF_DATA_HISTORY);

    const startTime = lastEntry.rows[0]
      ? lastEntry.rows[0].timestamp.getTime() + 1
      : past.getTime();

    const newData = await binanceService.fetchData(startTime, `${MIN_INTERVAL}h`);
    await saveData(newData);

    console.log(`Saved ${newData.length} records`);

  } catch (error) {

    console.error('Schedule error', error);

    setTimeout(fetchAndSave, 60 * 1000); // retry in 1 minute

  }
}

export function initScheduler() {

  fetchAndSave();

  setInterval(fetchAndSave, 1000 * 60 * 60 * MIN_INTERVAL); // per 2 hour
}