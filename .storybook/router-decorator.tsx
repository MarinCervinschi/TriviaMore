import { useMemo, useRef } from "react";

import type { Decorator } from "@storybook/react-vite";
import {
	RouterProvider,
	createMemoryHistory,
	createRootRoute,
	createRouter,
} from "@tanstack/react-router";

// Every story renders inside a throwaway memory-history router whose only route
// is the story itself. Without it `<Link>` throws in `useLinkProps`, which reads
// a router context that is otherwise null.
//
// The app's real route tree is deliberately NOT loaded: importing it drags in
// TanStack Start's server entries, the same wall that keeps server-function
// components out of Storybook. Links therefore render as plain hrefs and
// navigate nowhere, which is what a component story wants anyway.
export const withRouter: Decorator = Story => {
	// The router is built once per mount, so it must reach the *current* Story
	// rather than the one captured when it was created.
	const storyRef = useRef(Story);
	storyRef.current = Story;

	const router = useMemo(
		() =>
			createRouter({
				routeTree: createRootRoute({
					component: () => {
						const CurrentStory = storyRef.current;
						return <CurrentStory />;
					},
				}),
				history: createMemoryHistory({ initialEntries: ["/"] }),
			}),
		[]
	);

	return <RouterProvider router={router as never} />;
};
