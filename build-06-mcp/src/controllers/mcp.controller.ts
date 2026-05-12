import { FastifyReply, FastifyRequest } from "fastify";
import { getAllClients } from "../mcp/client/client-manager.service.js";

export const getMcpStatus = async (request: FastifyRequest, reply: FastifyReply) => {
    const clients = getAllClients();
    const status = clients.map(c => ({
        id: c.id,
        status: "connected"
    }));

    return reply.send({
        servers: status
    });
};
