import { AwsClient } from "aws4fetch";

import { NotFound } from "@/lib/server/errors";

/** `public` is served as is on S3_PUBLIC_URL; `contributions` only through the app. */
export type Bucket = "public" | "contributions";

let client: AwsClient | null = null;

function env(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`${name} is not set`);
	return value;
}

function s3(): AwsClient {
	client ??= new AwsClient({
		accessKeyId: env("S3_ACCESS_KEY_ID"),
		secretAccessKey: env("S3_SECRET_ACCESS_KEY"),
		region: env("S3_REGION"),
		service: "s3",
	});
	return client;
}

function bucketName(bucket: Bucket): string {
	return env(bucket === "public" ? "S3_BUCKET_PUBLIC" : "S3_BUCKET_CONTRIBUTIONS");
}

function encodeKey(key: string): string {
	return key.split("/").map(encodeURIComponent).join("/");
}

function objectUrl(bucket: Bucket, key: string): string {
	return `${env("S3_ENDPOINT").replace(/\/$/, "")}/${bucketName(bucket)}/${encodeKey(key)}`;
}

export function publicBaseUrl(): string {
	return env("S3_PUBLIC_URL").replace(/\/$/, "");
}

export function publicUrl(key: string): string {
	return `${publicBaseUrl()}/${encodeKey(key)}`;
}

async function check(
	response: Response,
	action: string,
	key: string
): Promise<Response> {
	if (response.ok) return response;
	const body = await response.text().catch(() => "");
	throw new Error(
		`S3 ${action} ${key} failed with ${response.status}: ${body.slice(0, 300)}`
	);
}

export async function putObject(
	bucket: Bucket,
	key: string,
	body: Blob | Uint8Array<ArrayBuffer> | string,
	contentType: string
): Promise<void> {
	const response = await s3().fetch(objectUrl(bucket, key), {
		method: "PUT",
		body,
		headers: { "content-type": contentType },
	});
	await check(response, "PUT", key);
}

export async function getObject(bucket: Bucket, key: string): Promise<Response> {
	const response = await s3().fetch(objectUrl(bucket, key));
	if (response.status === 404) throw new NotFound("File non trovato");
	return check(response, "GET", key);
}

export async function deleteObjects(bucket: Bucket, keys: string[]): Promise<void> {
	for (const key of keys) {
		const response = await s3().fetch(objectUrl(bucket, key), { method: "DELETE" });
		if (response.status !== 404) await check(response, "DELETE", key);
	}
}

export type StoredObject = { key: string; lastModified: Date; size: number };

function xmlText(xml: string, tag: string): string | undefined {
	const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
	return match?.[1];
}

function unescapeXml(value: string): string {
	return value
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&amp;/g, "&");
}

/** Parses one page of a ListObjectsV2 answer. */
export function parseListPage(xml: string): {
	objects: StoredObject[];
	next: string | undefined;
} {
	const objects = [...xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)].map(
		([, entry]) => ({
			key: unescapeXml(xmlText(entry, "Key") ?? ""),
			lastModified: new Date(xmlText(entry, "LastModified") ?? 0),
			size: Number(xmlText(entry, "Size") ?? 0),
		})
	);
	const truncated = xmlText(xml, "IsTruncated") === "true";
	const token = xmlText(xml, "NextContinuationToken");
	return { objects, next: truncated && token ? unescapeXml(token) : undefined };
}

export async function* listObjects(bucket: Bucket): AsyncGenerator<StoredObject> {
	let token: string | undefined;
	do {
		const url = new URL(
			`${env("S3_ENDPOINT").replace(/\/$/, "")}/${bucketName(bucket)}`
		);
		url.searchParams.set("list-type", "2");
		if (token) url.searchParams.set("continuation-token", token);
		const response = await check(await s3().fetch(url.toString()), "LIST", bucket);
		const page = parseListPage(await response.text());
		yield* page.objects;
		token = page.next;
	} while (token);
}
