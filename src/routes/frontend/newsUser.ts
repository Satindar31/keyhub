// TODO: convert into a weebhook reciever to be used with clerk

import { FastifyPluginAsync } from "fastify";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const createUsers: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post("/frontend/newUser", async function (request, reply) {
    const { name, email } = request.body as { name: string; email: string };

    try {
      const user = await prisma.user.create({
        data: {
          name: name,
          email: email,
        },
        select: {
          email: true,
          name: true,
          id: true,
        }
      });

      return reply.status(201).send({
        user: user,
        id: user.id,
      });
    } catch (err) {
      console.error(err);
      return reply.status(500).send({
        error: "Internal server error",
      });
    }
  });
};

export default createUsers;
