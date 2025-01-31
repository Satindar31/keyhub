import { FastifyPluginAsync } from "fastify";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import crypto from "crypto";

type reqBody = {
  name: string;
  permissions: string[];
  expiry: Date;
  apiKey: string;
};

const newKey: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post("/generate", async function (request, reply) {
    const { name, permissions, apiKey } = request.body as reqBody;

    const key = await prisma.key.create({
      data: {
        name: name ?? crypto.randomBytes(16).toString("hex"),
        permissions,
        app: {
          connect: {
            apiKey: apiKey,
          },
        },
        value: crypto.randomBytes(32).toString("hex"),
      },
    });

    reply.status(201).send(
      JSON.stringify({
        key: key.value,
        permissions: key.permissions,
        name: key.name,
      })
    );
  });
};

export default newKey;
