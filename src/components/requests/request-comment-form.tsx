import { useState } from "react"
import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAddRequestComment } from "@/lib/requests/mutations"

export function RequestCommentForm({ requestId }: { requestId: string }) {
  const [content, setContent] = useState("")
  const addComment = useAddRequestComment(() => setContent(""))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    addComment.mutate({ request_id: requestId, content: content.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Scrivi un commento..."
        rows={2}
        className="flex-1 rounded-xl"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!content.trim() || addComment.isPending}
        className="h-10 w-10 shrink-0 rounded-xl"
      >
        <Send className="size-4" />
      </Button>
    </form>
  )
}
