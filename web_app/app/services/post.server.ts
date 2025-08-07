import { drizzle } from "drizzle-orm/d1";
import { postViewDao, postEventDao } from "../../infra/db/d1/dao";
import type { CreatePostCommand, UpdatePostCommand, Post } from "../../model/topic";
import * as v from "valibot";
import { CreatePostCommandSchema, UpdatePostCommandSchema } from "../../model/topic";

export class PostService {
  constructor(private db?: ReturnType<typeof drizzle>) {}

  async createPost(command: CreatePostCommand): Promise<string> {
    // バリデーション
    const validatedCommand = v.parse(CreatePostCommandSchema, command);
    
    if (!this.db) {
      throw new Error("Database connection not available");
    }

    // Post ID生成（UUID風の簡易実装）
    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    // Post作成イベントを記録
    await postEventDao.create(this.db, {
      post_id: postId,
      event_type: "created",
      event_data: {
        content: validatedCommand.content,
        topic_id: validatedCommand.topic_id,
        parent_post_id: validatedCommand.parent_post_id,
      },
      user_id: validatedCommand.user_id,
    });

    // Postビューを更新
    await postViewDao.upsert(this.db, {
      id: postId,
      content: validatedCommand.content,
      topic_id: validatedCommand.topic_id,
      parent_post_id: validatedCommand.parent_post_id || null,
      user_id: validatedCommand.user_id,
      is_deleted: false,
      created_at: now,
      updated_at: now,
    });

    return postId;
  }

  async getPostsByTopicId(topicId: string): Promise<Post[]> {
    if (!this.db) {
      throw new Error("Database connection not available");
    }

    const postsView = await postViewDao.getByTopicId(this.db, topicId);
    
    return postsView.map(postView => ({
      id: postView.id,
      content: postView.content,
      topic_id: postView.topic_id,
      parent_post_id: postView.parent_post_id,
      user_id: postView.user_id,
      is_deleted: postView.is_deleted,
      created_at: postView.created_at,
      updated_at: postView.updated_at,
    }));
  }

  async getRepliesByPostId(parentPostId: string): Promise<Post[]> {
    if (!this.db) {
      throw new Error("Database connection not available");
    }

    const repliesView = await postViewDao.getReplies(this.db, parentPostId);
    
    return repliesView.map(replyView => ({
      id: replyView.id,
      content: replyView.content,
      topic_id: replyView.topic_id,
      parent_post_id: replyView.parent_post_id,
      user_id: replyView.user_id,
      is_deleted: replyView.is_deleted,
      created_at: replyView.created_at,
      updated_at: replyView.updated_at,
    }));
  }

  async updatePost(command: UpdatePostCommand): Promise<void> {
    // バリデーション
    const validatedCommand = v.parse(UpdatePostCommandSchema, command);
    
    if (!this.db) {
      throw new Error("Database connection not available");
    }

    // 既存のPostを確認
    const existingPost = await postViewDao.getById(this.db, validatedCommand.id);
    if (!existingPost) {
      throw new Error("Post not found");
    }

    // 権限チェック（自分のPostのみ更新可能）
    if (existingPost.user_id !== validatedCommand.user_id) {
      throw new Error("Permission denied: You can only update your own posts");
    }

    const now = new Date();

    // 更新イベントを記録
    await postEventDao.create(this.db, {
      post_id: validatedCommand.id,
      event_type: "updated",
      event_data: {
        content: validatedCommand.content,
      },
      user_id: validatedCommand.user_id,
    });

    // Postビューを更新
    await postViewDao.upsert(this.db, {
      id: validatedCommand.id,
      content: validatedCommand.content,
      topic_id: existingPost.topic_id,
      parent_post_id: existingPost.parent_post_id,
      user_id: existingPost.user_id,
      is_deleted: existingPost.is_deleted,
      created_at: existingPost.created_at,
      updated_at: now,
    });
  }

  async deletePost(id: string, userId: number): Promise<void> {
    if (!this.db) {
      throw new Error("Database connection not available");
    }

    // 既存のPostを確認
    const existingPost = await postViewDao.getById(this.db, id);
    if (!existingPost) {
      throw new Error("Post not found");
    }

    // 権限チェック（自分のPostのみ削除可能）
    if (existingPost.user_id !== userId) {
      throw new Error("Permission denied: You can only delete your own posts");
    }

    const now = new Date();

    // 削除イベントを記録
    await postEventDao.create(this.db, {
      post_id: id,
      event_type: "deleted",
      event_data: {
        reason: "User deleted",
      },
      user_id: userId,
    });

    // Postビューを論理削除
    await postViewDao.upsert(this.db, {
      id: existingPost.id,
      content: existingPost.content,
      topic_id: existingPost.topic_id,
      parent_post_id: existingPost.parent_post_id,
      user_id: existingPost.user_id,
      is_deleted: true,
      created_at: existingPost.created_at,
      updated_at: now,
    });
  }

  // スレッド構造を持つPostの階層表示用ヘルパー
  buildThreadTree(posts: Post[]): Post[] {
    const postMap = new Map<string, Post & { replies?: Post[] }>();
    const rootPosts: Post[] = [];

    // 全てのPostをMapに格納
    posts.forEach(post => {
      postMap.set(post.id, { ...post, replies: [] });
    });

    // 親子関係を構築
    posts.forEach(post => {
      const postWithReplies = postMap.get(post.id)!;
      
      if (post.parent_post_id) {
        const parent = postMap.get(post.parent_post_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(postWithReplies);
        }
      } else {
        // 親がない投稿はルートレベル
        rootPosts.push(postWithReplies);
      }
    });

    return rootPosts;
  }
}