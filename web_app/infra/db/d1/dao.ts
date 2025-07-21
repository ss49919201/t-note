import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import {
  post_events,
  posts_view,
  tags,
  topic_events,
  topic_tags_view,
  topics_view,
  users,
} from "./schema";

export type Database = ReturnType<typeof drizzle>;

// User related functions
export const userDao = {
  async getById(db: Database, id: number) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] || null;
  },

  async getByUsername(db: Database, username: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return result[0] || null;
  },

  async create(db: Database, data: { username: string; email: string }) {
    const result = await db
      .insert(users)
      .values({
        username: data.username,
        email: data.email,
      })
      .returning();
    return result[0];
  },

  async updateProfile(
    db: Database,
    id: number,
    data: { username?: string; email?: string }
  ) {
    const result = await db
      .update(users)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  },
} as const;

// Tag related functions
export const tagDao = {
  async getAll(db: Database) {
    return await db.select().from(tags).orderBy(tags.name);
  },

  async getById(db: Database, id: number) {
    const result = await db.select().from(tags).where(eq(tags.id, id)).limit(1);
    return result[0] || null;
  },

  async getByName(db: Database, name: string) {
    const result = await db
      .select()
      .from(tags)
      .where(eq(tags.name, name))
      .limit(1);
    return result[0] || null;
  },

  async create(db: Database, name: string) {
    const result = await db.insert(tags).values({ name }).returning();
    return result[0];
  },

  async getOrCreate(db: Database, name: string) {
    const existing = await this.getByName(db, name);
    if (existing) return existing;
    return await this.create(db, name);
  },
} as const;

// Topic event related functions
export const topicEventDao = {
  async create(
    db: Database,
    data: {
      topic_id: string;
      event_type: string;
      event_data: object;
      user_id: number;
    }
  ) {
    const result = await db
      .insert(topic_events)
      .values({
        topic_id: data.topic_id,
        event_type: data.event_type,
        event_data: JSON.stringify(data.event_data),
        user_id: data.user_id,
      })
      .returning();
    return result[0];
  },

  async getByTopicId(db: Database, topicId: string) {
    const events = await db
      .select()
      .from(topic_events)
      .where(eq(topic_events.topic_id, topicId))
      .orderBy(topic_events.created_at);

    return events.map((event) => ({
      ...event,
      event_data: JSON.parse(event.event_data),
    }));
  },
} as const;

// Post event related functions
export const postEventDao = {
  async create(
    db: Database,
    data: {
      post_id: string;
      event_type: string;
      event_data: object;
      user_id: number;
    }
  ) {
    const result = await db
      .insert(post_events)
      .values({
        post_id: data.post_id,
        event_type: data.event_type,
        event_data: JSON.stringify(data.event_data),
        user_id: data.user_id,
      })
      .returning();
    return result[0];
  },

  async getByPostId(db: Database, postId: string) {
    const events = await db
      .select()
      .from(post_events)
      .where(eq(post_events.post_id, postId))
      .orderBy(post_events.created_at);

    return events.map((event) => ({
      ...event,
      event_data: JSON.parse(event.event_data),
    }));
  },
} as const;

// Topic view (read model) related functions
export const topicViewDao = {
  async getAll(db: Database, limit = 50, offset = 0) {
    return await db
      .select()
      .from(topics_view)
      .where(eq(topics_view.is_deleted, false))
      .orderBy(desc(topics_view.created_at))
      .limit(limit)
      .offset(offset);
  },

  async getById(db: Database, id: string) {
    const result = await db
      .select()
      .from(topics_view)
      .where(and(eq(topics_view.id, id), eq(topics_view.is_deleted, false)))
      .limit(1);
    return result[0] || null;
  },

  async getByUserId(db: Database, userId: number, limit = 50, offset = 0) {
    return await db
      .select()
      .from(topics_view)
      .where(
        and(eq(topics_view.user_id, userId), eq(topics_view.is_deleted, false))
      )
      .orderBy(desc(topics_view.created_at))
      .limit(limit)
      .offset(offset);
  },

  async upsert(
    db: Database,
    data: {
      id: string;
      title: string;
      content: string;
      user_id: number;
      is_deleted?: boolean;
      created_at: Date;
      updated_at: Date;
    }
  ) {
    const existing = await db
      .select()
      .from(topics_view)
      .where(eq(topics_view.id, data.id))
      .limit(1);

    if (existing.length > 0) {
      const result = await db
        .update(topics_view)
        .set({
          title: data.title,
          content: data.content,
          is_deleted: data.is_deleted ?? false,
          updated_at: data.updated_at,
        })
        .where(eq(topics_view.id, data.id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(topics_view).values(data).returning();
      return result[0];
    }
  },
} as const;

// Post view (read model) related functions
export const postViewDao = {
  async getByTopicId(db: Database, topicId: string) {
    return await db
      .select()
      .from(posts_view)
      .where(
        and(eq(posts_view.topic_id, topicId), eq(posts_view.is_deleted, false))
      )
      .orderBy(posts_view.created_at);
  },

  async getById(db: Database, id: string) {
    const result = await db
      .select()
      .from(posts_view)
      .where(and(eq(posts_view.id, id), eq(posts_view.is_deleted, false)))
      .limit(1);
    return result[0] || null;
  },

  async getReplies(db: Database, parentPostId: string) {
    return await db
      .select()
      .from(posts_view)
      .where(
        and(
          eq(posts_view.parent_post_id, parentPostId),
          eq(posts_view.is_deleted, false)
        )
      )
      .orderBy(posts_view.created_at);
  },

  async upsert(
    db: Database,
    data: {
      id: string;
      content: string;
      topic_id: string;
      parent_post_id?: string | null;
      user_id: number;
      is_deleted?: boolean;
      created_at: Date;
      updated_at: Date;
    }
  ) {
    const existing = await db
      .select()
      .from(posts_view)
      .where(eq(posts_view.id, data.id))
      .limit(1);

    if (existing.length > 0) {
      const result = await db
        .update(posts_view)
        .set({
          content: data.content,
          is_deleted: data.is_deleted ?? false,
          updated_at: data.updated_at,
        })
        .where(eq(posts_view.id, data.id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(posts_view).values(data).returning();
      return result[0];
    }
  },
} as const;

// Topic-tag relationship view related functions
export const topicTagViewDao = {
  async getTagsByTopicId(db: Database, topicId: string) {
    return await db
      .select({
        tag: tags,
      })
      .from(topic_tags_view)
      .innerJoin(tags, eq(topic_tags_view.tag_id, tags.id))
      .where(eq(topic_tags_view.topic_id, topicId));
  },

  async getTopicsByTagId(db: Database, tagId: number) {
    return await db
      .select({
        topic: topics_view,
      })
      .from(topic_tags_view)
      .innerJoin(topics_view, eq(topic_tags_view.topic_id, topics_view.id))
      .where(
        and(
          eq(topic_tags_view.tag_id, tagId),
          eq(topics_view.is_deleted, false)
        )
      );
  },

  async add(db: Database, topicId: string, tagId: number) {
    const result = await db
      .insert(topic_tags_view)
      .values({
        topic_id: topicId,
        tag_id: tagId,
        created_at: new Date(),
      })
      .returning();
    return result[0];
  },

  async remove(db: Database, topicId: string, tagId: number) {
    await db
      .delete(topic_tags_view)
      .where(
        and(
          eq(topic_tags_view.topic_id, topicId),
          eq(topic_tags_view.tag_id, tagId)
        )
      );
  },
} as const;
