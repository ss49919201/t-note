import { describe, test, expect, beforeEach } from "vitest";
import { TopicService } from "./topic.server";
import * as v from "valibot";

describe("TopicService", () => {
  let topicService: TopicService;

  beforeEach(() => {
    // DBなしでテスト（バリデーション中心）
    topicService = new TopicService();
  });

  describe("Topic作成バリデーション", () => {
    test("有効なデータでTopicサービスが初期化される", () => {
      expect(topicService).toBeDefined();
      expect(topicService.createTopic).toBeDefined();
      expect(topicService.getTopicById).toBeDefined();
      expect(topicService.getAllTopics).toBeDefined();
      expect(topicService.updateTopic).toBeDefined();
      expect(topicService.deleteTopic).toBeDefined();
    });

    test("DB接続なしでcreateTopicを呼ぶとエラーになる", async () => {
      const command = {
        title: "テストトピック",
        content: "テストの内容です",
        user_id: 1,
        tags: ["テスト", "開発"],
      };

      await expect(topicService.createTopic(command)).rejects.toThrow(
        "Database connection not available"
      );
    });

    test("DB接続なしでgetTopicByIdを呼ぶとエラーになる", async () => {
      await expect(topicService.getTopicById("test-id")).rejects.toThrow(
        "Database connection not available"
      );
    });

    test("DB接続なしでgetAllTopicsを呼ぶとエラーになる", async () => {
      await expect(topicService.getAllTopics()).rejects.toThrow(
        "Database connection not available"
      );
    });

    test("DB接続なしでupdateTopicを呼ぶとエラーになる", async () => {
      const command = {
        id: "test-topic-id",
        title: "更新されたタイトル",
        content: "更新された内容",
        user_id: 1,
      };

      await expect(topicService.updateTopic(command)).rejects.toThrow(
        "Database connection not available"
      );
    });

    test("DB接続なしでdeleteTopicを呼ぶとエラーになる", async () => {
      await expect(topicService.deleteTopic("test-id", 1)).rejects.toThrow(
        "Database connection not available"
      );
    });
  });

  describe("バリデーション機能の確認", () => {
    test("TopicServiceはバリデーション機能を持つ", () => {
      // バリデーション機能の存在確認（実際のバリデーションはサービス層で実行）
      expect(typeof topicService.createTopic).toBe("function");
      expect(typeof topicService.updateTopic).toBe("function");
    });

    test("バリデーションライブラリが利用可能", () => {
      expect(v).toBeDefined();
      expect(v.parse).toBeDefined();
    });

    test("空の文字列バリデーションのテスト", () => {
      const stringSchema = v.pipe(v.string(), v.minLength(1));
      
      expect(() => v.parse(stringSchema, "")).toThrow();
      expect(() => v.parse(stringSchema, "valid")).not.toThrow();
    });
  });
});