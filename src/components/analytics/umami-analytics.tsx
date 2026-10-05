import { useEffect } from "react";

const UMAMI_SRC = import.meta.env.VITE_UMAMI_SRC as string | undefined;
const UMAMI_WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID as string | undefined;

/** Loads Umami in production only; Umami sets no cookies, so it needs no consent gate. */
export function UmamiAnalytics() {
	useEffect(() => {
		if (!import.meta.env.PROD) return;
		if (!UMAMI_SRC || !UMAMI_WEBSITE_ID) return;
		if (document.querySelector(`script[data-website-id="${UMAMI_WEBSITE_ID}"]`)) {
			return;
		}

		const script = document.createElement("script");
		script.src = UMAMI_SRC;
		script.defer = true;
		script.dataset.websiteId = UMAMI_WEBSITE_ID;
		document.head.appendChild(script);
	}, []);

	return null;
}
