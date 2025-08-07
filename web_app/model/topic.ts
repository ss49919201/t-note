import * as v from "valibot";
import { UserSchema } from "./user";

// Tag schema
export const TagSchema = v.object({
  id: v.number(),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(50)),
  created_at: v.date(),
});

// Base Post schema without relations to avoid circular reference
export const BasePostSchema = v.object({
  id: v.string(),
  content: v.pipe(v.string(), v.minLength(1)),
  topic_id: v.string(),
  parent_post_id: v.nullable(v.string()),
  user_id: v.number(),
  is_deleted: v.boolean(),
  created_at: v.date(),
  updated_at: v.date(),
});

// Post schema - simplified to avoid circular reference issues during development
export const PostSchema = BasePostSchema;

// Topic schema
export const TopicSchema = v.object({
  id: v.string(),
  title: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  content: v.pipe(v.string(), v.minLength(1)),
  user_id: v.number(),
  is_deleted: v.boolean(),
  created_at: v.date(),
  updated_at: v.date(),
  // Optional relations
  user: v.optional(UserSchema),
  tags: v.optional(v.array(TagSchema)),
  posts: v.optional(v.array(PostSchema)),
});

// Event type schemas
export const TopicEventTypeSchema = v.picklist([
  "created",
  "updated", 
  "deleted",
  "tag_added",
  "tag_removed"
]);

export const PostEventTypeSchema = v.picklist([
  "created",
  "updated",
  "deleted"
]);

// Event schemas
export const TopicEventSchema = v.object({
  id: v.number(),
  topic_id: v.string(),
  event_type: TopicEventTypeSchema,
  event_data: v.record(v.string(), v.any()),
  user_id: v.number(),
  created_at: v.date(),
});

export const PostEventSchema = v.object({
  id: v.number(),
  post_id: v.string(),
  event_type: PostEventTypeSchema,
  event_data: v.record(v.string(), v.any()),
  user_id: v.number(),
  created_at: v.date(),
});

// Command schemas
export const CreateTopicCommandSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  content: v.pipe(v.string(), v.minLength(1)),
  user_id: v.number(),
  tags: v.optional(v.array(v.pipe(v.string(), v.minLength(1), v.maxLength(50)))),
});

export const UpdateTopicCommandSchema = v.object({
  id: v.string(),
  title: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(200))),
  content: v.optional(v.pipe(v.string(), v.minLength(1))),
  user_id: v.number(),
});

export const CreatePostCommandSchema = v.object({
  content: v.pipe(v.string(), v.minLength(1)),
  topic_id: v.string(),
  parent_post_id: v.optional(v.string()),
  user_id: v.number(),
});

export const UpdatePostCommandSchema = v.object({
  id: v.string(),
  content: v.pipe(v.string(), v.minLength(1)),
  user_id: v.number(),
});

// Event data schemas
export const TopicCreatedEventDataSchema = v.object({
  title: v.string(),
  content: v.string(),
});

export const TopicUpdatedEventDataSchema = v.object({
  title: v.optional(v.string()),
  content: v.optional(v.string()),
});

export const TopicDeletedEventDataSchema = v.object({
  reason: v.optional(v.string()),
});

export const TopicTagAddedEventDataSchema = v.object({
  tag_id: v.number(),
  tag_name: v.string(),
});

export const TopicTagRemovedEventDataSchema = v.object({
  tag_id: v.number(),
  tag_name: v.string(),
});

export const PostCreatedEventDataSchema = v.object({
  content: v.string(),
  topic_id: v.string(),
  parent_post_id: v.optional(v.string()),
});

export const PostUpdatedEventDataSchema = v.object({
  content: v.string(),
});

export const PostDeletedEventDataSchema = v.object({
  reason: v.optional(v.string()),
});

// Type inference
export type Tag = v.InferOutput<typeof TagSchema>;
export type Topic = v.InferOutput<typeof TopicSchema>;
export type BasePost = v.InferOutput<typeof BasePostSchema>;
export type Post = v.InferOutput<typeof PostSchema>;
export type TopicEvent = v.InferOutput<typeof TopicEventSchema>;
export type PostEvent = v.InferOutput<typeof PostEventSchema>;

export type TopicEventType = v.InferOutput<typeof TopicEventTypeSchema>;
export type PostEventType = v.InferOutput<typeof PostEventTypeSchema>;

export type CreateTopicCommand = v.InferOutput<typeof CreateTopicCommandSchema>;
export type UpdateTopicCommand = v.InferOutput<typeof UpdateTopicCommandSchema>;
export type CreatePostCommand = v.InferOutput<typeof CreatePostCommandSchema>;
export type UpdatePostCommand = v.InferOutput<typeof UpdatePostCommandSchema>;

export type TopicCreatedEventData = v.InferOutput<typeof TopicCreatedEventDataSchema>;
export type TopicUpdatedEventData = v.InferOutput<typeof TopicUpdatedEventDataSchema>;
export type TopicDeletedEventData = v.InferOutput<typeof TopicDeletedEventDataSchema>;
export type TopicTagAddedEventData = v.InferOutput<typeof TopicTagAddedEventDataSchema>;
export type TopicTagRemovedEventData = v.InferOutput<typeof TopicTagRemovedEventDataSchema>;

export type PostCreatedEventData = v.InferOutput<typeof PostCreatedEventDataSchema>;
export type PostUpdatedEventData = v.InferOutput<typeof PostUpdatedEventDataSchema>;
export type PostDeletedEventData = v.InferOutput<typeof PostDeletedEventDataSchema>;