import { createServerFn } from "@tanstack/react-start";

import { getMyMaintainedCourses } from "../service/dashboard";

export const getMyMaintainedCoursesFn = createServerFn({ method: "GET" }).handler(() =>
	getMyMaintainedCourses()
);
