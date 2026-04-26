import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

import * as getQuestionFormat from "./tools/get-question-format.ts"
import * as getSectionContext from "./tools/get-section-context.ts"
import * as listClasses from "./tools/list-classes.ts"
import * as listCourses from "./tools/list-courses.ts"
import * as listDepartments from "./tools/list-departments.ts"
import * as listSections from "./tools/list-sections.ts"
import * as saveQuestionsBatch from "./tools/save-questions-batch.ts"
import * as validateQuestions from "./tools/validate-questions.ts"

const server = new McpServer({
  name: "triviamore-catalog",
  version: "1.0.0",
})

const tools = [
  listDepartments,
  listCourses,
  listClasses,
  listSections,
  getSectionContext,
  getQuestionFormat,
  validateQuestions,
  saveQuestionsBatch,
]

for (const tool of tools) tool.register(server)

const transport = new StdioServerTransport()
await server.connect(transport)
console.error("[catalog-mcp] Server connected on stdio")
