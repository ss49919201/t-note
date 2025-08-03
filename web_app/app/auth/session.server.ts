import { createCookieSessionStorage } from "react-router";

// セッション設定
const sessionSecret = "your-session-secret"; // 実際の運用では環境変数から取得

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "t-note-session",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 1週間
    sameSite: "lax",
    secrets: [sessionSecret],
  },
});

// セッション作成
export async function createUserSession(userId: string) {
  const session = await sessionStorage.getSession();
  session.set("userId", userId);
  return sessionStorage.commitSession(session);
}

// セッション取得
export async function getUserSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

// ユーザーID取得
export async function getUserId(request: Request): Promise<string | null> {
  const session = await getUserSession(request);
  return session.get("userId") || null;
}

// セッション削除
export async function destroyUserSession(request: Request) {
  const session = await getUserSession(request);
  return sessionStorage.destroySession(session);
}
