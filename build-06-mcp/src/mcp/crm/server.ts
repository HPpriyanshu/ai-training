import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { crmTools } from "./registry/tool-registry.js";
import { crmHandlers } from "./registry/handler-registry.js";

const server = new Server({
    name: "crm-mcp-server",
    version: "1.0.0"
}, {
    capabilities: {
        tools: {}
    }
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: crmTools
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const handler = crmHandlers[request.params.name];
    if (!handler) {
        throw new Error(`Tool not found: ${request.params.name}`);
    }

    return await handler(request.params.arguments);
});

const transport = new StdioServerTransport();
await server.connect(transport);

console.error("CRM MCP Server running on stdio");
