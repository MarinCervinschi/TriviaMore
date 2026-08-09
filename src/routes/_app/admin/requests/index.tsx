import { useMemo } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Inbox } from "lucide-react";
import { z } from "zod";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
	DataTable,
	DataTableToolbar,
	createDataTableColumns,
	dataTableSearchFields,
	useDataTable,
} from "@/components/data-table";
import { RequestStatusBadge } from "@/components/requests/request-status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requestQueries } from "@/lib/requests/queries";
import type {
	AdminContentRequest,
	ContentRequestStatus,
	SubmittedContent,
} from "@/lib/requests/types";
import { seoHead } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format";

// Open requests still await action; the rest are considered handled (approved,
// acknowledged or rejected) and are hidden from the default view.
const OPEN_STATUSES: ContentRequestStatus[] = ["PENDING", "NEEDS_REVISION"];
const isOpen = (r: AdminContentRequest) => OPEN_STATUSES.includes(r.status);
const isReport = (r: AdminContentRequest) => r.requestType === "REPORT";

const TYPE_TABS = ["reports", "proposals"] as const;
const STATUS_FILTERS = [
	{ value: "open", label: "Da gestire" },
	{ value: "handled", label: "Gestite" },
	{ value: "all", label: "Tutte" },
] as const;

type TypeTab = (typeof TYPE_TABS)[number];
type StatusFilter = (typeof STATUS_FILTERS)[number]["value"];

function generateTitle(submitted: SubmittedContent): string {
	if (submitted.type === "section") return `Nuova sezione: ${submitted.name}`;
	if (submitted.type === "report") return "Segnalazione";
	if (submitted.type === "file_upload") return `File: ${submitted.file_name}`;
	const count = submitted.questions.length;
	return `${count} ${count === 1 ? "domanda" : "domande"}`;
}

export const Route = createFileRoute("/_app/admin/requests/")({
	validateSearch: z.object({
		...dataTableSearchFields,
		tab: z.enum(TYPE_TABS).optional().catch(undefined),
		status: z
			.enum(STATUS_FILTERS.map(f => f.value) as [StatusFilter, ...StatusFilter[]])
			.optional()
			.catch(undefined),
	}),
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(requestQueries.adminRequests()),
	head: () => seoHead({ title: "Richieste contenuto", noindex: true }),
	component: AdminRequestsPage,
});

const column = createDataTableColumns<AdminContentRequest>();

const columns = [
	column.accessor(request => request.user.name ?? request.user.email ?? "", {
		id: "user",
		header: "Utente",
		meta: { label: "Utente" },
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Avatar className="h-7 w-7">
					<AvatarImage src={row.original.user.image ?? undefined} />
					<AvatarFallback className="text-[10px]">
						{(
							row.original.user.name?.[0] ??
							row.original.user.email?.[0] ??
							"?"
						).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<span className="group-hover:text-primary text-sm font-medium transition-colors">
					{row.original.user.name ?? row.original.user.email ?? "Utente"}
				</span>
			</div>
		),
	}),
	column.accessor("status", {
		header: "Stato",
		meta: { label: "Stato" },
		cell: ({ row }) => <RequestStatusBadge status={row.original.status} />,
	}),
	column.accessor("createdAt", {
		header: "Data",
		meta: { label: "Data", cellClassName: "text-muted-foreground text-sm" },
		cell: ({ row }) => formatDate(row.original.createdAt),
	}),
	column.accessor(request => request.handledByUser?.name ?? "", {
		id: "handledBy",
		header: "Gestita da",
		meta: { label: "Gestita da" },
		cell: ({ row }) =>
			row.original.handledAt ? (
				<div className="flex items-center gap-2">
					<Avatar className="h-6 w-6">
						<AvatarImage src={row.original.handledByUser?.image ?? undefined} />
						<AvatarFallback className="text-[9px]">
							{(row.original.handledByUser?.name?.[0] ?? "T").toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<span className="text-muted-foreground text-sm">
						{row.original.handledByUser?.name ?? "Team"}
					</span>
				</div>
			) : (
				<span className="text-muted-foreground/50 text-sm">—</span>
			),
	}),
];

function AdminRequestsPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const search = Route.useSearch();
	const { data: requests } = useSuspenseQuery(requestQueries.adminRequests());

	const tab: TypeTab = search.tab ?? "reports";
	const statusFilter: StatusFilter = search.status ?? "open";

	const openProposals = requests.filter(r => !isReport(r) && isOpen(r)).length;
	const openReports = requests.filter(r => isReport(r) && isOpen(r)).length;

	const byTab = useMemo(
		() => requests.filter(r => (tab === "reports" ? isReport(r) : !isReport(r))),
		[requests, tab]
	);

	const filtered = useMemo(
		() =>
			byTab.filter(r => {
				if (statusFilter === "open") return isOpen(r);
				if (statusFilter === "handled") return !isOpen(r);
				return true;
			}),
		[byTab, statusFilter]
	);

	const table = useDataTable({
		data: filtered,
		columns,
		getRowId: row => row.id,
		searchFn: (request, query) =>
			generateTitle(request.submitted).toLowerCase().includes(query) ||
			request.targetLabel.toLowerCase().includes(query) ||
			(request.user.name?.toLowerCase().includes(query) ?? false),
		urlState: {
			values: search,
			onChange: patch => navigate({ search: prev => ({ ...prev, ...patch }) }),
		},
	});

	return (
		<div className="space-y-6 py-2">
			<AdminPageHeader
				title="Richieste contenuto"
				description="Gestisci le richieste degli utenti per nuovi contenuti e segnalazioni."
			/>

			<Tabs
				value={tab}
				onValueChange={value =>
					navigate({
						search: prev => ({ ...prev, tab: value as TypeTab, page: undefined }),
					})
				}
			>
				<TabsList className="bg-muted/50 rounded-2xl p-1">
					<TabsTrigger
						value="reports"
						className="data-[state=active]:bg-background gap-1.5 rounded-xl data-[state=active]:shadow-sm"
					>
						Segnalazioni
						{openReports > 0 && <TabCount value={openReports} />}
					</TabsTrigger>
					<TabsTrigger
						value="proposals"
						className="data-[state=active]:bg-background gap-1.5 rounded-xl data-[state=active]:shadow-sm"
					>
						Contenuti proposti
						{openProposals > 0 && <TabCount value={openProposals} />}
					</TabsTrigger>
				</TabsList>
			</Tabs>

			<DataTable
				table={table}
				rowLink={row => (
					<Link
						to="/admin/requests/$requestId"
						params={{ requestId: row.id }}
						aria-label="Apri richiesta"
					/>
				)}
				toolbar={
					<DataTableToolbar
						table={table}
						filters={
							<div className="flex flex-wrap gap-1.5">
								{STATUS_FILTERS.map(filter => (
									<button
										key={filter.value}
										onClick={() =>
											navigate({
												search: prev => ({
													...prev,
													status: filter.value,
													page: undefined,
												}),
											})
										}
										className={cn(
											"rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
											statusFilter === filter.value
												? "bg-primary text-primary-foreground"
												: "bg-muted text-muted-foreground hover:bg-accent"
										)}
									>
										{filter.label}
									</button>
								))}
							</div>
						}
					/>
				}
				empty={
					<EmptyState
						icon={Inbox}
						title={
							filtered.length === 0
								? statusFilter === "open"
									? "Nessuna richiesta da gestire"
									: "Nessuna richiesta"
								: "Nessun risultato"
						}
						description={
							filtered.length === 0
								? tab === "reports"
									? "Non ci sono segnalazioni in questa vista."
									: "Non ci sono contenuti proposti in questa vista."
								: "Prova a modificare i filtri o la ricerca."
						}
					/>
				}
			/>
		</div>
	);
}

function TabCount({ value }: { value: number }) {
	return (
		<span className="bg-primary text-primary-foreground flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold">
			{value}
		</span>
	);
}
