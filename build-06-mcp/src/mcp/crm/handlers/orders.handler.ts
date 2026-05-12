import { orders } from "../../../data/orders.js";

export const orderHandler = async (args: any) => {
    const customerOrders = orders.filter(order => order.customerId === args.customerId);

    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(customerOrders.length > 0 ? customerOrders : { message: "No orders found for this customer" })
            }
        ]
    };
};
