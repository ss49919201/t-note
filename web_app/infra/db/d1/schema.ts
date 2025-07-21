import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  created_at: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updated_at: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  created_at: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Topic Events
export const topic_events = sqliteTable("topic_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  topic_id: text("topic_id").notNull(), // UUID
  event_type: text("event_type").notNull(), // "created" | "updated" | "deleted" | "tag_added" | "tag_removed"
  event_data: text("event_data").notNull(), // JSON string
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  created_at: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Post Events
export const post_events = sqliteTable("post_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  post_id: text("post_id").notNull(), // UUID
  event_type: text("event_type").notNull(), // "created" | "updated" | "deleted"
  event_data: text("event_data").notNull(), // JSON string
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  created_at: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Read Model: Current state of topics (derived from events)
export const topics_view = sqliteTable("topics_view", {
  id: text("id").primaryKey(), // UUID
  title: text("title").notNull(),
  content: text("content").notNull(),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  is_deleted: integer("is_deleted", { mode: "boolean" }).notNull().default(false),
  created_at: integer("created_at", { mode: "timestamp" }).notNull(),
  updated_at: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Read Model: Current state of posts (derived from events)
export const posts_view = sqliteTable("posts_view", {
  id: text("id").primaryKey(), // UUID
  content: text("content").notNull(),
  topic_id: text("topic_id").notNull(),
  parent_post_id: text("parent_post_id"),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  is_deleted: integer("is_deleted", { mode: "boolean" }).notNull().default(false),
  created_at: integer("created_at", { mode: "timestamp" }).notNull(),
  updated_at: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Read Model: Topic-Tag relationships (derived from events)
export const topic_tags_view = sqliteTable("topic_tags_view", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  topic_id: text("topic_id").notNull(),
  tag_id: integer("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
  created_at: integer("created_at", { mode: "timestamp" }).notNull(),
});
