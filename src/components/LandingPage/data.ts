import { BookOpen, CheckCircle, Target, Trophy, Users } from "lucide-react";

import {
	BenefitItem,
	CTACardProps,
	FeatureCard,
	FooterSection,
	HeroSectionProps,
} from "./types";

export const heroContent: HeroSectionProps = {
	title: "Master Your Studies with",
	subtitle:
		"TriviaMore helps university students excel in their exams through engaging quizzes, flashcards, and comprehensive study materials organized by department, course, and class.",
	primaryCTA: {
		text: "Start Learning Free",
		href: "/auth/register",
	},
	secondaryCTA: {
		text: "Explore Content",
		href: "/browse",
	},
};

export const features: FeatureCard[] = [
	{
		icon: Target,
		title: "Interactive Quizzes",
		description:
			"Test your knowledge with timed quizzes, instant feedback, and detailed explanations.",
		iconColor: "text-blue-600",
	},
	{
		icon: BookOpen,
		title: "Smart Flashcards",
		description:
			"Memorize key concepts with our interactive flashcard system and bookmark difficult questions.",
		iconColor: "text-green-600",
	},
	{
		icon: Trophy,
		title: "Progress Tracking",
		description:
			"Monitor your learning progress with detailed analytics and performance insights.",
		iconColor: "text-yellow-600",
	},
	{
		icon: Users,
		title: "Organized Content",
		description:
			"Content organized by department, course, and class for easy navigation and focused study.",
		iconColor: "text-purple-600",
	},
];

export const benefits: BenefitItem[] = [
	{
		title: "Comprehensive Coverage",
		description:
			"Study materials for multiple departments including Engineering, Sciences, and more.",
	},
	{
		title: "Adaptive Learning",
		description:
			"Our system adapts to your learning pace and highlights areas that need more attention.",
	},
	{
		title: "Exam Simulation",
		description:
			"Practice with timed tests that simulate real exam conditions for better preparation.",
	},
	{
		title: "Mobile Friendly",
		description: "Study anywhere, anytime with our responsive design and mobile app.",
	},
];

export const ctaCardContent: CTACardProps = {
	title: "Ready to Get Started?",
	description:
		"Join thousands of students who are already improving their grades with TriviaMore.",
	buttonText: "Create Free Account",
	buttonHref: "/auth/register",
	disclaimer: "No credit card required • Free forever",
};

export const footerSections: FooterSection[] = [
	{
		title: "Product",
		links: [
			{ href: "/browse", label: "Browse Content" },
			{ href: "/features", label: "Features" },
			{ href: "/pricing", label: "Pricing" },
		],
	},
	{
		title: "Support",
		links: [
			{ href: "/help", label: "Help Center" },
			{ href: "/contact", label: "Contact Us" },
			{ href: "/about", label: "About" },
		],
	},
	{
		title: "Legal",
		links: [
			{ href: "/privacy", label: "Privacy Policy" },
			{ href: "/terms", label: "Terms of Service" },
		],
	},
];
