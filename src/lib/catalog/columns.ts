import {
	classes,
	courseClasses,
	courses,
	departmentLocations,
	departments,
} from "@/db/schema";

// Explicit column maps instead of `select()`: they keep the generated `fts`
// tsvector out of every payload and make each view model's shape obvious at the
// query site.

export const departmentColumns = {
	id: departments.id,
	name: departments.name,
	code: departments.code,
	description: departments.description,
	area: departments.area,
	catalogueCode: departments.catalogueCode,
	position: departments.position,
	createdAt: departments.createdAt,
	updatedAt: departments.updatedAt,
};

export const courseColumns = {
	id: courses.id,
	name: courses.name,
	code: courses.code,
	description: courses.description,
	departmentId: courses.departmentId,
	location: courses.location,
	cfu: courses.cfu,
	position: courses.position,
	courseType: courses.courseType,
	nationalCode: courses.nationalCode,
	degreeClass: courses.degreeClass,
	teachingLanguage: courses.teachingLanguage,
	restrictedAccess: courses.restrictedAccess,
	catalogueUrl: courses.catalogueUrl,
	createdAt: courses.createdAt,
	updatedAt: courses.updatedAt,
};

export const classColumns = {
	id: classes.id,
	name: classes.name,
	description: classes.description,
	cfu: classes.cfu,
	ssd: classes.ssd,
	position: classes.position,
	createdAt: classes.createdAt,
	updatedAt: classes.updatedAt,
};

export const courseClassColumns = {
	code: courseClasses.code,
	classYear: courseClasses.classYear,
	mandatory: courseClasses.mandatory,
	catalogueUrl: courseClasses.catalogueUrl,
	curriculum: courseClasses.curriculum,
	evaluation: courseClasses.evaluation,
	taf: courseClasses.taf,
	teachingPeriod: courseClasses.teachingPeriod,
	isTeaching: courseClasses.isTeaching,
	position: courseClasses.position,
};

export const locationColumns = {
	id: departmentLocations.id,
	name: departmentLocations.name,
	address: departmentLocations.address,
	latitude: departmentLocations.latitude,
	longitude: departmentLocations.longitude,
	campusLocation: departmentLocations.campusLocation,
	isPrimary: departmentLocations.isPrimary,
	position: departmentLocations.position,
};
