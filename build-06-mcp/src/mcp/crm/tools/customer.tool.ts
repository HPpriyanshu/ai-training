export const customerTool = {
    name: "lookup_customer",
    description: "Find customer details by name, email, or ID",
    inputSchema: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description: "Customer name, email, or ID"
            }
        },
        required: ["query"]
    }
};
