import { useState } from "react";

import { BuildingsIcon } from "@solar-icons/react/linear/buildings";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AvatarChooser } from "@/components/onboarding/avatar-chooser";
import { avatarChoices } from "@/components/onboarding/avatar-fixtures";
import { CoursePicker } from "@/components/onboarding/course-picker";
import { EnrollmentCard } from "@/components/onboarding/enrollment-card";
import { EnrollmentPrompt } from "@/components/onboarding/enrollment-prompt";
import {
	DEPARTMENTS,
	DSV_COURSES,
	FIM_COURSES,
	SUGGESTED_COURSES,
	SUGGESTED_DEPARTMENTS,
} from "@/components/onboarding/fixtures";
import { OnboardingPicker } from "@/components/onboarding/onboarding-picker";
import { OnboardingRecap } from "@/components/onboarding/onboarding-recap";
import {
	type OnboardingStep,
	OnboardingSteps,
} from "@/components/onboarding/onboarding-steps";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { ProfileStep } from "@/components/onboarding/profile-step";
import { AvatarEditor } from "@/components/user/avatar-editor";

const STEPS: OnboardingStep[] = [
	{ id: "department", label: "Dipartimento" },
	{ id: "course", label: "Corso di studi" },
	{ id: "profile", label: "Profilo" },
];

const COPY = [
	{
		title: "Da quale dipartimento vieni?",
		description: "Serve a restringere i corsi del passo successivo.",
	},
	{
		title: "Qual è il tuo corso?",
		description: "Da qui nascono la carriera, la media e la base di laurea.",
	},
	{
		title: "Ci siamo",
		description: "Controlla che sia tutto giusto, poi scegli come farti vedere.",
	},
];

const meta = {
	title: "Onboarding/Onboarding",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The whole three-step flow, driven by local state. No mutation is wired: a story
 * has no server, so "Conferma" only advances the rail.
 */
function WizardExample({
	withSuggestions = true,
	courses = FIM_COURSES,
	startAt = 0,
}: {
	withSuggestions?: boolean;
	courses?: typeof FIM_COURSES;
	startAt?: number;
}) {
	const [step, setStep] = useState(startAt);
	const [furthest, setFurthest] = useState(startAt);
	const [departmentId, setDepartmentId] = useState<string | null>(null);
	const [courseId, setCourseId] = useState<string | null>(null);
	const [name, setName] = useState("Marin Cervinschi");
	const [page, setPage] = useState(0);
	const [seed, setSeed] = useState<string | null>(null);
	const [uploaded, setUploaded] = useState<string | null>(null);

	const choices = avatarChoices(page);
	// An upload wins over a picked seed, as it does in the app: the story has no
	// server, so it previews the file locally rather than doing nothing at all.
	const avatarUri = uploaded ?? choices.find(choice => choice.seed === seed)?.dataUri;
	const chosen = [departmentId, courseId, name.trim() || null][step];
	const copy = COPY[step] ?? COPY[2]!;

	const go = (next: number) => {
		setStep(next);
		setFurthest(current => Math.max(current, next));
	};

	return (
		<div className="mx-auto max-w-2xl">
			<OnboardingWizard
				steps={STEPS}
				current={step}
				maxReachable={furthest}
				onStepSelect={go}
				title={copy.title}
				description={copy.description}
				onPrevious={step === 0 ? undefined : () => go(step - 1)}
				onNext={() => go(Math.min(step + 1, STEPS.length))}
				nextLabel={step === STEPS.length - 1 ? "Conferma" : "Avanti"}
				nextDisabled={!chosen}
				onSkip={() => {}}
			>
				{step === 0 && (
					<OnboardingPicker
						options={DEPARTMENTS}
						suggestions={withSuggestions ? SUGGESTED_DEPARTMENTS : []}
						value={departmentId}
						onSelect={setDepartmentId}
						placeholder="Cerca un dipartimento…"
						emptyLabel="Nessun dipartimento trovato."
					/>
				)}
				{step === 1 && (
					<CoursePicker
						options={courses}
						suggestions={withSuggestions ? SUGGESTED_COURSES : []}
						value={courseId}
						onSelect={setCourseId}
					/>
				)}
				{step >= 2 && (
					<div className="flex flex-col gap-5">
						<OnboardingRecap
							name={name}
							imageUrl={avatarUri}
							initials="MC"
							entries={[
								{
									label: "Dipartimento",
									icon: BuildingsIcon,
									value:
										DEPARTMENTS.find(item => item.id === departmentId)?.name ?? null,
									onEdit: () => go(0),
								},
								{
									label: "Corso",
									icon: DiplomaIcon,
									value: courses.find(item => item.id === courseId)?.name ?? null,
									onEdit: () => go(1),
								},
							]}
						/>
						<ProfileStep
							name={name}
							onNameChange={setName}
							initials="MC"
							imageUrl={avatarUri}
							avatarChooser={
								<AvatarChooser
									choices={choices}
									selectedSeed={seed}
									onSelect={next => {
										setSeed(next);
										setUploaded(null);
									}}
									onShuffle={() => setPage(current => current + 1)}
									onUpload={file => {
										setUploaded(URL.createObjectURL(file));
										setSeed(null);
									}}
								/>
							}
						/>
					</div>
				)}
			</OnboardingWizard>
		</div>
	);
}

export const IlFlusso: Story = {
	name: "Il flusso completo",
	render: () => <WizardExample />,
};

export const IlCorso: Story = {
	name: "Il corso, con i segmenti",
	render: () => <WizardExample startAt={1} />,
};

/** DSV runs single-cycle degrees, so the third segment appears only here. */
export const CicloUnico: Story = {
	name: "Il corso, con il ciclo unico",
	render: () => <WizardExample startAt={1} courses={DSV_COURSES} />,
};

export const IlRecap: Story = {
	name: "Il recap finale",
	render: () => <WizardExample startAt={2} />,
};

export const SenzaSuggerimenti: Story = {
	name: "Senza suggerimenti",
	render: () => <WizardExample withSuggestions={false} />,
};

export const SuTelefono: Story = {
	name: "Su telefono",
	globals: { viewport: { value: "iphone6" } },
	render: () => <WizardExample startAt={1} />,
};

export const LaRotaia: Story = {
	name: "La rotaia, nei quattro stati",
	render: () => (
		<div className="flex max-w-2xl flex-col gap-6">
			{[0, 1, 2, 3].map(current => (
				<OnboardingSteps key={current} steps={STEPS} current={current} />
			))}
		</div>
	),
};

/** Every step reached, so all of them are clickable except the one you are on. */
export const LaRotaiaCliccabile: Story = {
	name: "La rotaia, cliccabile",
	render: () => {
		function Example() {
			const [step, setStep] = useState(2);
			return (
				<OnboardingSteps
					steps={STEPS}
					current={step}
					maxReachable={2}
					onStepSelect={setStep}
					className="max-w-2xl"
				/>
			);
		}
		return <Example />;
	},
};

export const IlSelettore: Story = {
	name: "Il selettore, da solo",
	render: () => (
		<div className="border-border/50 bg-card max-w-xl rounded-xl border p-2">
			<OnboardingPicker
				options={DEPARTMENTS}
				suggestions={SUGGESTED_DEPARTMENTS}
				value={DEPARTMENTS[9]!.id}
				onSelect={() => {}}
				placeholder="Cerca un dipartimento…"
				emptyLabel="Nessun dipartimento trovato."
			/>
		</div>
	),
};

const ENROLLMENT = {
	id: "e1",
	courseId: "16-315",
	courseName: "Informatica",
	courseCode: "16-315",
	courseType: "BACHELOR" as const,
	courseCfu: 180,
	departmentId: "fim",
	departmentName: "Dipartimento di Scienze Fisiche, Informatiche e Matematiche",
	departmentCode: "FIM",
	curriculum: null,
	startYear: null,
};

/** The dashboard nudge, which is what reaches accounts made before the wizard.
 *  It sits beside the profile in the hero, so it is shown at that width. */
export const IlPromemoria: Story = {
	name: "Il promemoria in dashboard",
	render: () => (
		<div className="lg:w-72">
			<EnrollmentPrompt />
		</div>
	),
};

export const InImpostazioni: Story = {
	name: "In impostazioni, con un corso",
	parameters: {
		queryData: [[["crm", "current-enrollment"], ENROLLMENT]],
	},
	render: () => (
		<div className="max-w-3xl">
			<EnrollmentCard />
		</div>
	),
};

export const InImpostazioniVuoto: Story = {
	name: "In impostazioni, senza corso",
	parameters: {
		queryData: [[["crm", "current-enrollment"], null]],
	},
	render: () => (
		<div className="max-w-3xl">
			<EnrollmentCard />
		</div>
	),
};

/** The avatar doubles as the way to change it, on the dashboard and in settings. */
export const IlCambioAvatar: Story = {
	name: "Il cambio avatar, dalla dashboard",
	render: () => (
		<AvatarEditor
			imageUrl={null}
			initials="MC"
			name="Marin Cervinschi"
			className="border-background ring-primary/20 size-24 overflow-hidden border-4 shadow-xl ring-2"
			fallbackClassName="bg-primary/10 text-brand text-xl font-bold"
		/>
	),
};
