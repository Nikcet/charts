import { z } from 'zod'
import redis from '../utils/redis'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const querySchema = z.object({
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    range: z.enum(['day', 'week', 'month', 'year']).optional()
})

export default defineEventHandler(async (event) => {
    // Валидация параметров
    const query = getQuery(event)
    const result = querySchema.safeParse(query)

    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: 'Invalid parameters',
            data: result.error.issues
        })
    }

    const { startTime, endTime, range } = result.data
    const now = new Date()

    // Рассчет диапазона
    let start = new Date(now)
    let end = new Date(now)

    if (range) {
        if (range === 'day') start.setDate(now.getDate() - 1)
        if (range === 'week') start.setDate(now.getDate() - 7)
        if (range === 'month') start.setMonth(now.getMonth() - 1)
        if (range === 'year') start.setFullYear(now.getFullYear() - 1)
    } else {
        start = startTime ? new Date(startTime) : new Date(0)
        end = endTime ? new Date(endTime) : new Date()
    }

    // Проверка кэша
    const cacheKey = `prices:${start.toISOString()}:${end.toISOString()}`
    const cached = await (await redis).get(cacheKey)

    if (cached) {
        setHeader(event, 'X-Cache', 'HIT')
        return JSON.parse(cached)
    }

    // Запрос к БД через Prisma
    let data

    if (range === 'day') {
        // Точные данные для дня
        data = await prisma.bitcoinPrice.findMany({
            where: {
                timestamp: {
                    gte: start,
                    lte: end
                }
            },
            orderBy: {
                timestamp: 'asc'
            },
            select: {
                timestamp: true,
                price: true
            }
        })
    } else {
        // Агрегация для больших периодов
        const interval = range === 'week' ? 'hour' : 'day'

        // Используем Prisma raw query для агрегации
        data = await prisma.$queryRaw`
      SELECT 
        date_trunc(${interval}, timestamp) as time_bucket,
        AVG(price) as avg_price
      FROM bitcoin_prices
      WHERE timestamp BETWEEN ${start} AND ${end}
      GROUP BY time_bucket
      ORDER BY time_bucket ASC
    `
    }

    // Кэширование
    await (await redis).set(cacheKey, JSON.stringify(data), {
        EX: 300
    })

    setHeader(event, 'X-Cache', 'MISS')
    return data
})