import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Inbox,
  MapPin,
  Plus,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RequestCommentForm } from "@/components/requests/request-comment-form"
import { RequestFormDialog } from "@/components/requests/request-form-dialog"
import { RequestStatusBadge } from "@/components/requests/request-status-badge"
import { RequestTypeBadge } from "@/components/requests/request-type-badge"
import { UserHero } from "@/components/user/user-hero"
import { requestQueries } from "@/lib/requests/queries"
import { useReviseRequest } from "@/lib/requests/mutations"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { cn } from "@/lib/utils"

import type {
  ContentRequestCommentWithUser,
  ContentRequestWithMeta,
} from "@/lib/requests/types"

export const Route = createFileRoute("/_app/user/requests/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(requestQueries.userRequests()),
  head: () => seoHead({ title: "Inbox", noindex: true }),
  component: UserInboxPage,
})

// ─── Utils ───

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "ora"
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}g`
  return new Date(dateStr).toLocaleDateString("it-IT", { day: "numeric", month: "short" })
}

function formatTimestamp(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ─── Main Page ───

function UserInboxPage() {
  const { data: requests } = useSuspenseQuery(requestQueries.userRequests())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const prefersReduced = useReducedMotion()

  return (
    <div className="space-y-8 pb-8">
      <UserHero
        icon={Inbox}
        title="Inbox"
        description="Le tue conversazioni con il team di TriviaMore."
      />

      <div className="container max-w-3xl space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {requests.length} {requests.length === 1 ? "conversazione" : "conversazioni"}
          </p>
          <RequestFormDialog
            trigger={
              <Button size="sm" className="gap-1.5 rounded-xl shadow-lg shadow-primary/25">
                <Plus className="size-4" />
                Nuovo messaggio
              </Button>
            }
          />
        </div>

        {requests.length === 0 ? (
          <div className="rounded-3xl border bg-card p-12 text-center">
            <div className="mx-auto mb-4 inline-flex rounded-2xl bg-primary/10 p-4">
              <Inbox className="size-10 text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="mb-2 text-xl font-semibold">Nessun messaggio</h2>
            <p className="text-muted-foreground">
              Invia il tuo primo messaggio al team!
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border bg-card">
            <AnimatePresence mode="wait">
              {selectedId ? (
                <motion.div
                  key="conversation"
                  initial={prefersReduced ? { opacity: 1 } : { opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={prefersReduced ? { opacity: 1 } : { opacity: 0, x: 60 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <ConversationView
                    requestId={selectedId}
                    onBack={() => setSelectedId(null)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={prefersReduced ? { opacity: 1 } : { opacity: 0, x: -60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={prefersReduced ? { opacity: 1 } : { opacity: 0, x: -60 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  {requests.map((request, i) => (
                    <InboxRow
                      key={request.id}
                      request={request}
                      isLast={i === requests.length - 1}
                      onSelect={() => setSelectedId(request.id)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Inbox Row ───

function InboxRow({
  request,
  isLast,
  onSelect,
}: {
  request: ContentRequestWithMeta
  isLast: boolean
  onSelect: () => void
}) {
  const isActive = request.status === "PENDING" || request.status === "NEEDS_REVISION"

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-accent/50",
        !isLast && "border-b border-border/50",
      )}
    >
      {/* Unread dot */}
      <div className="flex w-2 shrink-0 justify-center">
        {isActive && <span className="h-2 w-2 rounded-full bg-primary" />}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn(
            "truncate text-sm",
            isActive ? "font-semibold" : "font-medium text-muted-foreground",
          )}>
            {request.title}
          </span>
          <RequestTypeBadge type={request.request_type} />
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" strokeWidth={1.5} />
          {request.target_label}
        </p>
      </div>

      {/* Right side */}
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="text-xs text-muted-foreground">{timeAgo(request.updated_at)}</span>
        <RequestStatusBadge status={request.status} />
      </div>
    </button>
  )
}

// ─── Conversation View ───

function ConversationView({
  requestId,
  onBack,
}: {
  requestId: string
  onBack: () => void
}) {
  const { data: request, isLoading } = useQuery(
    requestQueries.requestDetail(requestId),
  )

  if (isLoading || !request) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Button variant="ghost" size="icon" className="shrink-0 rounded-xl" onClick={onBack}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold">{request.title}</h2>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" strokeWidth={1.5} />
            <span className="truncate">{request.target_label}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <RequestTypeBadge type={request.request_type} />
          <RequestStatusBadge status={request.status} />
        </div>
      </div>

      {/* Messages */}
      <div className="max-h-[60vh] space-y-4 overflow-y-auto px-5 py-5">
        {/* Original message */}
        <MessageBubble name="Tu" initials="TU" isOwn timestamp={request.created_at}>
          <p className="text-sm leading-relaxed">{request.description}</p>
        </MessageBubble>

        {/* Admin note */}
        {request.admin_note && (
          <MessageBubble
            name="TriviaMore Team"
            image="/logo192.png"
            initials="TM"
            timestamp={request.handled_at ?? request.updated_at}
          >
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Nota</p>
              <p className="mt-0.5 text-sm">{request.admin_note}</p>
            </div>
          </MessageBubble>
        )}

        {/* Comments */}
        {request.comments.map((comment) => (
          <CommentBubble key={comment.id} comment={comment} />
        ))}

        {/* Revise form */}
        {request.status === "NEEDS_REVISION" && (
          <ReviseForm requestId={request.id} currentTitle={request.title} currentDescription={request.description} />
        )}
      </div>

      {/* Input */}
      <div className="border-t px-5 py-3">
        <RequestCommentForm requestId={request.id} />
      </div>
    </div>
  )
}

// ─── Message Bubbles ───

function MessageBubble({
  name,
  image,
  initials,
  isOwn = false,
  timestamp,
  children,
}: {
  name: string
  image?: string | null
  initials: string
  isOwn?: boolean
  timestamp: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex gap-3", isOwn && "flex-row-reverse")}>
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarImage src={image ?? undefined} />
        <AvatarFallback className="text-[10px] font-semibold">{initials}</AvatarFallback>
      </Avatar>
      <div className={cn("max-w-[80%] space-y-1", isOwn && "items-end text-right")}>
        <div className={cn("flex items-center gap-2", isOwn && "flex-row-reverse")}>
          <span className="text-xs font-medium">{name}</span>
          <span className="text-[10px] text-muted-foreground/60">{formatTimestamp(timestamp)}</span>
        </div>
        <div className={cn(
          "rounded-2xl px-4 py-3",
          isOwn ? "rounded-tr-md bg-primary/10" : "rounded-tl-md bg-muted",
        )}>
          {children}
        </div>
      </div>
    </div>
  )
}

function CommentBubble({ comment }: { comment: ContentRequestCommentWithUser }) {
  const isStaff = comment.user.role !== "STUDENT"

  return (
    <MessageBubble
      name={isStaff ? (comment.user.name ?? "TriviaMore Team") : "Tu"}
      image={isStaff ? (comment.user.image ?? "/logo192.png") : undefined}
      initials={isStaff ? "TM" : "TU"}
      isOwn={!isStaff}
      timestamp={comment.created_at}
    >
      <p className="text-sm leading-relaxed">{comment.content}</p>
    </MessageBubble>
  )
}

// ─── Revise Form ───

function ReviseForm({
  requestId,
  currentTitle,
  currentDescription,
}: {
  requestId: string
  currentTitle: string
  currentDescription: string
}) {
  const [title, setTitle] = useState(currentTitle)
  const [description, setDescription] = useState(currentDescription)
  const revise = useReviseRequest()

  return (
    <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-orange-600 dark:text-orange-400">Revisione richiesta</h3>
        <p className="text-xs text-muted-foreground">Modifica e reinvia la tua richiesta.</p>
      </div>
      <div className="space-y-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titolo" className="rounded-xl" />
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Descrizione" className="rounded-xl" />
      </div>
      <Button
        size="sm"
        onClick={() => revise.mutate({ id: requestId, title, description })}
        disabled={revise.isPending}
        className="rounded-xl"
      >
        {revise.isPending ? "Invio..." : "Reinvia"}
      </Button>
    </div>
  )
}
