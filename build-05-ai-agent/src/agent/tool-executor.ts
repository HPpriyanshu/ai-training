import { customers } from "../data/customers"
import { orders } from "../data/orders"
import { tickets } from "../data/tickets"

const dangerous_Tool = ['create_support_ticket']

export const executeTool = async (name : string, args : any) => {
    if(!args || typeof args !== "object"){
        throw new Error("Invalid arguments")
    }

    if(dangerous_Tool.includes(name) && !args.confirmed) return "Confirmation required"

    switch(name){
        case "get_weather":
            if(!args.city)  throw new Error("City is required")
                return `Weather in ${args.city} is 30 C`

        case "get_time":    
            if(!args.city) throw new Error("City is required")
                return `Time in ${args.city} is ${new Date(Date.now())}`

        case "search_customers":    
            if(!args.query) throw new Error("Emal or Name is required")

             return customers.filter((customer) => customer.name.toLowerCase().includes(args.query.toLowerCase()) || customer.email.toLowerCase().includes(args.query.toLowerCase()))   
             
        case "get_order_status":     
            if(!args.orderId) throw new Error("OrderId is required")

             return orders.find((order) => order.id === args.orderId)   

        case "get_customer_orders":     
            if(!args.customerId) throw new Error("CustomerId is required")

            return orders.filter((order) => order.customerId === args.customerId)    

        case "create_support_ticket":    
            if(!args.customerId || !args.subject || !args.description || !args.priority) throw new Error("CustomerId, subject, description and priority  are required")

           const ticket = {
            id : `TICKET-${tickets.length + 1}`,
            customerId : args.customerId,
            subject : args.subject,
            description : args.description,
            priority : args.priority,
            status : "open",
            createdAt : new Date().toISOString()
           }     

           tickets.push(ticket)

           return ticket

        case "get_single_support_ticket":   
           if(!args.ticketId) throw new Error("TicketId is required")

            return tickets.find((ticket) => ticket.id === args.ticketId)

        case "get_support_tickets":    
            if(!args.customerId) throw new Error("CustomerId is required")

            return tickets.filter((ticket) => ticket.customerId === args.customerId)    
        default:    
            throw new Error("Unknown tool")
    }
}