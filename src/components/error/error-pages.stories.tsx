import type { Meta, StoryObj } from "@storybook/react-vite";

import { ErrorPage } from "./error-page";
import { NotFoundPage } from "./not-found-page";

/**
 * The two boundaries. `withBand` is off inside the `_app` shell, which paints the band already — two
 * stack their alphas — so both stories exist here, and the difference between them is the point.
 */
const meta = {
	title: "Error/Pagine",
	parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function boom() {
	const error = new Error("Failed to load section: connection terminated unexpectedly");
	error.stack = `Error: Failed to load section: connection terminated unexpectedly
    at getSectionChain (src/lib/catalog/service.ts:118:11)
    at handler (src/lib/browse/api/get-section.ts:24:9)`;
	return error;
}

export const NotFound: Story = {
	name: "404",
	render: () => <NotFoundPage />,
};

/** The title and the message are props: a route that knows what was missing says so. */
export const NotFoundCustom: Story = {
	name: "404 con testo proprio",
	render: () => (
		<NotFoundPage
			title="Domanda non trovata"
			message="Questa domanda non fa parte della sezione che stai studiando."
		/>
	),
};

export const NotFoundInShell: Story = {
	name: "404 dentro la shell",
	render: () => <NotFoundPage withBand={false} />,
};

export const Boundary: Story = {
	name: "Errore",
	render: () => <ErrorPage error={boom()} />,
};

export const BoundaryInShell: Story = {
	name: "Errore dentro la shell",
	render: () => <ErrorPage error={boom()} withBand={false} />,
};
