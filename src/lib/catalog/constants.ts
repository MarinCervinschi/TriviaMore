// The per-class sentinel section that backs "exam simulation" mode. It holds no
// questions of its own: it is a stable id the exam entry points can hang off.
export const EXAM_SIMULATION_SECTION = "Exam Simulation";

// Its user-facing Italian label (the stored name stays an internal sentinel).
export const EXAM_SIMULATION_LABEL = "Simulazione d'esame";

export function sectionDisplayName(name: string): string {
	return name === EXAM_SIMULATION_SECTION ? EXAM_SIMULATION_LABEL : name;
}
