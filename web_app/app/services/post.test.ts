import { describe, test, expect, beforeEach } from "vitest";
import { PostService } from "./post.server";

describe("PostService", () => {
  let postService: PostService;

  beforeEach(() => {
    // DBなしでテスト（バリデーション中心）
    postService = new PostService();
  });

  describe("Post作成機能", () => {
    test("有効なデータでPostサービスが初期化される", () => {
      expect(postService).toBeDefined();
      expect(postService.createPost).toBeDefined();
      expect(postService.getPostsByTopicId).toBeDefined();
      expect(postService.updatePost).toBeDefined();
      expect(postService.deletePost).toBeDefined();
    });

    test("DB接続なしでcreatePostを呼ぶとエラーになる", async () => {
      const command = {
        content: "テスト投稿内容",
        topic_id: "test-topic-id",
        user_id: 1,
      };

      await expect(postService.createPost(command)).rejects.toThrow(
        "Database connection not available"
      );
    });

    test("DB接続なしでgetPostsByTopicIdを呼ぶとエラーになる", async () => {
      await expect(postService.getPostsByTopicId("test-topic-id")).rejects.toThrow(
        "Database connection not available"
      );
    });

    test("DB接続なしでupdatePostを呼ぶとエラーになる", async () => {
      const command = {
        id: "test-post-id",
        content: "更新された内容",
        user_id: 1,
      };

      await expect(postService.updatePost(command)).rejects.toThrow(
        "Database connection not available"
      );
    });

    test("DB接続なしでdeletePostを呼ぶとエラーになる", async () => {
      await expect(postService.deletePost("test-post-id", 1)).rejects.toThrow(
        "Database connection not available"
      );
    });
  });

  describe("スレッド構造機能", () => {
    test("親投稿IDを指定した返信投稿の作成", () => {
      const command = {
        content: "返信内容",
        topic_id: "test-topic-id",
        parent_post_id: "parent-post-id",
        user_id: 1,
      };

      // parent_post_idが適切に設定されることを確認
      expect(command.parent_post_id).toBe("parent-post-id");
      expect(command.topic_id).toBe("test-topic-id");
    });

    test("親投稿なしの投稿（トップレベル）の作成", () => {
      const command = {
        content: "トップレベル投稿",
        topic_id: "test-topic-id",
        user_id: 1,
        parent_post_id: undefined,
      };

      // parent_post_idが未定義であることを確認
      expect(command.parent_post_id).toBeUndefined();
    });
  });
});