import { useState } from "react";

import { BuildingsIcon } from "@solar-icons/react/linear/buildings";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { LayersIcon } from "@solar-icons/react/linear/layers";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { getInitials } from "@/components/layout/nav-items";
import { AvatarChooser } from "@/components/onboarding/avatar-chooser";
import { type CourseOption, CoursePicker } from "@/components/onboarding/course-picker";
import { OnboardingPicker } from "@/components/onboarding/onboarding-picker";
import { OnboardingRecap } from "@/components/onboarding/onboarding-recap";
import type { OnboardingStep } from "@/components/onboarding/onboarding-steps";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { ProfileStep } from "@/components/onboarding/profile-step";
import { OnboardingSkeleton } from "@/components/skeletons";
import { useAuth } from "@/hooks/useAuth";
import { requireAuthFn } from "@/lib/auth/api";
import { useSetGeneratedAvatar, useUploadAvatar } from "@/lib/avatar/mutations";
import { avatarQueries } from "@/lib/avatar/queries";
import { COURSE_TYPE_CONFIG } from "@/lib/browse/constants";
import { browseQueries } from "@/lib/browse/queries";
import { useSetEnrollment } from "@/lib/crm/mutations";
import { requireLegalAcceptanceFn } from "@/lib/legal/api";
import { seoHead } from "@/lib/seo";
import { useUpdateProfile } from "@/lib/user/mutations";

export const Route = createFileRoute("/_app/onboarding")({
	beforeLoad: async () => {
		await requireAuthFn();
		await requireLegalAcceptanceFn();
	},
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(browseQueries.departments()),
	head: () => seoHead({ title: "Benvenuto", noindex: true }),
	pendingComponent: OnboardingSkeleton,
	component: OnboardingPage,
});

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

function OnboardingPage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const departments = useSuspenseQuery(browseQueries.departments()).data;

	const [step, setStep] = useState(0);
	const [furthest, setFurthest] = useState(0);
	const [departmentId, setDepartmentId] = useState<string | null>(null);
	const [courseId, setCourseId] = useState<string | null>(null);
	const [name, setName] = useState(user?.name ?? "");
	const [page, setPage] = useState(0);
	const [seed, setSeed] = useState<string | null>(null);

	const courseList = useQuery({
		...browseQueries.departmentCourseList(departmentId ?? undefined),
		enabled: departmentId !== null,
	});
	const choices = useQuery(avatarQueries.choices(page));

	const setEnrollment = useSetEnrollment();
	const updateProfile = useUpdateProfile();
	const setGeneratedAvatar = useSetGeneratedAvatar();
	const uploadAvatar = useUploadAvatar();

	const courses: CourseOption[] = (courseList.data ?? []).map(course => ({
		id: course.id,
		name: course.name,
		keywords: course.code,
		meta: course.cfu ? `${course.cfu} CFU` : undefined,
		courseType: course.courseType,
	}));

	const previewUri = choices.data?.find(choice => choice.seed === seed)?.dataUri;
	const initials = getInitials(name || user?.name, user?.email);
	const chosen = [departmentId, courseId, name.trim() || null][step];
	const copy = COPY[step] ?? COPY[2]!;
	const isLast = step === STEPS.length - 1;

	const isSaving =
		setEnrollment.isPending ||
		updateProfile.isPending ||
		setGeneratedAvatar.isPending ||
		uploadAvatar.isPending;

	const go = (next: number) => {
		setStep(next);
		setFurthest(current => Math.max(current, next));
	};

	async function confirm() {
		if (!courseId) return;

		try {
			await setEnrollment.mutateAsync({ courseId });
			await updateProfile.mutateAsync({ name: name.trim() });
			if (seed) await setGeneratedAvatar.mutateAsync(seed);
		} catch {
			// Each mutation toasts its own message; the wizard stays where it is.
			return;
		}

		navigate({ to: "/user" });
	}

	return (
		<div className="container flex min-h-[70vh] items-center py-10">
			<div className="mx-auto w-full max-w-2xl">
				<OnboardingWizard
					steps={STEPS}
					current={step}
					maxReachable={furthest}
					onStepSelect={go}
					title={copy.title}
					description={copy.description}
					onPrevious={step === 0 ? undefined : () => go(step - 1)}
					onNext={() => (isLast ? void confirm() : go(step + 1))}
					nextLabel={isLast ? "Conferma" : "Avanti"}
					nextDisabled={!chosen}
					isSubmitting={isSaving}
					onSkip={() => navigate({ to: "/user" })}
				>
					{step === 0 && (
						<OnboardingPicker
							options={departments.map(department => ({
								id: department.id,
								name: department.name,
								keywords: department.code,
								meta: `${department.courseCount} corsi`,
							}))}
							value={departmentId}
							onSelect={id => {
								setDepartmentId(id);
								setCourseId(null);
							}}
							placeholder="Cerca un dipartimento…"
							emptyLabel="Nessun dipartimento trovato."
						/>
					)}

					{step === 1 && (
						<CoursePicker options={courses} value={courseId} onSelect={setCourseId} />
					)}

					{step >= 2 && (
						<div className="flex flex-col gap-5">
							<OnboardingRecap
								name={name}
								imageUrl={previewUri ?? user?.image}
								initials={initials}
								entries={[
									{
										label: "Dipartimento",
										icon: BuildingsIcon,
										value:
											departments.find(item => item.id === departmentId)?.name ?? null,
										onEdit: () => go(0),
									},
									{
										label: "Corso",
										icon: DiplomaIcon,
										value: courses.find(item => item.id === courseId)?.name ?? null,
										onEdit: () => go(1),
									},
									{
										label: "Tipo",
										icon: LayersIcon,
										value: (() => {
											const type = courses.find(
												item => item.id === courseId
											)?.courseType;
											return type ? (COURSE_TYPE_CONFIG[type]?.label ?? null) : null;
										})(),
									},
								]}
							/>
							<ProfileStep
								name={name}
								onNameChange={setName}
								initials={initials}
								imageUrl={previewUri ?? user?.image}
								avatarChooser={
									<AvatarChooser
										choices={choices.data ?? []}
										selectedSeed={seed}
										onSelect={setSeed}
										onShuffle={() => setPage(current => current + 1)}
										onUpload={file => {
											// Clearing the seed is the fix, not a tidy-up: the preview
											// prefers it over the stored image, and the confirm step
											// would re-apply it over the photo just uploaded.
											uploadAvatar.mutate(file, { onSuccess: () => setSeed(null) });
										}}
										isLoading={choices.isFetching}
										isUploading={uploadAvatar.isPending}
									/>
								}
							/>
						</div>
					)}
				</OnboardingWizard>
			</div>
		</div>
	);
}
