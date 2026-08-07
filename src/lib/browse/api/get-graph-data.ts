import { createServerFn } from "@tanstack/react-start";

import { getGraphData } from "../service/graph";

export const getGraphDataFn = createServerFn({ method: "GET" }).handler(() =>
	getGraphData()
);
