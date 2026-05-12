import { customers } from "../../../data/customers.js";

export const customerHandler = async (args: any) => {
    const customer = customers.find(c => c.name === args.query || c.email === args.query || c.id === args.query);

    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(customer || { message: "Customer not found" })
            }
        ]
    };
};
