import { customerHandler } from "../handlers/customer.handler.js";
import { orderHandler } from "../handlers/orders.handler.js";

export const crmHandlers: Record<string, Function> = {
    "lookup_customer": customerHandler,
    "get-orders": orderHandler
};
