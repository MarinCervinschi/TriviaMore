import { useState } from "react";

import { BookmarkIcon } from "@solar-icons/react/linear/bookmark";
import { CalendarMinimalisticIcon } from "@solar-icons/react/linear/calendar-minimalistic";
import { CameraIcon } from "@solar-icons/react/linear/camera";
import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { DisketteIcon } from "@solar-icons/react/linear/diskette";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { SettingsIcon } from "@solar-icons/react/linear/settings";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CloseGlyph, Spinner } from "@/components/icons";
import { StatCard } from "@/components/shared/stat-card";
import { SettingsSkeleton } from "@/components/skeletons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InsetCard } from "@/components/ui/inset-card";
import { Label } from "@/components/ui/label";
import { UserBreadcrumb } from "@/components/user/user-breadcrumb";
import { UserHero } from "@/components/user/user-hero";
import { seoHead } from "@/lib/seo";
import { useUpdateProfile } from "@/lib/user/mutations";
// TODO: uncomment when RLS DELETE policies are in place
// import { useDeleteAccount } from "@/lib/user/mutations"
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
		<div className="space-y-8 pb-8">
			<UserHero
				icon={SettingsIcon}
				title="Impostazioni profilo"
				description="Gestisci le informazioni del tuo account e le preferenze"
			/>

			<div className="container space-y-6">
				<UserBreadcrumb current="Impostazioni" />

				<ProfileForm profile={profile} />

				{/* Account Stats */}
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

				{/* Account Details */}
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

				{/* TODO: implement account deletion with proper RLS policies */}
				{/* <DeleteAccountSection /> */}
			</div>
		</div>
	);
}

function ProfileForm({ profile }: { profile: UserProfile }) {
	const updateProfile = useUpdateProfile();
	const displayName = getDisplayName(profile);
	const initials = getInitials(profile);

	const [name, setName] = useState(profile.name ?? "");
	const [imageUrl, setImageUrl] = useState(profile.image ?? "");

	const hasChanges =
		name !== (profile.name ?? "") || imageUrl !== (profile.image ?? "");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;
		updateProfile.mutate({
			name: name.trim(),
			image: imageUrl.trim() || null,
		});
	};

	const handleReset = () => {
		setName(profile.name ?? "");
		setImageUrl(profile.image ?? "");
	};

	return (
		<InsetCard texture="top" textureAlpha={0.12}>
			<form onSubmit={handleSubmit} className="relative p-6 sm:p-8">
				<h2 className="mb-1 text-xl font-bold">Informazioni profilo</h2>
				<p className="text-muted-foreground mb-6 text-sm">
					Modifica le tue informazioni personali
				</p>

				<div className="mb-6 flex items-center gap-4">
					<Avatar className="border-background ring-primary/20 h-24 w-24 border-4 shadow-xl ring-2">
						<AvatarImage
							src={imageUrl || profile.image || undefined}
							alt={displayName}
						/>
						<AvatarFallback className="bg-primary/10 text-brand text-xl font-bold">
							{initials}
						</AvatarFallback>
					</Avatar>
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

				<div className="mt-4 space-y-2">
					<Label htmlFor="image">
						<CameraIcon className="mr-1 inline h-4 w-4" />
						URL immagine profilo
					</Label>
					<Input
						id="image"
						type="url"
						value={imageUrl}
						onChange={e => setImageUrl(e.target.value)}
						placeholder="https://esempio.com/la-tua-foto.jpg"
						className="rounded-xl"
					/>
					<p className="text-muted-foreground text-xs">
						Inserisci l'URL di un'immagine per il tuo avatar
					</p>
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

// TODO: uncomment when RLS DELETE policies are in place
// function DeleteAccountSection() {
//   const deleteAccount = useDeleteAccount()
//   const [confirmText, setConfirmText] = useState("")
//
//   const canDelete = confirmText === "ELIMINA"
//
//   return (
//     <div className="relative overflow-hidden rounded-3xl border border-destructive/30 bg-card">
//       <div className="p-6 sm:p-8">
//         <div className="flex items-start gap-3">
//           <div className="rounded-2xl bg-destructive/10 p-3">
//             <AlertTriangle className="h-6 w-6 text-danger" strokeWidth={1.5} />
//           </div>
//           <div className="flex-1">
//             <h2 className="text-xl font-bold text-danger">
//               Elimina Account
//             </h2>
//             <p className="mt-1 text-sm text-muted-foreground">
//               Questa azione è permanente e irreversibile. Tutti i tuoi dati
//               verranno eliminati: profilo, progressi, segnalibri, corsi salvati
//               e cronologia quiz.
//             </p>
//           </div>
//         </div>
//
//         <div className="mt-6">
//           <AlertDialog>
//             <AlertDialogTrigger asChild>
//               <Button variant="destructive" >
//                 <Trash2 className="mr-2 h-4 w-4" />
//                 Elimina il mio account
//               </Button>
//             </AlertDialogTrigger>
//             <AlertDialogContent>
//               <AlertDialogHeader>
//                 <AlertDialogTitle className="flex items-center gap-2">
//                   <AlertTriangle className="h-5 w-5 text-danger" />
//                   Conferma eliminazione account
//                 </AlertDialogTitle>
//                 <AlertDialogDescription className="space-y-3">
//                   <span className="block">
//                     Stai per eliminare permanentemente il tuo account. Questa
//                     azione non può essere annullata.
//                   </span>
//                   <span className="block font-medium text-foreground">
//                     Verranno eliminati:
//                   </span>
//                   <span className="block text-sm">
//                     • Tutti i progressi e i risultati dei quiz
//                     <br />
//                     • I segnalibri salvati
//                     <br />
//                     • I corsi seguiti
//                     <br />
//                     • Le informazioni del profilo
//                   </span>
//                   <span className="block">
//                     Scrivi{" "}
//                     <span className="font-mono font-bold text-danger">
//                       ELIMINA
//                     </span>{" "}
//                     per confermare:
//                   </span>
//                 </AlertDialogDescription>
//                 <Input
//                   value={confirmText}
//                   onChange={(e) => setConfirmText(e.target.value)}
//                   placeholder="Scrivi ELIMINA"
//                   className="mt-2 rounded-xl"
//                   autoComplete="off"
//                 />
//               </AlertDialogHeader>
//               <AlertDialogFooter>
//                 <AlertDialogCancel onClick={() => setConfirmText("")}>
//                   Annulla
//                 </AlertDialogCancel>
//                 <AlertDialogAction
//                   disabled={!canDelete || deleteAccount.isPending}
//                   onClick={(e) => {
//                     e.preventDefault()
//                     deleteAccount.mutate()
//                   }}
//                   className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//                 >
//                   {deleteAccount.isPending ? (
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   ) : (
//                     <Trash2 className="mr-2 h-4 w-4" />
//                   )}
//                   Elimina definitivamente
//                 </AlertDialogAction>
//               </AlertDialogFooter>
//             </AlertDialogContent>
//           </AlertDialog>
//         </div>
//       </div>
//     </div>
//   )
// }
