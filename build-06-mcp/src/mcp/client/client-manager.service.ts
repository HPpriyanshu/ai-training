import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { logger } from "../../utils/logger.js";

export interface MCPClientInstance {
    client: Client;
    transport: StdioClientTransport;
    id: string;
}

const clients: Map<string, MCPClientInstance> = new Map();

export const connectServer = async (id: string, command: string, args: string[]) => {
    try {
        const transport = new StdioClientTransport({ command, args });
        const client = new Client({
            name: "fastify-ai-client",
            version: "1.0.0"
        }, {
            capabilities: {}
        });

        await client.connect(transport);
        clients.set(id, { client, transport, id });
        logger.info(`Connected to MCP server: ${id}`);
    } catch (error) {
        logger.error(`Failed to connect to MCP server ${id}:`, error);
        throw error;
    }
};

export const getClient = (id: string): Client | undefined => {
    return clients.get(id)?.client;
};

export const getAllClients = (): MCPClientInstance[] => {
    return Array.from(clients.values());
};

export const disconnectAll = async () => {
    for (const { transport } of clients.values()) {
        await transport.close();
    }
    clients.clear();
};
