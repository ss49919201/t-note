import { drizzle } from "drizzle-orm/d1";
import { topicViewDao, topicEventDao, tagDao, topicTagViewDao } from "../../infra/db/d1/dao";
import type { CreateTopicCommand, UpdateTopicCommand, Topic } from "../../model/topic";
import * as v from "valibot";
import { CreateTopicCommandSchema, UpdateTopicCommandSchema } from "../../model/topic";

export class TopicService {
  constructor(private db?: ReturnType<typeof drizzle>) {}

  async createTopic(command: CreateTopicCommand): Promise<string> {
    // バリデーション
    const validatedCommand = v.parse(CreateTopicCommandSchema, command);
    
    if (!this.db) {
      throw new Error("Database connection not available");
    }

    // Topic ID生成（UUID風の簡易実装）
    const topicId = `topic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    // Topic作成イベントを記録
    await topicEventDao.create(this.db, {
      topic_id: topicId,
      event_type: "created",
      event_data: {
        title: validatedCommand.title,
        content: validatedCommand.content,
      },
      user_id: validatedCommand.user_id,
    });

    // Topicビューを更新
    await topicViewDao.upsert(this.db, {
      id: topicId,
      title: validatedCommand.title,
      content: validatedCommand.content,
      user_id: validatedCommand.user_id,
      is_deleted: false,
      created_at: now,
      updated_at: now,
    });

    // タグが指定されている場合は処理
    if (validatedCommand.tags && validatedCommand.tags.length > 0) {
      for (const tagName of validatedCommand.tags) {
        const tag = await tagDao.getOrCreate(this.db, tagName);
        await topicTagViewDao.add(this.db, topicId, tag.id);
        
        // タグ追加イベントを記録
        await topicEventDao.create(this.db, {
          topic_id: topicId,
          event_type: "tag_added",
          event_data: {
            tag_id: tag.id,
            tag_name: tag.name,
          },
          user_id: validatedCommand.user_id,
        });
      }
    }

    return topicId;
  }

  async getTopicById(id: string): Promise<Topic | null> {
    if (!this.db) {
      throw new Error("Database connection not available");
    }

    const topicView = await topicViewDao.getById(this.db, id);
    if (!topicView) {
      return null;
    }

    // タグ情報を取得
    const tagsResult = await topicTagViewDao.getTagsByTopicId(this.db, id);
    const tags = tagsResult.map(result => result.tag);

    return {
      id: topicView.id,
      title: topicView.title,
      content: topicView.content,
      user_id: topicView.user_id,
      is_deleted: topicView.is_deleted,
      created_at: topicView.created_at,
      updated_at: topicView.updated_at,
      tags,
    };
  }

  async getAllTopics(limit = 50, offset = 0): Promise<Topic[]> {
    if (!this.db) {
      throw new Error("Database connection not available");
    }

    const topicsView = await topicViewDao.getAll(this.db, limit, offset);
    
    // 各Topicのタグ情報を取得
    const topics = await Promise.all(
      topicsView.map(async (topicView) => {
        const tagsResult = await topicTagViewDao.getTagsByTopicId(this.db!, topicView.id);
        const tags = tagsResult.map(result => result.tag);

        return {
          id: topicView.id,
          title: topicView.title,
          content: topicView.content,
          user_id: topicView.user_id,
          is_deleted: topicView.is_deleted,
          created_at: topicView.created_at,
          updated_at: topicView.updated_at,
          tags,
        };
      })
    );

    return topics;
  }

  async updateTopic(command: UpdateTopicCommand): Promise<void> {
    // バリデーション
    const validatedCommand = v.parse(UpdateTopicCommandSchema, command);
    
    if (!this.db) {
      throw new Error("Database connection not available");
    }

    // 既存のTopicを確認
    const existingTopic = await topicViewDao.getById(this.db, validatedCommand.id);
    if (!existingTopic) {
      throw new Error("Topic not found");
    }

    // 権限チェック（自分のTopicのみ更新可能）
    if (existingTopic.user_id !== validatedCommand.user_id) {
      throw new Error("Permission denied: You can only update your own topics");
    }

    const now = new Date();
    const eventData: any = {};

    // 更新されたフィールドを記録
    const updateData: any = {
      updated_at: now,
    };

    if (validatedCommand.title !== undefined) {
      updateData.title = validatedCommand.title;
      eventData.title = validatedCommand.title;
    }

    if (validatedCommand.content !== undefined) {
      updateData.content = validatedCommand.content;
      eventData.content = validatedCommand.content;
    }

    // 更新イベントを記録
    await topicEventDao.create(this.db, {
      topic_id: validatedCommand.id,
      event_type: "updated",
      event_data: eventData,
      user_id: validatedCommand.user_id,
    });

    // Topicビューを更新
    await topicViewDao.upsert(this.db, {
      id: validatedCommand.id,
      title: validatedCommand.title || existingTopic.title,
      content: validatedCommand.content || existingTopic.content,
      user_id: existingTopic.user_id,
      is_deleted: existingTopic.is_deleted,
      created_at: existingTopic.created_at,
      updated_at: now,
    });
  }

  async deleteTopic(id: string, userId: number): Promise<void> {
    if (!this.db) {
      throw new Error("Database connection not available");
    }

    // 既存のTopicを確認
    const existingTopic = await topicViewDao.getById(this.db, id);
    if (!existingTopic) {
      throw new Error("Topic not found");
    }

    // 権限チェック（自分のTopicのみ削除可能）
    if (existingTopic.user_id !== userId) {
      throw new Error("Permission denied: You can only delete your own topics");
    }

    const now = new Date();

    // 削除イベントを記録
    await topicEventDao.create(this.db, {
      topic_id: id,
      event_type: "deleted",
      event_data: {
        reason: "User deleted",
      },
      user_id: userId,
    });

    // Topicビューを論理削除
    await topicViewDao.upsert(this.db, {
      id: existingTopic.id,
      title: existingTopic.title,
      content: existingTopic.content,
      user_id: existingTopic.user_id,
      is_deleted: true,
      created_at: existingTopic.created_at,
      updated_at: now,
    });
  }
}