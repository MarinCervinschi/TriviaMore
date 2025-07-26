import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MdAddToPhotos } from "react-icons/md";
import { FiDelete, FiEdit3 } from "react-icons/fi";
import QuizQuestion from "@/types/QuizQuestion";
import { useQuestionMutation } from "@/hooks/admin/useQuestionMutation";
import SmartInlineMath from "@/components/SmartInlineMath"; // Import your math renderer

interface ClassQuestionsProps {
  classId: string;
  sectionId: string;
  questions: QuizQuestion[];
}

export default function QuestionsCard({ classId, sectionId, questions }: ClassQuestionsProps) {
  const { deleteQuestionMutation } = useQuestionMutation(classId, sectionId);

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) return;
    deleteQuestionMutation.mutate(questionId);
  };

  return (
    <>
      <Button asChild>
        <Link href={`/admin/class/${classId}/section/${sectionId}/question/new`}>
          <MdAddToPhotos className="mr-2" /> Add New Question
        </Link>
      </Button>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Questions - {questions.length}</CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map((question) => (
                <Card key={question.id}>
                  <CardHeader>
                    <CardTitle className="break-words">
                      <SmartInlineMath text={question.question} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                      {question.options.map((option, index) => (
                        <li
                          key={index}
                          className={`break-words ${question.answer.includes(index) ? "text-green-600" : ""}`}
                        >
                          <SmartInlineMath text={option} />
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button asChild>
                        <Link href={`/admin/class/${classId}/section/${sectionId}/question/${question.id}`}>
                          <FiEdit3 className="mr-2" /> Edit
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => question.id && handleDeleteQuestion(question.id)}
                      >
                        <FiDelete className="mr-2" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No questions found. Add a new question below.</p>
          )}
        </CardContent>
      </Card>

    </>
  );
}