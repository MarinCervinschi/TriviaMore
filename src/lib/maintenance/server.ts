import { createServerFn } from "@tanstack/react-start"

export const getMaintenanceModeFn = createServerFn({ method: "GET" }).handler(
  () => process.env.MAINTENANCE_MODE === "true",
)
