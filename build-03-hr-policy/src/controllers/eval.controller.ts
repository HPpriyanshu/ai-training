import { FastifyReply, FastifyRequest } from "fastify";
import { runEval } from "../services/eval.service.js";

export const runEvalController = async (req: FastifyRequest, reply : FastifyReply) => {
    try {
        const data = await runEval()

        return reply.code(200).send(data)
    } catch (error) {
        req.log.error({error}, "Eval fetch error")
        return reply.code(500).send({error : error})
    }
}