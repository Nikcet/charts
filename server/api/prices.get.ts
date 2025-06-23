import { z } from 'zod'
import redisClient from '../utils/redis'
import { getData } from '../utils/utils'
import prisma from '../utils/prisma'

const querySchema = z.object({
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    range: z.enum(['day', 'week', 'month', 'year']).optional()
})

export default defineEventHandler(async (event) => {
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

    const start = startTime ? new Date(startTime) : new Date()
    const end = endTime ? new Date(endTime) : now

    if (!startTime && !range) {
        start.setTime(0) // epoch
    }

    if (range) {
        switch (range) {
            case 'day':
                start.setDate(now.getDate() - 1)
                break
            case 'week':
                start.setDate(now.getDate() - 7)
                break
            case 'month':
                start.setMonth(now.getMonth() - 1)
                break
            case 'year':
                start.setFullYear(now.getFullYear() - 1)
                break
        }
    }

    const cacheKey = `prices:${start.toISOString()}:${end.toISOString()}`
    const redis = await redisClient
    const cached = await redis.get(cacheKey)

    if (cached) {
        setHeader(event, 'X-Cache', 'HIT')
        return JSON.parse(cached)
    }

    let data

    if (range === 'day') {
        data = await prisma.bitcoin_prices.findMany({
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
        const interval = range === 'week' ? 'day'
            : range === 'month' ? 'day'
                : range === 'year' ? 'week'
                    : 'day'

        data = await getData(interval, start, end)
    }

    await redis.set(cacheKey, JSON.stringify(data), { EX: 300 })
    setHeader(event, 'X-Cache', 'MISS')
    return data
})
