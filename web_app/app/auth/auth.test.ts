import { describe, test, expect } from "vitest";
import { authenticateUser, getUserById } from "./user.server";

describe("認証システム", () => {
  describe("ユーザー認証", () => {
    test("有効なユーザー名で認証できる", async () => {
      const user = await authenticateUser("admin");
      expect(user).toBeDefined();
      expect(user?.username).toBe("admin");
      expect(user?.email).toBe("admin@example.com");
    });

    test("無効なユーザー名では認証できない", async () => {
      const user = await authenticateUser("nonexistent");
      expect(user).toBeNull();
    });

    test("空のユーザー名では認証できない", async () => {
      const user = await authenticateUser("");
      expect(user).toBeNull();
    });
  });

  describe("ユーザー取得", () => {
    test("有効なIDでユーザーを取得できる", async () => {
      const user = await getUserById("1");
      expect(user).toBeDefined();
      expect(user?.id).toBe("1");
      expect(user?.username).toBe("admin");
    });

    test("無効なIDではユーザーを取得できない", async () => {
      const user = await getUserById("999");
      expect(user).toBeNull();
    });
  });
});