import { FastifyPluginAsync } from "fastify";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getKeyDetails: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.get<{ Params: { key: string } }>("/:key", async function (request, reply) {
    const key = request.params.key;

    const keyDetails = await prisma.key.findUnique({
      where: {
        value: key,
      },
    });

    if (!keyDetails) {
      reply.status(404).send(JSON.stringify({ error: "Key not found" }));
      return;
    }

    reply.send(
      JSON.stringify({
        key: keyDetails.value,
        permissions: keyDetails.permissions,
        name: keyDetails.name,
      })
    );
  });
};

export default getKeyDetails;
