/**
 * Hello Service
 * Business logic for the hello API.
 */
export const getHelloMessage = async (logger: any) => {
  logger.info({ context: "business_logic", step: "generating_greeting" }, "HelloService: Generating greeting message");
  
  return {
    message: "Hello from Fastify with Route, Service, and Controller!",
    timestamp: new Date().toISOString(),
  };
};
