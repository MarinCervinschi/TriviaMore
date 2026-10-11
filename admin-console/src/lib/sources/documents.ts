import { cinecaCatalogue } from "./specs/cineca-catalogue";
import { easyAcademy } from "./specs/easyacademy";

/** One OpenAPI document per data source, as the endpoint explorer lists them. */
export const SOURCE_DOCUMENTS = [
	{ slug: "catalogo-cineca", title: "Catalogo CINECA", content: cinecaCatalogue },
	{ slug: "easyacademy", title: "EasyAcademy", content: easyAcademy },
];

/** The hosts the proxy may reach: exactly the servers the documents declare. */
export const SOURCE_HOSTS = new Set(
	SOURCE_DOCUMENTS.flatMap(document =>
		document.content.servers.map(server => new URL(server.url).host)
	)
);
