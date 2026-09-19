export interface AvatarChoice {
	seed: string;
	/** A data URI, so the preview goes through `<img>` and never renders as markup. */
	dataUri: string;
}
