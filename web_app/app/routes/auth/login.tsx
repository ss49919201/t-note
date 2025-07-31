import type { Route } from "./+types/login";
import { Form, redirect } from "react-router";
import { requireGuest } from "../../auth/guards.server";
import { createUserSession } from "../../auth/session.server";
import { authenticateUser } from "../../auth/user.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ログイン - t-note" },
    { name: "description", content: "t-noteにログインしてください" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireGuest(request);
  return {};
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const username = formData.get("username");

  if (typeof username !== "string" || username.length === 0) {
    return {
      error: "ユーザー名を入力してください",
    };
  }

  const user = await authenticateUser(username);
  if (!user) {
    return {
      error: "ユーザーが見つかりません",
    };
  }

  const sessionCookie = await createUserSession(user.id);
  return redirect("/", {
    headers: {
      "Set-Cookie": sessionCookie,
    },
  });
}

export default function Login({ actionData }: Route.ComponentProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            t-note にログイン
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ユーザー名を入力してください（テスト用: admin, user1, user2）
          </p>
        </div>
        <Form method="post" className="mt-8 space-y-6">
          <div>
            <label htmlFor="username" className="sr-only">
              ユーザー名
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="ユーザー名"
            />
          </div>
          
          {actionData?.error && (
            <div className="text-red-600 text-sm">{actionData.error}</div>
          )}
          
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              ログイン
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}