import { getAllClients } from "./client-manager.service.js";

export const getTools = async () => {
    const allTools: any[] = [];
    const clients = getAllClients();

    for (const { client } of clients) {
        try {
            const response = await client.listTools();
            allTools.push(...response.tools);
        } catch (error) {
            console.error("Error listing tools for a client:", error);
        }
    }

    return { tools: allTools };
};
