import pool from '../utils/db'

export default defineEventHandler(async () => {
    try {
        const res = await pool.query('SELECT NOW()')
        return { time: res.rows[0].now }
    } catch (err: any) {
        console.error('Database error:', err)
        return { error: 'DB connection failed', details: err.message }
    }
})