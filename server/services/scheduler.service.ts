import binanceService from './binance.service.js';
import pool from '../utils/db.js';

// Проверка существующих данных
async function exists(timestamp: Date): Promise<boolean> {
  const res = await pool.query(
    'SELECT 1 FROM bitcoin_prices WHERE timestamp = $1',
    [timestamp]
  );
  if (!res?.rowCount) return false;
  return res?.rowCount > 0;
}

// Сохранение данных в БД
async function saveData(data: { timestamp: Date; price: number }[]) {
  for (const item of data) {
    if (!(await exists(item.timestamp))) {
      await pool.query(
        'INSERT INTO bitcoin_prices (timestamp, price) VALUES ($1, $2)',
        [item.timestamp, item.price]
      );
    }
  }
}

// Задача для cron
export async function fetchAndSave() {
  try {
    const lastEntry = await pool.query(
      'SELECT timestamp FROM bitcoin_prices ORDER BY timestamp DESC LIMIT 1'
    );
    
    const startTime = lastEntry.rows[0] 
      ? lastEntry.rows[0].timestamp.getTime() + 1 
      : Date.now() - 365 * 2 * 24 * 60 * 60 * 1000; // 2 года назад

    const newData = await binanceService.fetchData(startTime);
    await saveData(newData);
    
    console.log(`Saved ${newData.length} records`);
  } catch (error) {
    console.error('Cron job failed:', error);
    // Ретраи через 1 мин при ошибках
    setTimeout(fetchAndSave, 60 * 1000);
  }
}

export function initScheduler() {
  // Запуск каждые 5 минут
  fetchAndSave();
  
  // Интервал 5 минут
  setInterval(fetchAndSave, 5 * 60 * 1000);
}