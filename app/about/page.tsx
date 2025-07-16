import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ArrowLeft, Target, Users, Lightbulb, Award } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">About TriviaMore</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About TriviaMore</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We&#39;re on a mission to revolutionize how university students prepare for exams through interactive learning
            and comprehensive study materials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <Target className="w-10 h-10 text-blue-600 mb-2" />
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                To provide university students with the most effective and engaging study tools, helping them achieve
                academic excellence through interactive quizzes, flashcards, and comprehensive learning materials.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Lightbulb className="w-10 h-10 text-green-600 mb-2" />
              <CardTitle>Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                To become the leading platform for university-level exam preparation, making quality education
                accessible to students worldwide and transforming the way they learn and succeed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-10 h-10 text-purple-600 mb-2" />
              <CardTitle>Our Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We serve thousands of students across multiple universities and departments, creating a collaborative
                learning environment where knowledge is shared and academic success is celebrated.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Award className="w-10 h-10 text-yellow-600 mb-2" />
              <CardTitle>Our Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Students using TriviaMore have reported significant improvements in their exam scores, better retention
                of course material, and increased confidence in their academic abilities.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose TriviaMore?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Comprehensive Content Organization</h3>
                <p className="text-gray-600">
                  Our hierarchical structure (Department → Course → Class → Section) makes it easy to find exactly what
                  you need to study.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Multiple Learning Modes</h3>
                <p className="text-gray-600">
                  From interactive quizzes to flashcards and practice tests, we offer various ways to reinforce your
                  learning.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Progress Tracking</h3>
                <p className="text-gray-600">
                  Monitor your learning journey with detailed analytics, performance insights, and personalized
                  recommendations.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Adaptive Learning</h3>
                <p className="text-gray-600">
                  Our system adapts to your learning pace and highlights areas that need more attention for optimal
                  results.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Transform Your Studies?</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of students who are already improving their academic performance with TriviaMore.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg">Start Learning Today</Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline">
                Explore Content
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
