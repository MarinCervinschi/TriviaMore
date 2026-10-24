import { createServerFn } from "@tanstack/react-start";

import { logout } from "../service";

export const logoutFn = createServerFn({ method: "POST" }).handler(() => logout());
