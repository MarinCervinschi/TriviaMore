import { useState } from "react";

import { BookmarkIcon } from "@solar-icons/react/linear/bookmark";
import { CalendarMinimalisticIcon } from "@solar-icons/react/linear/calendar-minimalistic";
import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { DisketteIcon } from "@solar-icons/react/linear/diskette";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CloseGlyph, Spinner } from "@/components/icons";
import { EnrollmentCard } from "@/components/onboarding/enrollment-card";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { StatCard } from "@/components/shared/stat-card";
import { SettingsSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InsetCard } from "@/components/ui/inset-card";
import { Label } from "@/components/ui/label";
import { AvatarEditor } from "@/components/user/avatar-editor";
import { seoHead } from "@/lib/seo";
import { useUpdateProfile } from "@/lib/user/mutations";
import { userQueries } from "@/lib/user/queries";
import type { UserProfile } from "@/lib/user/types";
import { getDisplayName, getInitials, getRoleLabel } from "@/lib/user/utils";
import { formatDateLong } from "@/lib/utils/format";

export const Route = createFileRoute("/_app/user/settings")({
	loader: ({ context }) => context.queryClient.ensureQueryData(userQueries.profile()),
	head: () => seoHead({ title: "Impostazioni", noindex: true }),
	pendingComponent: SettingsSkeleton,
	component: SettingsPage,
});

function SettingsPage() {
	const { data: profile } = useSuspenseQuery(userQueries.profile());

	if (!profile) return null;

	return (
		<div className="pb-8">
			<div className="container space-y-6 py-6">
				<PageToolbar
					title="Impostazioni profilo"
					meta="Gestisci le informazioni del tuo account e le preferenze"
				/>

				<ProfileForm profile={profile} />

				<EnrollmentCard />

				<div>
					<h2 className="mb-1 text-xl font-bold">Statistiche account</h2>
					<p className="text-muted-foreground mb-4 text-sm">
						Informazioni sul tuo utilizzo della piattaforma
					</p>
					<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
						<StatCard
							label="Quiz completati"
							value={profile.stats.totalQuizzes}
							icon={CupFirstIcon}
							color="yellow"
						/>
						<StatCard
							label="Insegnamenti seguiti"
							value={profile.stats.userClassesCount}
							icon={DiplomaIcon}
							color="blue"
						/>
						<StatCard
							label="Segnalibri"
							value={profile.stats.bookmarksCount}
							icon={BookmarkIcon}
							color="purple"
						/>
						<StatCard
							label="Punteggio medio"
							value={profile.stats.averageScore}
							icon={GraphUpIcon}
							color="green"
						/>
					</div>
				</div>

				<InsetCard texture="top" textureAlpha={0.12}>
					<div className="relative p-6 sm:p-8">
						<h2 className="mb-1 text-xl font-bold">Dettagli account</h2>
						<p className="text-muted-foreground mb-6 text-sm">
							Informazioni tecniche sul tuo account
						</p>

						<div className="space-y-4">
							<div className="space-y-1.5">
								<Label className="text-sm font-medium">ID Utente</Label>
								<p className="bg-muted/50 rounded-xl p-3 font-mono text-sm">
									{profile.id}
								</p>
							</div>
							<div className="flex items-center gap-2">
								<CalendarMinimalisticIcon className="text-muted-foreground h-4 w-4" />
								<Label className="text-sm font-medium">Membro dal</Label>
								<p className="text-sm">{formatDateLong(profile.createdAt)}</p>
							</div>
							<div className="flex items-center gap-2">
								<CalendarMinimalisticIcon className="text-muted-foreground h-4 w-4" />
								<Label className="text-sm font-medium">Ultimo aggiornamento</Label>
								<p className="text-sm">{formatDateLong(profile.updatedAt)}</p>
							</div>
						</div>
					</div>
				</InsetCard>
			</div>
		</div>
	);
}

function ProfileForm({ profile }: { profile: UserProfile }) {
	const updateProfile = useUpdateProfile();
	const displayName = getDisplayName(profile);
	const initials = getInitials(profile);

	const [name, setName] = useState(profile.name ?? "");

	const hasChanges = name !== (profile.name ?? "");

	// No `image`, because the editor saves the picture when it is chosen.
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;
		updateProfile.mutate({ name: name.trim() });
	};

	const handleReset = () => setName(profile.name ?? "");

	return (
		<InsetCard texture="top" textureAlpha={0.12}>
			<form onSubmit={handleSubmit} className="relative p-6 sm:p-8">
				<h2 className="mb-1 text-xl font-bold">Informazioni profilo</h2>
				<p className="text-muted-foreground mb-6 text-sm">
					Modifica le tue informazioni personali
				</p>

				<div className="mb-6 flex items-center gap-4">
					<AvatarEditor
						imageUrl={profile.image}
						initials={initials}
						name={displayName}
						className="border-background ring-primary/20 h-24 w-24 shrink-0 overflow-hidden border-4 shadow-xl ring-2"
						fallbackClassName="bg-primary/10 text-brand text-xl font-bold"
					/>
					<div>
						<h3 className="text-lg font-semibold">{name || displayName}</h3>
						<Badge className="border-primary/20 bg-primary/5 text-brand border px-3 py-1 text-sm font-medium">
							{getRoleLabel(profile.role)}
						</Badge>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="name">Nome completo</Label>
						<Input
							id="name"
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder="Il tuo nome completo"
							className="rounded-xl"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							value={profile.email ?? ""}
							disabled
							className="bg-muted/30"
						/>
						<p className="text-muted-foreground text-xs">
							L'email non può essere modificata
						</p>
					</div>
				</div>

				<div className="mt-6 flex items-center gap-3">
					<Button
						type="submit"
						disabled={!hasChanges || !name.trim() || updateProfile.isPending}
						className="shadow-primary/25 shadow-lg"
					>
						{updateProfile.isPending ? (
							<Spinner className="mr-2" />
						) : (
							<DisketteIcon className="mr-2 h-4 w-4" />
						)}
						Salva Modifiche
					</Button>
					{hasChanges && (
						<Button type="button" variant="ghost" onClick={handleReset}>
							<CloseGlyph className="mr-2 h-4 w-4" />
							Annulla
						</Button>
					)}
				</div>
			</form>
		</InsetCard>
	);
}
