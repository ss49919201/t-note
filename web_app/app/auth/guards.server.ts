import { redirect } from "react-router";
import { getUserId } from "./session.server";

// 認証が必要なページで使用するガード
export async function requireAuth(request: Request) {
  const userId = await getUserId(request);

  if (!userId) {
    throw redirect("/login");
  }

  return userId;
}

// ログイン済みの場合にリダイレクトするガード（ログインページなどで使用）
export async function requireGuest(request: Request) {
  const userId = await getUserId(request);

  if (userId) {
    throw redirect("/");
  }
}
