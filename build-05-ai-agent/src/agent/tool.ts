export const tools = [
    {
        type : "function",
        function : {
            name : "get_weather",
            description : "Get weather of a city",
            parameters : {
                type : "object",
                properties : {
                    city : {
                        type : "string"
                    }
                },
                required : ["city"]
            }
        }
    },

    {
        type : "function",
        function : {
            name : "get_time",
            description : "Get current time of the city",
            parameters : {
                type : "object",
                properties : {
                    city : {
                        type : "string"
                    }
                },
                required : ["city"]
            }
        }
    },

    {
        type : "function",
        function : {
            name : "search_customers",
            description : "Search customer by name or email and return matching customer details",
            strict : true,
            parameters : {
                type : "object",
                properties : {
                    query : {
                        type : "string"
                    }
                },
                required : ["query"],
                additionalProperties : false
            }
        }
    },

    {
        type : "function",
        function : {
            name : "get_order_status",
            description : "Get current status and details of an order using orderId",
            strict : true,
            parameters : {
                type : "object",
                properties : {
                    orderId : {
                        type : "string"
                    }
                },
                required : ["orderId"],
                additionalProperties : false
            }
        }
    },

    {
        type : "function",
        function : {
            name : "get_customer_orders",
            description : "Get all orders of a customer using customerId",
            strict : true,
            parameters : {
                type : "object",
                properties : {
                    customerId : {
                        type : "string"
                    }
                },
                required : ["customerId"],
                additionalProperties : false
            }
        }
    },

    {
        type : "function",
        function : {
            name : "create_support_ticket",
            description : "Create a new support ticket for a customer",
            strict : true,
            parameters : {
                type : "object",
                properties : {
                    customerId : {
                        type : "string"
                    },
                    subject : {
                        type : "string"
                    },
                    description : {
                        type : "string"
                    },
                    priority : {
                        type : "string"
                    }
                },
                required : ["customerId", "subject", "description", "priority"],
                additionalProperties : false
            }
        }
    },

    {
        type : "function",
        function : {
            name : "get_single_support_ticket",
            description : "Get single support ticket",
            strict :true,
            parameters : {
                type : "object",
                properties : {
                    ticketId : {
                        type : "string"
                    }
                },
                required : ["ticketId"],
                additionalProperties : false
            }
        }
    },

    {
        type : "function",
        function : {
            name : "get_support_tickets",
            description : "Get all support tickets of a customer",
            strict : true,
            parameters : {
                type : "object",
                properties : {
                    customerId : {
                        type : "string"
                    }
                },
                required : ["customerId"],
                additionalProperties : false
            }
        }
    }
]