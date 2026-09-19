import { createServerFn } from "@tanstack/react-start";

export const getMaintenanceModeFn = createServerFn({ method: "GET" }).handler(
	() => process.env.MAINTENANCE_MODE === "true"
);

let cached: boolean | undefined;

export async function inMaintenanceMode(): Promise<boolean> {
	if (cached !== undefined) return cached;
	try {
		cached = await getMaintenanceModeFn();
		return cached;
	} catch {
		return false;
	}
}
