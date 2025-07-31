import { describe, test, expect } from "vitest";
import routes from "./routes";

describe("アプリケーションルーティング", () => {
  test("必要なルートが定義されている", () => {
    // ルート設定が存在することを確認
    expect(routes).toBeDefined();
    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBeGreaterThan(0);
  });

  test("ホームページルートが存在する", () => {
    const homeRoute = routes.find(route => 
      route.file === "routes/home.tsx"
    );
    expect(homeRoute).toBeDefined();
  });

  test("認証関連ルートが定義されている", () => {
    const loginRoute = routes.find(route => 
      route.path === "/login"
    );
    const logoutRoute = routes.find(route => 
      route.path === "/logout"
    );
    
    expect(loginRoute).toBeDefined();
    expect(logoutRoute).toBeDefined();
    expect(loginRoute?.file).toBe("routes/auth/login.tsx");
    expect(logoutRoute?.file).toBe("routes/auth/logout.tsx");
  });

  test("Topic関連ルートが定義されている", () => {
    const newTopicRoute = routes.find(route => 
      route.path === "/topics/new"
    );
    const topicDetailRoute = routes.find(route => 
      route.path === "/topics/:id"
    );
    
    expect(newTopicRoute).toBeDefined();
    expect(topicDetailRoute).toBeDefined();
    expect(newTopicRoute?.file).toBe("routes/topics/new.tsx");
    expect(topicDetailRoute?.file).toBe("routes/topics/detail.tsx");
  });
});