import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
	stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
	addons: ["@storybook/addon-a11y", "@storybook/addon-docs", "@storybook/addon-themes"],
	framework: {
		name: "@storybook/react-vite",
		options: {
			builder: { viteConfigPath: ".storybook/vite.config.ts" },
		},
	},
	core: { disableTelemetry: true },
};

export default config;
