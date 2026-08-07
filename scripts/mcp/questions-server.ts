import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import * as checkLengthBias from "./tools/check-length-bias.ts";
import * as compileQuestions from "./tools/compile-questions.ts";

const server = new McpServer({
	name: "trivia-more-questions",
	version: "3.1.0",
});

compileQuestions.register(server);
checkLengthBias.register(server);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[questions-mcp] Server connected on stdio");
