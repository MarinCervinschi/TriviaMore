import { useState } from "react";

import { LetterIcon } from "@solar-icons/react/linear/letter";
import { Plane2Icon } from "@solar-icons/react/linear/plane-2";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSendMaintainerInvite } from "@/lib/admin/mutations";
import { buildMaintainerInviteDefaults } from "@/lib/email/templates/maintainer-invite";

type InviteCourse = { id: string; name: string; code: string };

export function MaintainerInviteDialog({
	userId,
	userName,
	userEmail,
	courses,
}: {
	userId: string;
	userName: string | null;
	userEmail: string | null;
	courses: InviteCourse[];
}) {
	const [open, setOpen] = useState(false);
	const [courseId, setCourseId] = useState("");
	const [subject, setSubject] = useState("");
	const [body, setBody] = useState("");

	const send = useSendMaintainerInvite(() => {
		setOpen(false);
	});

	function reset() {
		setCourseId("");
		setSubject("");
		setBody("");
	}

	// Regenerate the default subject/body from the selected course; the text is
	// course-specific, so picking a course overwrites any previous draft.
	function handleCourseChange(id: string) {
		setCourseId(id);
		const course = courses.find(c => c.id === id);
		if (course) {
			const defaults = buildMaintainerInviteDefaults({
				courseName: course.name,
				inviteeName: userName,
			});
			setSubject(defaults.subject);
			setBody(defaults.body);
		}
	}

	const canSend =
		!!userEmail && !!courseId && subject.trim().length >= 3 && body.trim().length >= 10;

	return (
		<Dialog
			open={open}
			onOpenChange={next => {
				setOpen(next);
				if (!next) reset();
			}}
		>
			<DialogTrigger asChild>
				<Button size="sm" variant="outline" className="gap-1.5">
					<LetterIcon className="h-4 w-4" />
					Invita come maintainer
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>Invita come maintainer</DialogTitle>
					<DialogDescription>
						{userEmail
							? `L'email verrà inviata a ${userEmail}`
							: "Questo utente non ha un indirizzo email: impossibile inviare l'invito."}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-1.5">
						<Label>Corso</Label>
						<Select value={courseId} onValueChange={handleCourseChange}>
							<SelectTrigger>
								<SelectValue placeholder="Seleziona il corso..." />
							</SelectTrigger>
							<SelectContent>
								{courses.length === 0 ? (
									<div className="text-muted-foreground px-2 py-1.5 text-sm">
										Nessun corso disponibile
									</div>
								) : (
									courses.map(c => (
										<SelectItem key={c.id} value={c.id}>
											{c.name} ({c.code})
										</SelectItem>
									))
								)}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="invite-subject">Oggetto</Label>
						<Input
							id="invite-subject"
							value={subject}
							onChange={e => setSubject(e.target.value)}
							placeholder="Oggetto dell'email"
							disabled={!courseId}
							className="rounded-xl"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="invite-body">Messaggio</Label>
						<Textarea
							id="invite-body"
							value={body}
							onChange={e => setBody(e.target.value)}
							placeholder="Seleziona un corso per generare il testo predefinito, poi modificalo liberamente."
							disabled={!courseId}
							rows={14}
							className="rounded-xl text-sm"
						/>
						<p className="text-muted-foreground text-xs">
							Testo predefinito modificabile prima dell'invio.
						</p>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="ghost">Annulla</Button>
					</DialogClose>
					<Button
						className="gap-1.5"
						disabled={!canSend || send.isPending}
						onClick={() =>
							send.mutate({ user_id: userId, course_id: courseId, subject, body })
						}
					>
						<Plane2Icon className="h-4 w-4" />
						{send.isPending ? "Invio..." : "Invia email"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
