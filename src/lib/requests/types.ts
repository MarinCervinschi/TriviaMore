import type { Tables } from "@/lib/supabase/database.types"

export type ContentRequest = Tables<"content_requests">
export type ContentRequestComment = Tables<"content_request_comments">

export type ContentRequestType = ContentRequest["request_type"]
export type ContentRequestStatus = ContentRequest["status"]

// Request with user info and target breadcrumb for list views
export type ContentRequestWithMeta = ContentRequest & {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
  target_label: string
}

// Request detail with comments for detail view
export type ContentRequestDetail = ContentRequestWithMeta & {
  comments: ContentRequestCommentWithUser[]
}

export type ContentRequestCommentWithUser = ContentRequestComment & {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    role: string
  }
}
