/** The per-class sentinel section behind exam simulation; it holds no questions. */
export const EXAM_SIMULATION_SECTION = "Exam Simulation";

export const EXAM_SIMULATION_LABEL = "Simulazione d'esame";

export function sectionDisplayName(name: string): string {
	return name === EXAM_SIMULATION_SECTION ? EXAM_SIMULATION_LABEL : name;
}
