import { FastifyPluginAsync } from 'fastify'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const checkHealth: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.get('/health', async function (request, reply) {
        reply.send({ status: 'ok' })
    })
}

export default checkHealth;