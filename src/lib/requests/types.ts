import type { contentRequests } from "@/db/schema";

export type ContentRequest = Omit<
	typeof contentRequests.$inferSelect,
	"submittedContent"
>;
export type ContentRequestType = ContentRequest["requestType"];
export type ContentRequestStatus = ContentRequest["status"];

// Stored inside the submitted_content jsonb, so these keys stay snake_case.

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

/** `user` is null when the owner views their own request. */
export type ContentRequestDetail = ContentRequestWithMeta & {
	user: RequestUser | null;
	handledByUser: RequestUser | null;
};
