import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

import * as compileQuestions from "./tools/compile-questions.ts"

const server = new McpServer({
  name: "trivia-more-questions",
  version: "3.0.0",
})

compileQuestions.register(server)

const transport = new StdioServerTransport()
await server.connect(transport)
console.error("[questions-mcp] Server connected on stdio")
