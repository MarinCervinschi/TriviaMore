
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MdAddToPhotos } from "react-icons/md";
import QuizQuestion from "@/types/QuizQuestion";
import { FiDelete, FiEdit3 } from "react-icons/fi";
import { useSectionMutations } from "@/hooks/admin/useSectionMutations";

interface ClassQuestionsProps {
  classId: string;
  sectionId: string;
  questions: QuizQuestion[];
}

export default function QuestionsCard({ classId, sectionId, questions }: ClassQuestionsProps) {

  const { deleteQuestionMutation } = useSectionMutations(classId, sectionId);

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) return;
    deleteQuestionMutation.mutate(questionId);
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Questions - {questions.length}</CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map((question) => (
                <Card key={question.id}>
                  <CardHeader>
                    <CardTitle>{question.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5">
                      {question.options.map((option, index) => (
                        <li
                          key={index}
                          className={question.answer.includes(index) ? "text-green-600" : ""}
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 space-x-2">
                      <Button asChild>
                        <Link href={`/admin/class/${classId}/section/${sectionId}/question/${question.id}`}>
                          Edit <FiEdit3 />
                        </Link>
                      </Button>
                      <Button variant="destructive" onClick={() => question.id && handleDeleteQuestion(question.id)}>
                        Delete <FiDelete />
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
      <Button asChild>
        <Link href={`/admin/class/${classId}/section/${sectionId}/question/new`}>
          Add New Question <MdAddToPhotos />
        </Link>
      </Button>
    </>
  );
}