import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";
import { TIME_STEPS } from "@/lib/quiz/constants";

import { AnimatedBlock, AnimatedStack } from "./animated-block";
import { ClockFace } from "./clock-face";
import { EVAL_MODES } from "./fixtures";
import { FlashcardConfigFields, FlashcardSummary } from "./flashcard-config";
import { QuizConfigFields, QuizSummary } from "./quiz-config";
import { SessionDialogColumn, SessionDialogShell } from "./session-dialog";
import {
	EvalInfoCard,
	EvalSelect,
	SliderWithInput,
	TimeTickRow,
} from "./session-form-blocks";
import {
	CardStackBlock,
	EvalBlock,
	Eyebrow,
	MetricBlock,
	TimeBlock,
} from "./summary-blocks";
import { SummaryPanel } from "./summary-panel";

// Everything the three session dialogs are assembled from, under one entry: a change to a block is
// meant to be visible as a change to the dialog that uses it, and nine sidebar entries for one feature
// buried that.
const meta = {
	title: "Session Dialogs/Blocchi",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function ShellHarness({ isPending = false }: { isPending?: boolean }) {
	const [open, setOpen] = useState(true);
	return (
		<>
			{!open && <Button onClick={() => setOpen(true)}>Riapri</Button>}
			<SessionDialogShell open={open} onOpenChange={setOpen}>
				<SessionDialogColumn
					title="Configura il quiz"
					description="Scegli quante domande, quanto tempo e come si valuta."
					submitLabel="Inizia"
					onSubmit={() => setOpen(false)}
					onCancel={() => setOpen(false)}
					isPending={isPending}
				>
					<p className="text-muted-foreground text-sm">
						Qui vanno i campi; questa storia mostra la cornice.
					</p>
				</SessionDialogColumn>
				<SummaryPanel footerTip="Puoi cambiare tutto prima di iniziare.">
					<Eyebrow>Riepilogo</Eyebrow>
					<MetricBlock eyebrow="Domande" value={24} total={142} showBar />
				</SummaryPanel>
			</SessionDialogShell>
		</>
	);
}

export const Cornice: Story = {
	name: "La cornice",
	parameters: { layout: "centered" },
	render: () => <ShellHarness />,
};

/** Mid-submit: the action has to say it is working and stop taking a second click. */
export const CorniceInInvio: Story = {
	name: "La cornice, in invio",
	parameters: { layout: "centered" },
	render: () => <ShellHarness isPending />,
};

function QuizHarness({ max, modes }: { max: number; modes?: typeof EVAL_MODES }) {
	const [questionCount, setQuestionCount] = useState(Math.min(24, max));
	const [timeStepIndex, setTimeStepIndex] = useState(2);
	const [evalModeId, setEvalModeId] = useState(modes?.[0]?.id);
	const selected = modes?.find(m => m.id === evalModeId);
	const timeLimit =
		timeStepIndex < TIME_STEPS.length ? TIME_STEPS[timeStepIndex] : null;

	return (
		<div className="grid gap-8 md:grid-cols-2">
			<div className="space-y-5">
				<QuizConfigFields
					questionCount={questionCount}
					setQuestionCount={setQuestionCount}
					timeStepIndex={timeStepIndex}
					setTimeStepIndex={setTimeStepIndex}
					evalModeId={evalModeId}
					setEvalModeId={setEvalModeId}
					evalModes={modes}
					selectedEvalMode={selected}
					maxQuestions={max}
				/>
			</div>
			<SummaryPanel footerTip="Il riepilogo segue il form dal vivo.">
				<QuizSummary
					timeLimit={timeLimit}
					questionCount={questionCount}
					maxQuestions={max}
					selectedEvalMode={selected}
				/>
			</SummaryPanel>
		</div>
	);
}

function FlashcardHarness({ max }: { max: number }) {
	const [cardCount, setCardCount] = useState(Math.min(20, max));
	return (
		<div className="grid gap-8 md:grid-cols-2">
			<div className="space-y-5">
				<FlashcardConfigFields
					cardCount={cardCount}
					setCardCount={setCardCount}
					maxCards={max}
				/>
			</div>
			<SummaryPanel footerTip="Il riepilogo segue il form dal vivo.">
				<FlashcardSummary cardCount={cardCount} maxCards={max} />
			</SummaryPanel>
		</div>
	);
}

/** Form and summary side by side, as the dialog renders them: a change to one is a change to both. */
export const Campi: Story = {
	name: "I campi e il riepilogo",
	render: () => (
		<div className="space-y-12">
			<QuizHarness max={142} modes={EVAL_MODES} />
			<FlashcardHarness max={142} />
		</div>
	),
};

/** Fewer than two evaluation modes and the picker hides itself — one choice is not a choice. */
export const CampiAlLimite: Story = {
	name: "I campi al limite",
	render: () => (
		<div className="space-y-12">
			<QuizHarness max={40} modes={[EVAL_MODES[0]]} />
			<QuizHarness max={1} modes={EVAL_MODES} />
		</div>
	),
};

function FormBlocks() {
	const [count, setCount] = useState(24);
	const [single, setSingle] = useState(1);
	const [index, setIndex] = useState(2);
	const [mode, setMode] = useState(EVAL_MODES[0].id);
	const selected = EVAL_MODES.find(m => m.id === mode);
	return (
		<div className="grid max-w-4xl gap-10 md:grid-cols-2">
			<SliderWithInput
				label="Numero di domande"
				value={count}
				onChange={setCount}
				min={1}
				max={142}
				hint={`${count} di 142`}
			/>
			<SliderWithInput
				label="Una sola disponibile"
				value={single}
				onChange={setSingle}
				min={1}
				max={1}
				hint="Tutte (1)"
			/>
			<TimeTickRow steps={TIME_STEPS} index={index} onChange={setIndex} />
			<div className="space-y-4">
				<EvalSelect modes={EVAL_MODES} value={mode} onChange={setMode} />
				{selected && <EvalInfoCard mode={selected} />}
			</div>
		</div>
	);
}

export const BlocchiForm: Story = {
	name: "I blocchi del form",
	render: () => <FormBlocks />,
};

export const BlocchiRiepilogo: Story = {
	name: "I blocchi del riepilogo",
	render: () => (
		<div className="grid max-w-4xl gap-10 md:grid-cols-2">
			<div className="space-y-4">
				<MetricBlock eyebrow="Domande" value={24} total={142} showBar />
				<MetricBlock eyebrow="Domande" value={142} total={142} hint="Tutte" showBar />
				<TimeBlock minutes={15} questionCount={24} />
				<TimeBlock minutes={null} questionCount={24} />
				<CardStackBlock count={8} max={142} />
				{EVAL_MODES.map(mode => (
					<EvalBlock key={mode.id} mode={mode} questionCount={24} />
				))}
			</div>
			<SummaryPanel
				footerTip="Puoi cambiare tutto prima di iniziare."
				className="h-fit"
			>
				<Eyebrow>Riepilogo</Eyebrow>
				<MetricBlock eyebrow="Domande" value={24} total={142} showBar />
				<TimeBlock minutes={15} questionCount={24} />
				<EvalBlock mode={EVAL_MODES[1]} questionCount={24} />
			</SummaryPanel>
		</div>
	),
};

/** The sweep is the point: it has to read at a glance across every step the picker offers. */
export const Quadrante: Story = {
	name: "Il quadrante",
	render: () => (
		<div className="space-y-10">
			<div className="flex flex-wrap items-end gap-6">
				{[5, 10, 15, 20, 30, 45, 60, 90, 120, null].map(minutes => (
					<div key={String(minutes)} className="flex flex-col items-center gap-2">
						<ClockFace minutes={minutes} />
						<span className="text-muted-foreground text-2xs tabular-nums">
							{minutes === null ? "∞" : `${minutes}′`}
						</span>
					</div>
				))}
			</div>
			<div className="flex items-end gap-6">
				{[32, 48, 64, 96].map(size => (
					<ClockFace key={size} minutes={45} size={size} />
				))}
			</div>
		</div>
	),
};

/** Honours prefers-reduced-motion through motion.ts: with the OS setting on, the blocks just appear. */
export const Ingresso: Story = {
	name: "L'ingresso",
	render: () => (
		<AnimatedStack className="max-w-md space-y-3">
			{["Numero di domande", "Tempo", "Valutazione"].map(label => (
				<AnimatedBlock key={label}>
					<div className="bg-card rounded-2xl border p-4 shadow-sm">
						<p className="font-medium">{label}</p>
						<p className="text-muted-foreground text-sm">
							Ogni blocco entra dopo il precedente.
						</p>
					</div>
				</AnimatedBlock>
			))}
		</AnimatedStack>
	),
};
