import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

// Secrets are injected into the environment before the process starts, by
// `infisical run` in the container entrypoint and in the pnpm dev scripts.
export default { fetch: createStartHandler(defaultStreamHandler) };
