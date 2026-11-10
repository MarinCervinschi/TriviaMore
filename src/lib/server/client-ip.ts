import { isIP } from "node:net";

const DEFAULT_HEADER = "cf-connecting-ip";

/** The one request header the proxy in front of the app writes the client's IP into. */
export function clientIpHeader(): string {
	return process.env.CLIENT_IP_HEADER?.trim() || DEFAULT_HEADER;
}

/** Null when that header is missing or does not hold a single IP address. */
export function clientIp(headers: Headers): string | null {
	const value = headers.get(clientIpHeader())?.trim();
	return value && isIP(value) ? value : null;
}
