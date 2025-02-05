// This is to be used only to generate a API key to authenticate requests to the service, not sub-services

import { FastifyPluginAsync } from "fastify";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
const prisma = new PrismaClient();

type reqBody = {
    name: string;
    ownerID: string;
};

const createApp: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post("/frontend/newApp", async function (request, reply) {
    const { name, ownerID } = request.body as reqBody;

    try {
      const app = await prisma.app.create({
        data: {
          name: name,
          apiKey: crypto.randomBytes(32).toString("hex"),
          user: {
            connect: {
              id: ownerID,
            },
          },
        },
      });

      return reply.status(201).send({
        app: app,
      });
    } catch (err) {
      console.error(err);
      return reply.status(500).send({
        error: "Internal server error",
      });
    }
  });
};

export default createApp;
