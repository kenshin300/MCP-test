import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
const server = new McpServer({
    name: "my-first-mcp",
    version: "1.0.0",
});
server.tool("add_numbers", "Складывает два числа", { a: z.number(), b: z.number() }, async ({ a, b }) => ({
    content: [{ type: "text", text: `Результат: ${a + b}` }],
}));
server.tool("minus_numbers", "Отнимает из одного числа второе", { a: z.number(), b: z.number() }, async ({ a, b }) => ({
    content: [{ type: "text", text: `Результат: ${a - b}` }],
}));
const transport = new StdioServerTransport();
await server.connect(transport);
//# sourceMappingURL=index.js.map