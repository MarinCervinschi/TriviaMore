import { RefreshIcon } from "@solar-icons/react/linear/refresh";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Spinner } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { InsetCard } from "@/components/ui/inset-card";

import { ConsolePage } from "~/components/console-page";
import { StatusBadge } from "~/components/status-badge";
import { connectionQueries } from "~/lib/connections/queries";
import type { ConnectionStatus } from "~/lib/connections/types";

export const Route = createFileRoute("/_console/settings/")({
	loader: ({ context }) => context.queryClient.ensureQueryData(connectionQueries.all()),
	component: ConnectionsPage,
});

function ConnectionsPage() {
	const {
		data: connections,
		refetch,
		isFetching,
	} = useSuspenseQuery(connectionQueries.all());

	return (
		<ConsolePage
			title="Connessioni"
			description="I database a cui la console è collegata. Lo staging si legge e si scrive, la produzione solo si legge."
			actions={
				<Button
					size="sm"
					variant="outline"
					onClick={() => void refetch()}
					disabled={isFetching}
				>
					{isFetching ? <Spinner /> : <RefreshIcon className="size-4" />}
					{isFetching ? "Controllo…" : "Ricontrolla"}
				</Button>
			}
		>
			<div className="grid gap-4 lg:grid-cols-2">
				{connections.map(connection => (
					<ConnectionCard key={connection.id} connection={connection} />
				))}
			</div>
		</ConsolePage>
	);
}

function ConnectionCard({ connection }: { connection: ConnectionStatus }) {
	const writableProduction = connection.expectReadOnly && connection.readOnly === false;

	return (
		<InsetCard
			title={connection.label}
			actions={<StateBadge connection={connection} />}
		>
			<dl className="divide-y text-sm">
				<Row label="Variabile">
					<code className="font-mono text-xs">{connection.env}</code>
				</Row>
				<Row label="Destinazione">
					{connection.target ? (
						<code className="font-mono text-xs">{connection.target}</code>
					) : (
						<span className="text-muted-foreground">Non configurata</span>
					)}
				</Row>
				{connection.state === "ok" && (
					<>
						<Row label="Database">{connection.database}</Row>
						<Row label="Postgres">{connection.version}</Row>
						<Row label="Latenza">{connection.latencyMs} ms</Row>
						<Row label="Accesso">
							{connection.readOnly ? "Sola lettura" : "Lettura e scrittura"}
						</Row>
					</>
				)}
			</dl>
			{connection.state === "unconfigured" && (
				<p className="text-muted-foreground border-t px-4 py-3 text-xs">
					Aggiungi <code className="font-mono">{connection.env}</code> in Infisical e
					riavvia la console.
				</p>
			)}
			{connection.error && (
				<p role="alert" className="text-danger border-t px-4 py-3 text-xs">
					{connection.error}
				</p>
			)}
			{writableProduction && (
				<p role="alert" className="text-danger border-t px-4 py-3 text-xs">
					Questa credenziale può scrivere in produzione. Usa un ruolo con
					<code className="font-mono"> default_transaction_read_only = on</code>.
				</p>
			)}
		</InsetCard>
	);
}

function StateBadge({ connection }: { connection: ConnectionStatus }) {
	if (connection.state === "unconfigured") {
		return <StatusBadge status="neutral">Non configurata</StatusBadge>;
	}
	if (connection.state === "unreachable") {
		return <StatusBadge status="danger">Non raggiungibile</StatusBadge>;
	}
	if (connection.expectReadOnly && !connection.readOnly) {
		return <StatusBadge status="danger">Scrivibile</StatusBadge>;
	}
	return <StatusBadge status="success">Collegata</StatusBadge>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex items-center justify-between gap-4 px-4 py-2.5">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="min-w-0 truncate text-right">{children}</dd>
		</div>
	);
}
