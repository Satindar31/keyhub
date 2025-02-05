// This is to be used only to generate a API key to authenticate requests to the service, not sub-services

import { FastifyPluginAsync } from "fastify";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
const prisma = new PrismaClient();

const getKeyDetails: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.post("/frontend/newKey", async function (request, reply) {
    const { appId, userEmail } = request.body as { appId: string, userEmail: string };

    try {
        const app = await prisma.app.findUnique({
            where: {
                id: appId
            },
            select: {
                apiKey: true,
                user: {
                    select: {
                        email: true
                    }
                },
            }
        })
        if(!app) { 
            return reply.status(404).send({
                error: "App not found"
            })
        }

        for (const user of app.user){
            if(user.email == userEmail){
                const key = await prisma.app.update({
                    where: {
                        id: appId
                    },
                    data: {
                        apiKey: crypto.randomBytes(32).toString("hex")
                    }
                })

                return reply.status(201).send({
                    apiKey: key.apiKey
                })
            }
            return reply.status(401).send({
                error: "Unauthorized"
            })
        }
    }
    catch(err) {
        console.error(err);
        return reply.status(500).send({
            error: "Internal server error",
        });
    }

})};

export default getKeyDetails;
