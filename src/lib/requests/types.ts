import type { Tables } from "@/lib/supabase/database.types"

export type ContentRequest = Tables<"content_requests">
export type ContentRequestType = ContentRequest["request_type"]
export type ContentRequestStatus = ContentRequest["status"]

// Typed submitted content structures
export type SubmittedSection = {
  type: "section"
  name: string
  description: string
}

export type SubmittedQuestion = {
  content: string
  question_type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER"
  options: string[] | null
  correct_answer: string[]
  explanation: string | null
  difficulty: "EASY" | "MEDIUM" | "HARD"
}

export type SubmittedQuestions = {
  type: "questions"
  questions: SubmittedQuestion[]
}

export type SubmittedReport = {
  type: "report"
  question_id: string
  question_content: string
  reasons: string[]
  comment: string | null
}

export type SubmittedFileUpload = {
  type: "file_upload"
  file_name: string
  file_path: string
  file_size: number
  comment: string | null
}

export type SubmittedContent = SubmittedSection | SubmittedQuestions | SubmittedReport | SubmittedFileUpload

// Request with target breadcrumb for list views
export type ContentRequestWithMeta = ContentRequest & {
  target_label: string
  submitted: SubmittedContent
}

// Admin view includes user info
export type AdminContentRequest = ContentRequestWithMeta & {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
}
