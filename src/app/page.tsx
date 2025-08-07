import Link from "next/link";

import { ArrowRight, BookOpen, CheckCircle, Target, Trophy, Users } from "lucide-react";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
			{/* Navigation */}
			<Navigation />

			{/* Hero Section */}
			<section className="py-20">
				<div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
					<h1 className="mb-6 text-5xl font-bold text-gray-900 dark:text-white">
						Master Your Studies with
						<span className="text-blue-600"> Interactive Learning</span>
					</h1>
					<p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 dark:text-gray-300">
						TriviaMore helps university students excel in their exams through engaging
						quizzes, flashcards, and comprehensive study materials organized by
						department, course, and class.
					</p>
					<div className="flex justify-center gap-4">
						<Link href="/auth/register">
							<Button size="lg" className="px-8">
								Start Learning Free
								<ArrowRight className="ml-2 h-5 w-5" />
							</Button>
						</Link>
						<Link href="/browse">
							<Button size="lg" variant="outline" className="bg-transparent px-8">
								Explore Content
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="bg-white py-16 dark:bg-gray-800">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-12 text-center">
						<h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
							Everything You Need to Succeed
						</h2>
						<p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-300">
							Our comprehensive platform provides all the tools you need for effective
							studying and exam preparation.
						</p>
					</div>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader>
								<Target className="mb-2 h-10 w-10 text-blue-600" />
								<CardTitle>Interactive Quizzes</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-gray-600 dark:text-gray-300">
									Test your knowledge with timed quizzes, instant feedback, and detailed
									explanations.
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<BookOpen className="mb-2 h-10 w-10 text-green-600" />
								<CardTitle>Smart Flashcards</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-gray-600 dark:text-gray-300">
									Memorize key concepts with our interactive flashcard system and
									bookmark difficult questions.
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<Trophy className="mb-2 h-10 w-10 text-yellow-600" />
								<CardTitle>Progress Tracking</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-gray-600 dark:text-gray-300">
									Monitor your learning progress with detailed analytics and performance
									insights.
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<Users className="mb-2 h-10 w-10 text-purple-600" />
								<CardTitle>Organized Content</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-gray-600 dark:text-gray-300">
									Content organized by department, course, and class for easy navigation
									and focused study.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Benefits Section */}
			<section className="bg-gray-50 py-16 dark:bg-gray-900">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
						<div>
							<h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
								Why Students Choose TriviaMore
							</h2>
							<div className="space-y-4">
								<div className="flex items-start gap-3">
									<CheckCircle className="mt-0.5 h-6 w-6 text-green-500" />
									<div>
										<h3 className="font-semibold dark:text-white">
											Comprehensive Coverage
										</h3>
										<p className="text-gray-600 dark:text-gray-300">
											Study materials for multiple departments including Engineering,
											Sciences, and more.
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircle className="mt-0.5 h-6 w-6 text-green-500" />
									<div>
										<h3 className="font-semibold dark:text-white">Adaptive Learning</h3>
										<p className="text-gray-600 dark:text-gray-300">
											Our system adapts to your learning pace and highlights areas that
											need more attention.
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircle className="mt-0.5 h-6 w-6 text-green-500" />
									<div>
										<h3 className="font-semibold dark:text-white">Exam Simulation</h3>
										<p className="text-gray-600 dark:text-gray-300">
											Practice with timed tests that simulate real exam conditions for
											better preparation.
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircle className="mt-0.5 h-6 w-6 text-green-500" />
									<div>
										<h3 className="font-semibold dark:text-white">Mobile Friendly</h3>
										<p className="text-gray-600 dark:text-gray-300">
											Study anywhere, anytime with our responsive design and mobile app.
										</p>
									</div>
								</div>
							</div>
						</div>
						<div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
							<h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
								Ready to Get Started?
							</h3>
							<p className="mb-6 text-gray-600 dark:text-gray-300">
								Join thousands of students who are already improving their grades with
								TriviaMore.
							</p>
							<Link href="/auth/register">
								<Button size="lg" className="w-full">
									Create Free Account
								</Button>
							</Link>
							<p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
								No credit card required • Free forever
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gray-900 py-12 text-white">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 gap-8 md:grid-cols-4">
						<div>
							<div className="mb-4 flex items-center gap-2">
								<BookOpen className="h-6 w-6" />
								<span className="text-xl font-bold">TriviaMore</span>
							</div>
							<p className="text-gray-400 dark:text-gray-500">
								Your ultimate study companion for academic success.
							</p>
						</div>
						<div>
							<h4 className="mb-4 font-semibold text-white">Product</h4>
							<ul className="space-y-2 text-gray-400">
								<li>
									<Link href="/browse" className="hover:text-white">
										Browse Content
									</Link>
								</li>
								<li>
									<Link href="/features" className="hover:text-white">
										Features
									</Link>
								</li>
								<li>
									<Link href="/pricing" className="hover:text-white">
										Pricing
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="mb-4 font-semibold text-white">Support</h4>
							<ul className="space-y-2 text-gray-400">
								<li>
									<Link href="/help" className="hover:text-white">
										Help Center
									</Link>
								</li>
								<li>
									<Link href="/contact" className="hover:text-white">
										Contact Us
									</Link>
								</li>
								<li>
									<Link href="/about" className="hover:text-white">
										About
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="mb-4 font-semibold text-white">Legal</h4>
							<ul className="space-y-2 text-gray-400">
								<li>
									<Link href="/privacy" className="hover:text-white">
										Privacy Policy
									</Link>
								</li>
								<li>
									<Link href="/terms" className="hover:text-white">
										Terms of Service
									</Link>
								</li>
							</ul>
						</div>
					</div>
					<div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
						<p>&copy; 2024 TriviaMore. All rights reserved.</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
