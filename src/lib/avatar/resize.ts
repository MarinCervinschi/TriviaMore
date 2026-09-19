const MAX_EDGE = 512;
const QUALITY = 0.85;

/** A camera roll holds 3–8 MB images and an avatar is drawn at 40–96 px, so the
 *  original is never what gets stored — nor what the bucket limit measures. */
export async function resizeForAvatar(file: File): Promise<Blob> {
	const bitmap = await createImageBitmap(file);

	try {
		const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
		const width = Math.round(bitmap.width * scale);
		const height = Math.round(bitmap.height * scale);

		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;

		const context = canvas.getContext("2d");
		if (!context) throw new Error("no 2d context");
		context.drawImage(bitmap, 0, 0, width, height);

		const blob = await new Promise<Blob | null>(resolve =>
			canvas.toBlob(resolve, "image/webp", QUALITY)
		);
		if (!blob) throw new Error("encode failed");

		return blob;
	} finally {
		bitmap.close();
	}
}
