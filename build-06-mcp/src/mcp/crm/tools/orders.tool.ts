export const ordersTool = {
    name: "get-orders",
    description: "Get customers orders",
    inputSchema: {
        type: "object",
        properties: {
            customerId: {
                type: "string",
                description: "The ID of the customer"
            }
        },
        required: ["customerId"]
    }
};
