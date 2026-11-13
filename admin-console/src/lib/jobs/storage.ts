import { z } from "zod";

import { reapOrphanAttachments } from "@/lib/requests/service/attachments";

import { changesOf, section } from "./changes";
import type { JobDefinition } from "./types";

const noParams = z.object({});

export const storageReapAttachments: JobDefinition<typeof noParams> = {
	name: "storage.reap-attachments",
	label: "Cancella gli allegati orfani",
	area: "Archivio",
	description:
		"Cancella gli allegati caricati più di un giorno fa che nessuna richiesta usa, per esempio quando l'utente ha chiuso il modulo dopo il caricamento.",
	command: "pnpm storage:reap-attachments",
	terminal: { dryRun: "", apply: "--apply" },
	params: noParams,
	fields: [],
	async run(_params, { db, dryRun, signal }) {
		const { scanned, orphans } = await reapOrphanAttachments({ db, dryRun, signal });
		const megabytes =
			orphans.reduce((total, object) => total + object.size, 0) / 1024 / 1024;
		return {
			summary: {
				Allegati: scanned,
				[dryRun ? "Da cancellare" : "Cancellati"]: orphans.length,
				MB: megabytes.toFixed(1),
			},
			changes: changesOf(
				section(
					"orphans",
					"Allegati senza richiesta",
					orphans.map(object => ({
						kind: "removed",
						label: object.key,
						detail: object.lastModified.toISOString(),
					}))
				)
			),
		};
	},
};
