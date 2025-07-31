import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // ホーム - Topic一覧表示
  index("routes/home.tsx"),
  
  // 認証関連
  route("/login", "routes/auth/login.tsx"),
  route("/logout", "routes/auth/logout.tsx"),
  
  // Topic 関連
  route("/topics/new", "routes/topics/new.tsx"),
  route("/topics/:id", "routes/topics/detail.tsx"),
] satisfies RouteConfig;
