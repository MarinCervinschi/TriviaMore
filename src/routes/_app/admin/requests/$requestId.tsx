import { type ReactNode, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
	CheckCircle2,
	ChevronDown,
	Clock,
	Download,
	Eye,
	FileUp,
	Pencil,
	Settings2,
	UserCog,
} from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { HandleRequestDialog } from "@/components/requests/handle-request-dialog";
import { PresetReplies } from "@/components/requests/preset-replies";
import { RequestStatusBadge } from "@/components/requests/request-status-badge";
import { RequestTypeBadge } from "@/components/requests/request-type-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { isCorrectOption, parseOptions } from "@/lib/quiz/options";
import { getFileDownloadUrlFn } from "@/lib/requests/api";
import { useAcknowledgeRequest, useApproveRequest } from "@/lib/requests/mutations";
import { requestQueries } from "@/lib/requests/queries";
import type {
	ReportedQuestion,
	SubmittedContent,
	SubmittedFileUpload,
	SubmittedQuestion,
} from "@/lib/requests/types";
import { seoHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

const REASON_LABELS: Record<string, string> = {
	errata: "Errata",
	imprecisa: "Imprecisa",
	fuori_contesto: "Fuori contesto",
	altro: "Altro",
};

const ACK_PRESETS = [
	"Grazie della segnalazione, abbiamo verificato.",
	"Grazie della segnalazione, abbiamo corretto la domanda.",
	"Grazie del contributo!",
];

function formatDateTime(iso: string): string {
	const d = new Date(iso);
	const sameYear = d.getFullYear() === new Date().getFullYear();
	const date = d.toLocaleDateString("it-IT", {
		day: "numeric",
		month: "short",
		...(sameYear ? {} : { year: "numeric" }),
	});
	const time = d.toLocaleTimeString("it-IT", {
		hour: "2-digit",
		minute: "2-digit",
	});
	return `${date}, ${time}`;
}

export const Route = createFileRoute("/_app/admin/requests/$requestId")({
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(requestQueries.requestDetail(params.requestId)),
	head: () => seoHead({ title: "Dettaglio Richiesta", noindex: true }),
	component: AdminRequestDetailPage,
});

function AdminRequestDetailPage() {
	const { requestId } = Route.useParams();
	const { data: request } = useSuspenseQuery(requestQueries.requestDetail(requestId));
	const [handleOpen, setHandleOpen] = useState(false);
	const [reportNote, setReportNote] = useState("");
	const approve = useApproveRequest();
	const acknowledge = useAcknowledgeRequest();
	const { user: currentUser } = useAuth();
	const isMaintainer = currentUser?.role === "MAINTAINER";

	const isPending = request.status === "PENDING";
	const isReport = request.requestType === "REPORT";
	const isFileUpload = request.requestType === "FILE_UPLOAD";
	const isAcknowledgeOnly = isReport || isFileUpload;

	const submitted = request.submitted;
	// The user's words (reasons + free-text) are kept separate from the material
	// under review so reviewers can tell them apart at a glance.
	const reasons = submitted.type === "report" ? submitted.reasons : [];
	const userComment =
		submitted.type === "report" || submitted.type === "file_upload"
			? submitted.comment
			: null;
	const reportedQuestionId = submitted.type === "report" ? submitted.question_id : null;
	const hasUserMessage = reasons.length > 0 || !!userComment;

	const materialLabel = isReport
		? "Domanda segnalata"
		: isFileUpload
			? "File caricato"
			: "Contenuto proposto";

	return (
		<div className="space-y-6 py-2">
			<AdminPageHeader
				title="Dettaglio richiesta"
				description={request.targetLabel}
				backTo="/admin/requests"
				backLabel="Richieste"
				actions={
					isPending && !isAcknowledgeOnly ? (
						<>
							<Button
								variant="outline"
								size="sm"
								className="gap-1.5 rounded-xl"
								onClick={() => setHandleOpen(true)}
							>
								<Settings2 className="size-4" />
								Rifiuta / Modifiche
							</Button>
							<Button
								size="sm"
								className="gap-1.5 rounded-xl bg-green-600 hover:bg-green-700"
								onClick={() => approve.mutate({ id: request.id })}
								disabled={approve.isPending}
							>
								<CheckCircle2 className="size-4" />
								{approve.isPending ? "Approvazione..." : "Approva e pubblica"}
							</Button>
						</>
					) : undefined
				}
			/>

			{/* Summary: type + outcome, then who sent it and when */}
			<div className="bg-card space-y-4 rounded-2xl border p-6">
				<div className="space-y-2">
					<div className="flex flex-wrap items-center gap-2">
						<RequestTypeBadge type={request.requestType} />
						<RequestStatusBadge status={request.status} />
					</div>
					{request.handledAt && (
						<p className="text-muted-foreground flex items-center gap-1.5 text-xs">
							<CheckCircle2 className="size-3.5 shrink-0" strokeWidth={1.5} />
							<span>
								Gestita da{" "}
								<span className="text-foreground font-medium">
									{request.handledByUser?.name ?? "Team"}
								</span>{" "}
								· {formatDateTime(request.handledAt)}
							</span>
						</p>
					)}
				</div>

				{request.user && (
					<div className="flex items-center justify-between gap-4 border-t pt-4">
						<div className="flex min-w-0 items-center gap-3">
							<Avatar className="h-11 w-11">
								<AvatarImage src={request.user.image ?? undefined} />
								<AvatarFallback>
									{(
										request.user.name?.[0] ??
										request.user.email?.[0] ??
										"?"
									).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0 space-y-1.5">
								<p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
									Inviata da
								</p>
								<p className="truncate text-sm font-semibold">
									{request.user.name ?? "Utente"}
								</p>
								{request.user.email && (
									<p className="text-muted-foreground truncate text-xs">
										{request.user.email}
									</p>
								)}
								<p className="text-muted-foreground flex items-center gap-1.5 pt-1 text-xs">
									<Clock className="size-3 shrink-0" strokeWidth={1.5} />
									<span>Inviata {formatDateTime(request.createdAt)}</span>
								</p>
							</div>
						</div>
						{!isMaintainer && (
							<Button
								asChild
								variant="outline"
								size="sm"
								className="shrink-0 gap-1.5 rounded-xl"
							>
								<Link to="/admin/users/$userId" params={{ userId: request.user.id }}>
									<UserCog className="size-4" />
									Scheda utente
								</Link>
							</Button>
						)}
					</div>
				)}

				{request.adminNote && (
					<div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
						<p className="text-xs font-medium text-amber-600 dark:text-amber-400">
							Risposta inviata all&apos;utente
						</p>
						<p className="mt-1 text-sm">{request.adminNote}</p>
					</div>
				)}
			</div>

			{/* 2. The user's message — only when there is one */}
			{hasUserMessage && (
				<section className="space-y-3">
					<SectionLabel>Messaggio dell&apos;utente</SectionLabel>
					<div className="bg-card space-y-3 rounded-2xl border p-6">
						{reasons.length > 0 && (
							<div className="flex flex-wrap gap-1.5">
								{reasons.map(r => (
									<Badge
										key={r}
										variant="outline"
										className="rounded-full border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
									>
										{REASON_LABELS[r] ?? r}
									</Badge>
								))}
							</div>
						)}
						{userComment && <p className="text-sm leading-relaxed">{userComment}</p>}
					</div>
				</section>
			)}

			{/* 3. The material under review */}
			<section className="space-y-3">
				<div className="flex items-center justify-between gap-2">
					<SectionLabel>{materialLabel}</SectionLabel>
					{reportedQuestionId && (
						<Button asChild variant="outline" size="sm" className="gap-1.5 rounded-xl">
							<Link
								to="/admin/questions/$questionId"
								params={{ questionId: reportedQuestionId }}
							>
								<Pencil className="size-3.5" />
								Modifica domanda
							</Link>
						</Button>
					)}
				</div>
				<MaterialPreview
					submitted={submitted}
					reportedQuestion={request.reportedQuestion ?? null}
				/>
			</section>

			{/* 4. Response area (reports + file uploads, while pending) */}
			{isAcknowledgeOnly && isPending && (
				<section className="space-y-3">
					<SectionLabel>Rispondi e prendi in carico</SectionLabel>
					<div className="bg-card space-y-4 rounded-2xl border p-6">
						<PresetReplies
							presets={ACK_PRESETS}
							onPick={text => setReportNote(prev => (prev ? `${prev} ${text}` : text))}
						/>
						<Textarea
							value={reportNote}
							onChange={e => setReportNote(e.target.value)}
							placeholder="Lascia una nota per l'utente (opzionale)"
							rows={3}
							className="rounded-xl"
						/>
						<div className="flex justify-end">
							<Button
								className="gap-1.5 rounded-xl"
								onClick={() =>
									acknowledge.mutate({ id: request.id, admin_note: reportNote })
								}
								disabled={acknowledge.isPending}
							>
								<Eye className="size-4" />
								{acknowledge.isPending ? "Salvataggio..." : "Presa visione"}
							</Button>
						</div>
					</div>
				</section>
			)}

			<HandleRequestDialog
				requestId={request.id}
				open={handleOpen}
				onOpenChange={setHandleOpen}
			/>
		</div>
	);
}

function SectionLabel({ children }: { children: ReactNode }) {
	return (
		<h3 className="text-primary px-1 text-xs font-semibold tracking-widest uppercase">
			{children}
		</h3>
	);
}

// ─── Material preview (the content under review, without the user's words) ───

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MaterialPreview({
	submitted,
	reportedQuestion,
}: {
	submitted: SubmittedContent;
	reportedQuestion?: ReportedQuestion | null;
}) {
	if (submitted.type === "file_upload") {
		return <FileUploadPreview file={submitted} />;
	}

	if (submitted.type === "report") {
		return reportedQuestion ? (
			<ReportedQuestionCard question={reportedQuestion} />
		) : (
			<div className="space-y-2 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
				<p className="text-xs font-medium text-amber-600 dark:text-amber-400">
					La domanda non è più disponibile (potrebbe essere stata eliminata o
					modificata). Contenuto al momento della segnalazione:
				</p>
				<MarkdownRenderer content={submitted.question_content} className="text-sm" />
			</div>
		);
	}

	if (submitted.type === "section") {
		return (
			<div className="bg-card space-y-2 rounded-2xl border p-6">
				<p className="text-lg font-semibold">{submitted.name}</p>
				{submitted.description && (
					<p className="text-muted-foreground text-sm">{submitted.description}</p>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{submitted.questions.map((q, i) => (
				<QuestionCard key={i} question={q} index={i} />
			))}
		</div>
	);
}

function QuestionCard({
	question,
	index,
}: {
	question: SubmittedQuestion;
	index: number;
}) {
	const typeLabels = {
		MULTIPLE_CHOICE: "Scelta multipla",
		TRUE_FALSE: "Vero/Falso",
		SHORT_ANSWER: "Risposta breve",
	};
	const diffColors = {
		EASY: "text-green-500",
		MEDIUM: "text-amber-500",
		HARD: "text-red-500",
	};
	const diffLabels = { EASY: "Facile", MEDIUM: "Medio", HARD: "Difficile" };

	return (
		<div className="bg-card space-y-3 rounded-2xl border p-5">
			<div className="flex items-center justify-between">
				<p className="text-muted-foreground text-xs font-semibold">
					Domanda {index + 1}
				</p>
				<div className="flex gap-1.5">
					<Badge variant="outline" className="rounded-full text-[10px]">
						{typeLabels[question.question_type]}
					</Badge>
					<Badge
						variant="outline"
						className={cn("rounded-full text-[10px]", diffColors[question.difficulty])}
					>
						{diffLabels[question.difficulty]}
					</Badge>
				</div>
			</div>

			<MarkdownRenderer content={question.content} className="text-sm font-medium" />

			{/* Options */}
			{question.options && question.options.length > 0 && (
				<div className="space-y-1.5">
					{question.options.map((opt, oi) => {
						const optId = String.fromCharCode(97 + oi);
						const isCorrect = question.correct_answer.includes(optId);
						return (
							<div
								key={oi}
								className={cn(
									"flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
									isCorrect
										? "border border-green-500/30 bg-green-500/10 font-medium text-green-700 dark:text-green-400"
										: "bg-muted/50"
								)}
							>
								<span className="text-muted-foreground font-mono text-xs">
									{optId.toUpperCase()}
								</span>
								<MarkdownRenderer content={opt} inline />
								{isCorrect && (
									<CheckCircle2 className="ml-auto size-4 shrink-0 text-green-500" />
								)}
							</div>
						);
					})}
				</div>
			)}

			{/* True/False answer */}
			{question.question_type === "TRUE_FALSE" && (
				<p className="text-sm">
					Risposta:{" "}
					<span className="font-medium text-green-600">
						{question.correct_answer[0] === "true" ? "Vero" : "Falso"}
					</span>
				</p>
			)}

			{/* Short answer */}
			{question.question_type === "SHORT_ANSWER" && (
				<p className="text-sm">
					Risposta:{" "}
					<span className="font-medium text-green-600">
						{question.correct_answer[0]}
					</span>
				</p>
			)}

			{/* Explanation */}
			{question.explanation && (
				<div className="bg-muted/50 rounded-lg px-3 py-2">
					<p className="text-muted-foreground text-xs font-medium">Spiegazione</p>
					<MarkdownRenderer content={question.explanation} className="mt-0.5 text-sm" />
				</div>
			)}
		</div>
	);
}

function ReportedQuestionCard({ question }: { question: ReportedQuestion }) {
	const [open, setOpen] = useState(false);
	const options = parseOptions(question.options);
	const typeLabels = {
		MULTIPLE_CHOICE: "Scelta multipla",
		TRUE_FALSE: "Vero/Falso",
		SHORT_ANSWER: "Risposta breve",
	};
	const diffColors = {
		EASY: "text-green-500",
		MEDIUM: "text-amber-500",
		HARD: "text-red-500",
	};
	const diffLabels = { EASY: "Facile", MEDIUM: "Medio", HARD: "Difficile" };

	return (
		<div className="bg-card space-y-3 rounded-2xl border p-5">
			<div className="flex items-center justify-end gap-1.5">
				<Badge variant="outline" className="rounded-full text-[10px]">
					{typeLabels[question.questionType]}
				</Badge>
				<Badge
					variant="outline"
					className={cn("rounded-full text-[10px]", diffColors[question.difficulty])}
				>
					{diffLabels[question.difficulty]}
				</Badge>
			</div>

			<MarkdownRenderer content={question.content} className="text-sm font-medium" />

			<Collapsible open={open} onOpenChange={setOpen}>
				<CollapsibleTrigger asChild>
					<Button
						variant="outline"
						size="sm"
						className="w-full justify-between gap-1.5 rounded-xl"
					>
						{open ? "Nascondi opzioni e risposta" : "Mostra opzioni e risposta"}
						<ChevronDown
							className={cn("size-4 transition-transform", open && "rotate-180")}
						/>
					</Button>
				</CollapsibleTrigger>
				<CollapsibleContent className="space-y-1.5 pt-2">
					{options.length > 0 ? (
						options.map((option, oi) => {
							const isCorrect = isCorrectOption(option.id, question.correctAnswer);
							return (
								<div
									key={oi}
									className={cn(
										"flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
										isCorrect
											? "border border-green-500/30 bg-green-500/10 font-medium text-green-700 dark:text-green-400"
											: "bg-muted/50"
									)}
								>
									<span className="text-muted-foreground font-mono text-xs">
										{String.fromCharCode(65 + oi)}
									</span>
									<MarkdownRenderer content={option.text} inline />
									{isCorrect && (
										<CheckCircle2 className="ml-auto size-4 shrink-0 text-green-500" />
									)}
								</div>
							);
						})
					) : (
						<div className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
							<span className="font-medium">Risposta corretta: </span>
							{question.correctAnswer.join(", ")}
						</div>
					)}

					{question.explanation && (
						<div className="bg-muted/50 rounded-lg px-3 py-2">
							<p className="text-muted-foreground text-xs font-medium">Spiegazione</p>
							<MarkdownRenderer
								content={question.explanation}
								className="mt-0.5 text-sm"
							/>
						</div>
					)}
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}

function FileUploadPreview({ file }: { file: SubmittedFileUpload }) {
	const [downloading, setDownloading] = useState(false);

	async function handleDownload() {
		setDownloading(true);
		try {
			const signedUrl = await getFileDownloadUrlFn({
				data: { filePath: file.file_path },
			});
			const response = await fetch(signedUrl);
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = file.file_name;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch {
			toast.error("Errore nel download del file");
		} finally {
			setDownloading(false);
		}
	}

	return (
		<div className="bg-card flex items-center gap-4 rounded-2xl border p-5">
			<div className="rounded-xl bg-emerald-500/10 p-3">
				<FileUp className="size-6 text-emerald-500" strokeWidth={1.5} />
			</div>
			<div className="flex-1">
				<p className="font-medium">{file.file_name}</p>
				<p className="text-muted-foreground text-sm">
					{formatFileSize(file.file_size)}
				</p>
			</div>
			<Button
				variant="outline"
				size="sm"
				className="gap-1.5 rounded-xl"
				onClick={handleDownload}
				disabled={downloading}
			>
				<Download className="size-4" />
				{downloading ? "Download..." : "Scarica"}
			</Button>
		</div>
	);
}
