import type { Route } from "./+types/logout";
import { redirect } from "react-router";
import { destroyUserSession } from "../../auth/session.server";

export async function action({ request }: Route.ActionArgs) {
  const sessionCookie = await destroyUserSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": sessionCookie,
    },
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  const sessionCookie = await destroyUserSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": sessionCookie,
    },
  });
}