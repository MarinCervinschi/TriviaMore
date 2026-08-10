import { AltArrowLeftIcon } from "@solar-icons/react/linear/alt-arrow-left";
import { BellRingIcon } from "@solar-icons/react/linear/bell-ring";
import { BookIcon } from "@solar-icons/react/linear/book";
import { Book2Icon } from "@solar-icons/react/linear/book-2";
import { BookMinimalisticIcon } from "@solar-icons/react/linear/book-minimalistic";
import { Buildings2Icon } from "@solar-icons/react/linear/buildings-2";
import { Buildings3Icon } from "@solar-icons/react/linear/buildings-3";
import { ChatRoundDotsIcon } from "@solar-icons/react/linear/chat-round-dots";
import { ChatRoundLineIcon } from "@solar-icons/react/linear/chat-round-line";
import { ChatSquare2Icon } from "@solar-icons/react/linear/chat-square-2";
import { ChatSquareArrowIcon } from "@solar-icons/react/linear/chat-square-arrow";
import { CityIcon } from "@solar-icons/react/linear/city";
import { CloudUploadIcon } from "@solar-icons/react/linear/cloud-upload";
import { ConfettiIcon } from "@solar-icons/react/linear/confetti";
import { DocumentAddIcon } from "@solar-icons/react/linear/document-add";
import { DocumentTextIcon } from "@solar-icons/react/linear/document-text";
import { DocumentsMinimalisticIcon } from "@solar-icons/react/linear/documents-minimalistic";
import { DonutIcon } from "@solar-icons/react/linear/donut";
import { DonutBittenIcon } from "@solar-icons/react/linear/donut-bitten";
import { FeedIcon } from "@solar-icons/react/linear/feed";
import { FileCorruptedIcon } from "@solar-icons/react/linear/file-corrupted";
import { FileSendIcon } from "@solar-icons/react/linear/file-send";
import { FilterIcon } from "@solar-icons/react/linear/filter";
import { FiltersIcon } from "@solar-icons/react/linear/filters";
import { LayersMinimalisticIcon } from "@solar-icons/react/linear/layers-minimalistic";
import { LetterOpenedIcon } from "@solar-icons/react/linear/letter-opened";
import { LetterUnreadIcon } from "@solar-icons/react/linear/letter-unread";
import { MagicWandIcon } from "@solar-icons/react/linear/magic-wand";
import { MagnifierIcon } from "@solar-icons/react/linear/magnifier";
import { MagnifierZoomOutIcon } from "@solar-icons/react/linear/magnifier-zoom-out";
import { MailboxIcon } from "@solar-icons/react/linear/mailbox";
import { MinimalisticMagnifierIcon } from "@solar-icons/react/linear/minimalistic-magnifier";
import { MinusCircleIcon } from "@solar-icons/react/linear/minus-circle";
import { NotebookIcon } from "@solar-icons/react/linear/notebook";
import { NotesIcon } from "@solar-icons/react/linear/notes";
import { PenIcon } from "@solar-icons/react/linear/pen";
import { Pen2Icon } from "@solar-icons/react/linear/pen-2";
import { PenNewRoundIcon } from "@solar-icons/react/linear/pen-new-round";
import { PenNewSquareIcon } from "@solar-icons/react/linear/pen-new-square";
import { PlaneIcon } from "@solar-icons/react/linear/plane";
import { Plane2Icon } from "@solar-icons/react/linear/plane-2";
import { Plane3Icon } from "@solar-icons/react/linear/plane-3";
import { QuestionCircleIcon } from "@solar-icons/react/linear/question-circle";
import { QuestionSquareIcon } from "@solar-icons/react/linear/question-square";
import { RecordCircleIcon } from "@solar-icons/react/linear/record-circle";
import { RocketIcon } from "@solar-icons/react/linear/rocket";
import { RoundSortVerticalIcon } from "@solar-icons/react/linear/round-sort-vertical";
import { SendSquareIcon } from "@solar-icons/react/linear/send-square";
import { SettingsMinimalisticIcon } from "@solar-icons/react/linear/settings-minimalistic";
import { ShieldIcon } from "@solar-icons/react/linear/shield";
import { ShieldCheckIcon } from "@solar-icons/react/linear/shield-check";
import { ShieldMinimalisticIcon } from "@solar-icons/react/linear/shield-minimalistic";
import { ShieldStarIcon } from "@solar-icons/react/linear/shield-star";
import { ShieldUserIcon } from "@solar-icons/react/linear/shield-user";
import { SidebarIcon } from "@solar-icons/react/linear/sidebar";
import { SidebarMinimalisticIcon } from "@solar-icons/react/linear/sidebar-minimalistic";
import { SledgehammerIcon } from "@solar-icons/react/linear/sledgehammer";
import { SliderMinimalisticHorizontalIcon } from "@solar-icons/react/linear/slider-minimalistic-horizontal";
import { SortVerticalIcon } from "@solar-icons/react/linear/sort-vertical";
import { SquareSortVerticalIcon } from "@solar-icons/react/linear/square-sort-vertical";
import { StarShineIcon } from "@solar-icons/react/linear/star-shine";
import { StarsIcon } from "@solar-icons/react/linear/stars";
import { StarsMinimalisticIcon } from "@solar-icons/react/linear/stars-minimalistic";
import { TuningIcon } from "@solar-icons/react/linear/tuning";
import { Tuning2Icon } from "@solar-icons/react/linear/tuning-2";
import { Tuning4Icon } from "@solar-icons/react/linear/tuning-4";
import { UploadMinimalisticIcon } from "@solar-icons/react/linear/upload-minimalistic";
import { UploadSquareIcon } from "@solar-icons/react/linear/upload-square";
import { UserIdIcon } from "@solar-icons/react/linear/user-id";
import { Widget4Icon } from "@solar-icons/react/linear/widget-4";
import type { Meta, StoryObj } from "@storybook/react-vite";

import type { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";

// Throwaway lab for the D3 + D11 sweep — the 17 substitutions ICON_MAP.md flags as
// changing the drawing enough to need a look. Delete once the answers are recorded.

const meta = {
	title: "Style Lab/Sostituzioni icone",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Candidate = { name: string; Comp: Icon; chosen?: boolean };
type Row = { replaces: string; sites: number; where: string; candidates: Candidate[] };

const ROWS: Row[] = [
	{
		replaces: "SlidersHorizontal → Colonne",
		sites: 1,
		where: "visibilità colonne della tabella — respinta come filters",
		candidates: [
			{ name: "tuning-2", Comp: Tuning2Icon, chosen: true },
			{ name: "tuning", Comp: TuningIcon },
			{ name: "tuning-4", Comp: Tuning4Icon },
			{
				name: "slider-minimalistic-horizontal",
				Comp: SliderMinimalisticHorizontalIcon,
			},
			{ name: "widget-4", Comp: Widget4Icon },
			{ name: "layers-minimalistic", Comp: LayersMinimalisticIcon },
			{ name: "filters (respinta)", Comp: FiltersIcon },
		],
	},
	{
		replaces: "SlidersHorizontal → Filtri grafo",
		sites: 4,
		where: "pannello filtri del grafo",
		candidates: [
			{ name: "filter", Comp: FilterIcon, chosen: true },
			{ name: "tuning-2", Comp: Tuning2Icon },
			{ name: "filters (respinta)", Comp: FiltersIcon },
		],
	},
	{
		replaces: "BookOpen",
		sites: 17,
		where: "sezioni, quiz, catalogo",
		candidates: [
			{ name: "book", Comp: BookIcon, chosen: true },
			{ name: "book-2", Comp: Book2Icon },
			{ name: "book-minimalistic", Comp: BookMinimalisticIcon },
			{ name: "notebook", Comp: NotebookIcon },
		],
	},
	{
		replaces: "Sparkles",
		sites: 10,
		where: "flashcard, novità, esami",
		candidates: [
			{ name: "stars", Comp: StarsIcon, chosen: true },
			{ name: "stars-minimalistic", Comp: StarsMinimalisticIcon },
			{ name: "star-shine", Comp: StarShineIcon },
			{ name: "magic-wand", Comp: MagicWandIcon },
		],
	},
	{
		replaces: "Pencil",
		sites: 9,
		where: "azioni di riga, accanto al cestino",
		candidates: [
			{ name: "pen-2", Comp: Pen2Icon, chosen: true },
			{ name: "pen", Comp: PenIcon },
			{ name: "pen-new-square", Comp: PenNewSquareIcon },
			{ name: "pen-new-round", Comp: PenNewRoundIcon },
		],
	},
	{
		replaces: "FileUp",
		sites: 5,
		where: "import massivo, richieste file",
		candidates: [
			{ name: "cloud-upload", Comp: CloudUploadIcon, chosen: true },
			{ name: "upload-minimalistic", Comp: UploadMinimalisticIcon },
			{ name: "upload-square", Comp: UploadSquareIcon },
			{ name: "file-send", Comp: FileSendIcon },
		],
	},
	{
		replaces: "Megaphone → news",
		sites: 3,
		where: "nav e pagina news",
		candidates: [
			{ name: "feed", Comp: FeedIcon, chosen: true },
			{ name: "notes", Comp: NotesIcon },
			{ name: "documents-minimalistic", Comp: DocumentsMinimalisticIcon },
		],
	},
	{
		replaces: "Megaphone → changelog",
		sites: 1,
		where: "annuncio changelog",
		candidates: [
			{ name: "confetti", Comp: ConfettiIcon, chosen: true },
			{ name: "bell-ring", Comp: BellRingIcon },
			{ name: "stars", Comp: StarsIcon },
		],
	},
	{
		replaces: "MessageSquarePlus",
		sites: 4,
		where: "nuova richiesta",
		candidates: [
			{ name: "chat-round-dots", Comp: ChatRoundDotsIcon, chosen: true },
			{ name: "chat-round-line", Comp: ChatRoundLineIcon },
			{ name: "chat-square-2", Comp: ChatSquare2Icon },
			{ name: "chat-square-arrow", Comp: ChatSquareArrowIcon },
		],
	},
	{
		replaces: "Send",
		sites: 3,
		where: "invia messaggio",
		candidates: [
			{ name: "plane-2", Comp: Plane2Icon, chosen: true },
			{ name: "plane", Comp: PlaneIcon },
			{ name: "plane-3", Comp: Plane3Icon },
			{ name: "send-square", Comp: SendSquareIcon },
		],
	},
	{
		replaces: "ShieldCheck / Shield / ShieldHalf",
		sites: 3,
		where: "SUPERADMIN · ADMIN · MAINTAINER",
		candidates: [
			{ name: "shield-star", Comp: ShieldStarIcon, chosen: true },
			{ name: "shield-check", Comp: ShieldCheckIcon, chosen: true },
			{ name: "shield-user", Comp: ShieldUserIcon, chosen: true },
			{ name: "shield", Comp: ShieldIcon },
			{ name: "shield-minimalistic", Comp: ShieldMinimalisticIcon },
		],
	},
	{
		replaces: "Cookie",
		sites: 2,
		where: "cookie policy",
		candidates: [
			{ name: "donut-bitten", Comp: DonutBittenIcon, chosen: true },
			{ name: "donut", Comp: DonutIcon },
			{ name: "document-text", Comp: DocumentTextIcon },
		],
	},
	{
		replaces: "FileQuestion",
		sites: 2,
		where: "nav admin → domande",
		candidates: [
			{ name: "question-square", Comp: QuestionSquareIcon, chosen: true },
			{ name: "question-circle", Comp: QuestionCircleIcon },
			{ name: "file-corrupted", Comp: FileCorruptedIcon },
			{ name: "document-text", Comp: DocumentTextIcon },
		],
	},
	{
		replaces: "FileEdit",
		sites: 2,
		where: "richiesta da revisionare",
		candidates: [
			{ name: "pen-new-square", Comp: PenNewSquareIcon, chosen: true },
			{ name: "document-add", Comp: DocumentAddIcon },
			{ name: "notes", Comp: NotesIcon },
		],
	},
	{
		replaces: "PanelLeft / PanelLeftClose",
		sites: 4,
		where: "apri e chiudi la sidebar",
		candidates: [
			{ name: "sidebar-minimalistic", Comp: SidebarMinimalisticIcon, chosen: true },
			{ name: "sidebar", Comp: SidebarIcon, chosen: true },
			{ name: "alt-arrow-left", Comp: AltArrowLeftIcon },
		],
	},
	{
		replaces: "ArrowUpDown / ChevronsUpDown",
		sites: 2,
		where: "ordinamento colonna, combobox",
		candidates: [
			{ name: "sort-vertical", Comp: SortVerticalIcon, chosen: true },
			{ name: "round-sort-vertical", Comp: RoundSortVerticalIcon },
			{ name: "square-sort-vertical", Comp: SquareSortVerticalIcon },
		],
	},
	{
		replaces: "Landmark",
		sites: 1,
		where: "area SOCIETA_CULTURA",
		candidates: [
			{ name: "city", Comp: CityIcon, chosen: true },
			{ name: "buildings-2", Comp: Buildings2Icon },
			{ name: "buildings-3", Comp: Buildings3Icon },
		],
	},
	{
		replaces: "Construction",
		sites: 1,
		where: "badge in arrivo",
		candidates: [
			{ name: "rocket", Comp: RocketIcon, chosen: true },
			{ name: "sledgehammer", Comp: SledgehammerIcon },
			{ name: "settings-minimalistic", Comp: SettingsMinimalisticIcon },
		],
	},
	{
		replaces: "CircleDot",
		sites: 1,
		where: "legenda risultati quiz — non risposte",
		candidates: [
			{ name: "record-circle", Comp: RecordCircleIcon, chosen: true },
			{ name: "minus-circle", Comp: MinusCircleIcon },
			{ name: "question-circle", Comp: QuestionCircleIcon },
		],
	},
	{
		replaces: "MailCheck",
		sites: 1,
		where: "email verificata",
		candidates: [
			{ name: "letter-opened", Comp: LetterOpenedIcon, chosen: true },
			{ name: "letter-unread", Comp: LetterUnreadIcon },
			{ name: "mailbox", Comp: MailboxIcon },
		],
	},
	{
		replaces: "UserCog",
		sites: 1,
		where: "assegnata a — richiesta admin",
		candidates: [
			{ name: "user-id", Comp: UserIdIcon, chosen: true },
			{ name: "shield-user", Comp: ShieldUserIcon },
			{ name: "settings-minimalistic", Comp: SettingsMinimalisticIcon },
		],
	},
	{
		replaces: "SearchX",
		sites: 1,
		where: "nessun risultato",
		candidates: [
			{ name: "magnifier", Comp: MagnifierIcon, chosen: true },
			{ name: "minimalistic-magnifier", Comp: MinimalisticMagnifierIcon },
			{ name: "magnifier-zoom-out", Comp: MagnifierZoomOutIcon },
		],
	},
];

function CandidateCell({ name, Comp, chosen }: Candidate) {
	return (
		<div
			className={
				chosen
					? "border-primary bg-primary/5 flex min-w-32 flex-col items-center gap-2 rounded-xl border p-3"
					: "border-border flex min-w-32 flex-col items-center gap-2 rounded-xl border p-3"
			}
		>
			<div className="flex items-end gap-3">
				<Comp className="size-4" />
				<Comp className="size-5" />
				<Comp className="size-7" />
			</div>
			<p className="text-muted-foreground text-center text-[11px] break-all">{name}</p>
		</div>
	);
}

export const DaGuardare: Story = {
	name: "Da guardare",
	render: () => (
		<div className="space-y-8">
			<p className="text-muted-foreground max-w-prose text-sm">
				Il bordo arancione è la scelta già applicata all&apos;app. Le colonne sono 16,
				20 e 28 px — la dimensione a cui l&apos;icona viene effettivamente usata è la
				prima.
			</p>
			{ROWS.map(row => (
				<div key={row.replaces} className="space-y-3">
					<div className="flex flex-wrap items-baseline gap-2">
						<h3 className="text-sm font-semibold">{row.replaces}</h3>
						<Badge variant="secondary">
							{row.sites} {row.sites === 1 ? "punto" : "punti"}
						</Badge>
						<span className="text-muted-foreground text-xs">{row.where}</span>
					</div>
					<div className="flex flex-wrap gap-3">
						{row.candidates.map(c => (
							<CandidateCell key={`${row.replaces}-${c.name}`} {...c} />
						))}
					</div>
				</div>
			))}
		</div>
	),
};
