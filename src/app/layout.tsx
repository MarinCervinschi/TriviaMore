import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import "katex/dist/katex.min.css";
import { SessionProvider } from "next-auth/react";

import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProviders } from "@/providers/react-query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

import "../styles/markdown.css";
import "./globals.css";

export const metadata: Metadata = {
	title: {
		default: "Trivia More - Quiz per Studenti UNIMORE",
		template: "%s | Trivia More",
	},
	description:
		"Piattaforma open source per quiz e flashcard dedicata agli studenti dell'Università di Modena e Reggio Emilia. Preparati agli esami con contenuti creati dalla community studentesca.",
	keywords: [
		"quiz",
		"flashcard",
		"UNIMORE",
		"università",
		"esami",
		"studio",
		"open source",
		"studenti",
		"Modena",
	],
	authors: [{ name: "Trivia More Team" }],
	creator: "Trivia More Community",
	publisher: "Trivia More",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	metadataBase: new URL("https://trivia-more.vercel.app"),
	alternates: {
		canonical: "/",
	},
	openGraph: {
		title: "Trivia More - Quiz per Studenti UNIMORE",
		description:
			"Piattaforma open source per quiz e flashcard dedicata agli studenti dell'Università di Modena e Reggio Emilia.",
		url: "https://trivia-more.vercel.app",
		siteName: "Trivia More",
		locale: "it_IT",
		type: "website",
		images: [
			{
				url: "./favicon.ico",
				width: 1200,
				height: 630,
				alt: "Trivia More - Quiz per Studenti UNIMORE",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Trivia More - Quiz per Studenti UNIMORE",
		description:
			"Piattaforma open source per quiz e flashcard dedicata agli studenti UNIMORE.",
		images: ["./favicon.ico"],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-poppins",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="it" suppressHydrationWarning>
			<body className={poppins.className}>
				<SessionProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<ReactQueryProviders>{children}</ReactQueryProviders>
					</ThemeProvider>
				</SessionProvider>
				<Toaster />
			</body>
		</html>
	);
}
