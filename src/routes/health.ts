import { FastifyPluginAsync } from 'fastify'


const checkHealth: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.get('/health', async function (request, reply) {
        reply.send({ status: 'ok' })
    })
}

export default checkHealth;