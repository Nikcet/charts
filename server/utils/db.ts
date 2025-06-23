import { Pool } from 'pg'
import { config } from 'dotenv'

config()

const MAX_RETRIES = 10
const RETRY_DELAY_MS = 3000

const pool = new Pool({
  // user: process.env.POSTGRES_USER,
  // password: process.env.POSTGRES_PASSWORD,
  // host: process.env.POSTGRES_HOST,
  // port: parseInt(process.env.POSTGRES_PORT || '5432'),
  // database: process.env.POSTGRES_DB,
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 2000,
})
console.log('Trying to connect to DB:', process.env.DATABASE_URL)

export async function waitForDatabase() {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const client = await pool.connect()
      await client.query('SELECT 1') // тестовое соединение
      client.release()
      console.log('✅ Successfully connected to PostgreSQL')
      return
    } catch (err) {
      console.warn(`⏳ Waiting for PostgreSQL (${i + 1}/${MAX_RETRIES})...`)
      await new Promise((res) => setTimeout(res, RETRY_DELAY_MS))
    }
  }

  console.error('❌ Could not connect to PostgreSQL after multiple attempts')
  process.exit(1)
}

waitForDatabase()

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

export default pool
