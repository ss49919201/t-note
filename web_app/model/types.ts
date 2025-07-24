// Domain model types for the thread-based recording application

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface Tag {
  id: number;
  name: string;
  created_at: Date;
}

// Event types for event sourcing
export type TopicEventType = "created" | "updated" | "deleted" | "tag_added" | "tag_removed";
export type PostEventType = "created" | "updated" | "deleted";

export interface TopicEvent {
  id: number;
  topic_id: string;
  event_type: TopicEventType;
  event_data: Record<string, any>;
  user_id: number;
  created_at: Date;
}

export interface PostEvent {
  id: number;
  post_id: string;
  event_type: PostEventType;
  event_data: Record<string, any>;
  user_id: number;
  created_at: Date;
}

// Read model interfaces (current state)
export interface Topic {
  id: string;
  title: string;
  content: string;
  user_id: number;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  // Related data
  user?: User;
  tags?: Tag[];
  posts?: Post[];
}

export interface Post {
  id: string;
  content: string;
  topic_id: string;
  parent_post_id?: string | null;
  user_id: number;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  // Related data
  user?: User;
  replies?: Post[];
  parent?: Post;
}

// Command interfaces for creating/updating entities
export interface CreateTopicCommand {
  title: string;
  content: string;
  user_id: number;
  tags?: string[];
}

export interface UpdateTopicCommand {
  id: string;
  title?: string;
  content?: string;
  user_id: number;
}

export interface CreatePostCommand {
  content: string;
  topic_id: string;
  parent_post_id?: string;
  user_id: number;
}

export interface UpdatePostCommand {
  id: string;
  content: string;
  user_id: number;
}

// Event data structures
export interface TopicCreatedEventData {
  title: string;
  content: string;
}

export interface TopicUpdatedEventData {
  title?: string;
  content?: string;
}

export interface TopicDeletedEventData {
  reason?: string;
}

export interface TopicTagAddedEventData {
  tag_id: number;
  tag_name: string;
}

export interface TopicTagRemovedEventData {
  tag_id: number;
  tag_name: string;
}

export interface PostCreatedEventData {
  content: string;
  topic_id: string;
  parent_post_id?: string;
}

export interface PostUpdatedEventData {
  content: string;
}

export interface PostDeletedEventData {
  reason?: string;
}