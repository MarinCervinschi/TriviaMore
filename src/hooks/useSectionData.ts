import { EvaluationMode, SectionData } from "@/components/pages/Browse/Section";
import { useVolatileQuery } from "@/providers/react-query-provider";

interface useSectionDataProps {
	departmentCode: string;
	courseCode: string;
	classCode: string;
	sectionName: string;
	userId?: string;
}

interface Section {
	sectionData: SectionData;
	evaluationModes: EvaluationMode[];
}

const fetchSections = async (props: useSectionDataProps) => {
	const { departmentCode, courseCode, classCode, sectionName } = props;
	const response = await fetch(
		`/api/section?departmentCode=${departmentCode}&courseCode=${courseCode}&classCode=${classCode}&sectionName=${sectionName}`
	);
	if (!response.ok) {
		throw new Error("Failed to fetch sections");
	}
	return response.json();
};

export const useSectionData = (props: useSectionDataProps) => {
	return useVolatileQuery<Section>({
		queryKey: ["section", props.classCode, props.sectionName, props.userId],
		queryFn: () => fetchSections(props),
		enabled: !!props.classCode && !!props.sectionName,
	});
};
