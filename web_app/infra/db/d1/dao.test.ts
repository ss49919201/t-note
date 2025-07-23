import { beforeEach, describe, expect, it } from "vitest";
import { cleanupTables, createTestDb } from "../test-utils";
import { tagDao, topicEventDao, topicViewDao, userDao } from "./dao";

describe("DAO Tests", async () => {
  const { db } = await createTestDb();

  beforeEach(async () => {
    await cleanupTables(db);
  });

  describe("userDao", () => {
    it("should create and retrieve user by id", async () => {
      // Create user
      const userData = { username: "testuser", email: "test@example.com" };
      const createdUser = await userDao.create(db, userData);

      expect(createdUser).toBeDefined();
      expect(createdUser.username).toBe("testuser");
      expect(createdUser.email).toBe("test@example.com");

      // Get user by id
      const result = await userDao.getById(db, createdUser.id);
      expect(result).toBeDefined();
      expect(result?.username).toBe("testuser");
      expect(result?.email).toBe("test@example.com");
    });

    it("should return null for non-existent user", async () => {
      const result = await userDao.getById(db, 999);
      expect(result).toBeNull();
    });

    it("should get user by username", async () => {
      const userData = { username: "testuser2", email: "test2@example.com" };
      await userDao.create(db, userData);

      const result = await userDao.getByUsername(db, "testuser2");
      expect(result).toBeDefined();
      expect(result?.email).toBe("test2@example.com");
    });

    it("should update user profile", async () => {
      const userData = { username: "oldname", email: "old@example.com" };
      const user = await userDao.create(db, userData);

      const updatedUser = await userDao.updateProfile(db, user.id, {
        username: "newname",
      });

      expect(updatedUser.username).toBe("newname");
      expect(updatedUser.email).toBe("old@example.com");
    });
  });

  describe("tagDao", () => {
    it("should create and retrieve tags", async () => {
      const tag = await tagDao.create(db, "javascript");
      expect(tag.name).toBe("javascript");

      const retrievedTag = await tagDao.getById(db, tag.id);
      expect(retrievedTag?.name).toBe("javascript");
    });

    it("should get or create tag", async () => {
      // First call should create
      const tag1 = await tagDao.getOrCreate(db, "react");
      expect(tag1.name).toBe("react");

      // Second call should return existing
      const tag2 = await tagDao.getOrCreate(db, "react");
      expect(tag2.id).toBe(tag1.id);
    });

    it("should get all tags", async () => {
      await tagDao.create(db, "typescript");
      await tagDao.create(db, "nodejs");

      const allTags = await tagDao.getAll(db);
      expect(allTags.length).toBe(2);
    });
  });

  describe("topicEventDao", () => {
    it("should create and retrieve topic events", async () => {
      const user = await userDao.create(db, {
        username: "author",
        email: "author@example.com",
      });

      const eventData = {
        topic_id: "topic-123",
        event_type: "created",
        event_data: { title: "Test Topic", content: "Test content" },
        user_id: user.id,
      };

      const event = await topicEventDao.create(db, eventData);
      expect(event.topic_id).toBe("topic-123");
      expect(event.event_type).toBe("created");

      const events = await topicEventDao.getByTopicId(db, "topic-123");
      expect(events.length).toBe(1);
      expect(events[0].event_data.title).toBe("Test Topic");
    });
  });

  describe("topicViewDao", () => {
    it("should upsert and retrieve topic views", async () => {
      const user = await userDao.create(db, {
        username: "author",
        email: "author@example.com",
      });

      const topicData = {
        id: "topic-123",
        title: "Test Topic",
        content: "Test content",
        user_id: user.id,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const topic = await topicViewDao.upsert(db, topicData);
      expect(topic.title).toBe("Test Topic");

      const retrievedTopic = await topicViewDao.getById(db, "topic-123");
      expect(retrievedTopic?.title).toBe("Test Topic");
      expect(retrievedTopic?.is_deleted).toBe(false);
    });

    it("should get all non-deleted topics", async () => {
      const user = await userDao.create(db, {
        username: "author",
        email: "author@example.com",
      });

      await topicViewDao.upsert(db, {
        id: "topic-1",
        title: "Topic 1",
        content: "Content 1",
        user_id: user.id,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await topicViewDao.upsert(db, {
        id: "topic-2",
        title: "Topic 2",
        content: "Content 2",
        user_id: user.id,
        is_deleted: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const topics = await topicViewDao.getAll(db);
      expect(topics.length).toBe(1);
      expect(topics[0].title).toBe("Topic 1");
    });
  });
});
