import { describe, expect, it } from "vitest";

import {
	type PopulateSourceCourse,
	type SeedDepartment,
	planPopulate,
} from "./populate";

const seed: SeedDepartment[] = [
	{
		catalogueCode: "116",
		code: "DIEF",
		name: "Dipartimento di Ingegneria Enzo Ferrari",
		area: "TECNOLOGIA",
		description: null,
		position: 0,
		locations: null,
	},
];

function course(overrides: Partial<PopulateSourceCourse> = {}): PopulateSourceCourse {
	return {
		code: "20-312",
		name: "Ingegneria Informatica",
		codicione: "0360106200800002",
		cfu: 180,
		courseType: "L2",
		degreeClass: "L-8",
		teachingLanguage: "ITA",
		restrictedAccess: false,
		url: "https://unimore.coursecatalogue.cineca.it/corsi/2026/10166",
		departmentCode: "116",
		site: "Modena",
		...overrides,
	};
}

const empty = {
	departmentCodes: new Set<string>(),
	courseNationalCodes: new Set<string>(),
};

describe("planPopulate", () => {
	it("creates the seeded department and its course, with the campus and type mapped", () => {
		const plan = planPopulate(empty, seed, [course()]);
		expect(plan.departments).toHaveLength(1);
		expect(plan.courses).toEqual([
			expect.objectContaining({
				departmentCatalogueCode: "116",
				code: "20-312",
				courseType: "BACHELOR",
				location: "MODENA",
				nationalCode: "0360106200800002",
				position: 0,
			}),
		]);
	});

	it("leaves out doctorates, unknown departments and courses without a national code", () => {
		const plan = planPopulate(empty, seed, [
			course({ courseType: "D226" }),
			course({ departmentCode: "999" }),
			course({ codicione: null }),
		]);
		expect(plan.courses).toEqual([]);
		expect(plan.skipped).toEqual({
			otherType: 1,
			otherDepartment: 1,
			noNationalCode: 1,
		});
	});

	it("touches nothing that already exists", () => {
		const plan = planPopulate(
			{
				departmentCodes: new Set(["116"]),
				courseNationalCodes: new Set(["0360106200800002"]),
			},
			seed,
			[course()]
		);
		expect(plan.departments).toEqual([]);
		expect(plan.courses).toEqual([]);
	});

	it("keeps one row for a course listed twice, and a site outside the four campuses as null", () => {
		const plan = planPopulate(empty, seed, [
			course({ site: "Università di San Marino" }),
			course({ site: "Università di San Marino" }),
		]);
		expect(plan.courses).toHaveLength(1);
		expect(plan.courses[0]!.location).toBeNull();
	});
});
