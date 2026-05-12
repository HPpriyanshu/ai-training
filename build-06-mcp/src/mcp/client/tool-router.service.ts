import { getAllClients } from "./client-manager.service.js";

export const executeTool = async (toolName: string, args: Record<string, unknown>) => {
    const clients = getAllClients();

    for (const { client } of clients) {
        try {
            const response = await client.listTools();
            if (response.tools.some(t => t.name === toolName)) {
                return await client.callTool({
                    name: toolName,
                    arguments: args
                });
            }
        } catch (error) {
            console.error(`Error checking tools on client:`, error);
        }
    }

    throw new Error(`Tool ${toolName} not found on any connected MCP server`);
};
