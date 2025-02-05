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

    try {
      const key = await prisma.key.create({
        data: {
          name: name ?? crypto.randomBytes(16).toString("hex"),
          permissions,
          app: {
            connectOrCreate: {
              create: {
                name: "api key",
                apiKey: crypto.randomBytes(32).toString("hex"),
                user: {
                  connectOrCreate: {
                    create: {
                      email: "test@example.com",
                      name: "test",
                      id: crypto.randomBytes(16).toString("hex")
                    },
                    where: {
                      email: "s"
                    }
                  }
                }
              },
              where: {
                apiKey: apiKey
              }
            },
          },
          value: crypto.randomBytes(32).toString("hex"),
        },
      });
  
      return reply.status(201).send(
        JSON.stringify({
          key: key.value,
          permissions: key.permissions,
          name: key.name,
        })
      );
    }
    catch(err) {
      console.error(err);

      return reply.status(500).send(
        JSON.stringify({
          error: "Internal server error"
        })
      );
    }
  });
};

export default newKey;
