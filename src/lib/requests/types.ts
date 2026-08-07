import type { contentRequests } from "@/db/schema";

// `submittedContent` is dropped from the wire shape: it is jsonb, so its type is
// `unknown`, and every consumer reads the validated `submitted` instead.
export type ContentRequest = Omit<
	typeof contentRequests.$inferSelect,
	"submittedContent"
>;
export type ContentRequestType = ContentRequest["requestType"];
export type ContentRequestStatus = ContentRequest["status"];

// The shapes below are **stored inside the submitted_content jsonb**, so their
// keys are a serialization contract with rows already in the database, not a row
// type. They stay snake_case on purpose: renaming a key here would orphan every
// request already submitted.

export type SubmittedSection = {
	type: "section";
	name: string;
	description: string;
};

export type SubmittedQuestion = {
	content: string;
	question_type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
	options: string[] | null;
	correct_answer: string[];
	explanation: string | null;
	difficulty: "EASY" | "MEDIUM" | "HARD";
};

export type SubmittedQuestions = {
	type: "questions";
	questions: SubmittedQuestion[];
};

export type SubmittedReport = {
	type: "report";
	question_id: string;
	question_content: string;
	reasons: string[];
	comment: string | null;
};

export type SubmittedFileUpload = {
	type: "file_upload";
	file_name: string;
	file_path: string;
	file_size: number;
	comment: string | null;
};

export type SubmittedContent =
	| SubmittedSection
	| SubmittedQuestions
	| SubmittedReport
	| SubmittedFileUpload;

export type ReportedQuestion = {
	id: string;
	content: string;
	questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
	options: string[] | null;
	correctAnswer: string[];
	explanation: string | null;
	difficulty: "EASY" | "MEDIUM" | "HARD";
};

// Request with the target breadcrumb that list views show.
export type ContentRequestWithMeta = ContentRequest & {
	targetLabel: string;
	submitted: SubmittedContent;
	reportedQuestion?: ReportedQuestion | null;
};

export type RequestUser = {
	id: string;
	name: string | null;
	email: string | null;
	image: string | null;
};

export type AdminContentRequest = ContentRequestWithMeta & {
	user: RequestUser;
	handledByUser: RequestUser | null;
};

// Detail view: `user` is null when the owner views their own request, and
// `handledByUser` stays null until someone handles it.
export type ContentRequestDetail = ContentRequestWithMeta & {
	user: RequestUser | null;
	handledByUser: RequestUser | null;
};
