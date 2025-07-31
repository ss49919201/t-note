// ダミーユーザーデータ（実際の実装ではデータベースから取得）
const DUMMY_USERS = [
  { id: "1", username: "admin", email: "admin@example.com" },
  { id: "2", username: "user1", email: "user1@example.com" },
  { id: "3", username: "user2", email: "user2@example.com" },
];

export interface User {
  id: string;
  username: string;
  email: string;
}

// ユーザー認証（簡易実装 - 実際の運用ではパスワードハッシュを確認）
export async function authenticateUser(username: string): Promise<User | null> {
  const user = DUMMY_USERS.find(u => u.username === username);
  return user || null;
}

// ユーザーIDからユーザー情報を取得
export async function getUserById(id: string): Promise<User | null> {
  const user = DUMMY_USERS.find(u => u.id === id);
  return user || null;
}