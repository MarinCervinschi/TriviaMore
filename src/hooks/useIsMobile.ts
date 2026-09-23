import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * True below the `md` breakpoint, matching Tailwind's own boundary.
 *
 * False on the server and through hydration — there is no viewport to measure,
 * so anything branching on it renders the desktop shape first and swaps after.
 */
export function useIsMobile(): boolean {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const query = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const update = () => setIsMobile(query.matches);

		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);

	return isMobile;
}
