import { TIME_STEPS } from "@/lib/quiz/constants";
import type { EvaluationMode } from "@/lib/quiz/types";
import { sessionHint } from "@/lib/shared/session";

import { AnimatedBlock } from "./animated-block";
import {
	EvalInfoCard,
	EvalSelect,
	SliderWithInput,
	TimeTickRow,
} from "./session-form-blocks";
import { EvalBlock, MetricBlock, TimeBlock } from "./summary-blocks";

// The quiz configuration form and its live summary, shared by the quiz start
// dialog and the exam dialog's quiz tab. State lives in the parent dialog.

export function QuizConfigFields({
	questionCount,
	setQuestionCount,
	timeStepIndex,
	setTimeStepIndex,
	evalModeId,
	setEvalModeId,
	evalModes,
	selectedEvalMode,
	maxQuestions,
	available,
}: {
	questionCount: number;
	setQuestionCount: (v: number) => void;
	timeStepIndex: number;
	setTimeStepIndex: (v: number) => void;
	evalModeId: string | undefined;
	setEvalModeId: (v: string) => void;
	evalModes: EvaluationMode[] | undefined;
	selectedEvalMode: EvaluationMode | undefined;
	/** The most this session may draw: the section's own total, capped. */
	maxQuestions: number;
	/** How many exist, so the hint never claims "all" while showing the ceiling. */
	available?: number;
}) {
	const total = available ?? maxQuestions;
	return (
		<>
			<AnimatedBlock>
				<SliderWithInput
					label="Numero di domande"
					value={questionCount}
					onChange={setQuestionCount}
					min={1}
					max={maxQuestions}
					hint={sessionHint(questionCount, maxQuestions, total)}
				/>
			</AnimatedBlock>
			<AnimatedBlock>
				<TimeTickRow
					steps={TIME_STEPS}
					index={timeStepIndex}
					onChange={setTimeStepIndex}
				/>
			</AnimatedBlock>
			{evalModes && evalModes.length >= 2 && (
				<AnimatedBlock>
					<EvalSelect modes={evalModes} value={evalModeId} onChange={setEvalModeId} />
				</AnimatedBlock>
			)}
			{selectedEvalMode && (
				<AnimatedBlock>
					<EvalInfoCard mode={selectedEvalMode} />
				</AnimatedBlock>
			)}
		</>
	);
}

export function QuizSummary({
	timeLimit,
	questionCount,
	maxQuestions,
	selectedEvalMode,
}: {
	timeLimit: number | null;
	questionCount: number;
	maxQuestions: number;
	selectedEvalMode: EvaluationMode | undefined;
}) {
	return (
		<>
			<AnimatedBlock>
				<TimeBlock minutes={timeLimit} questionCount={questionCount} />
			</AnimatedBlock>
			<AnimatedBlock>
				<MetricBlock
					eyebrow="Domande"
					value={questionCount}
					total={maxQuestions}
					showBar
				/>
			</AnimatedBlock>
			{selectedEvalMode && (
				<AnimatedBlock>
					<EvalBlock mode={selectedEvalMode} questionCount={questionCount} />
				</AnimatedBlock>
			)}
		</>
	);
}
