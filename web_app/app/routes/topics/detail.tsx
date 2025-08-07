import type { Route } from "./+types/detail";
import { Form, Link } from "react-router";
import { requireAuth } from "../../auth/guards.server";
import { getUserById } from "../../auth/user.server";
import { TopicService } from "../../services/topic.server";
import { PostService } from "../../services/post.server";
import { drizzle } from "drizzle-orm/d1";
import { useState, useEffect } from "react";

export function meta() {
  return [
    { title: `Topic詳細 - t-note` },
    { name: "description", content: "Topicの詳細とスレッド投稿" },
  ];
}

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const userId = await requireAuth(request);
  const user = await getUserById(userId);
  const topicId = params.id;

  if (!topicId) {
    throw new Response("Topic ID is required", { status: 400 });
  }

  try {
    // データベース接続を取得（Cloudflare D1）
    const db = drizzle(context.cloudflare.env.BINDING_NAME);

    // TopicServiceとPostServiceを使用してデータを取得
    const topicService = new TopicService(db);
    const postService = new PostService(db);

    const topic = await topicService.getTopicById(topicId);
    const posts = topic ? await postService.getPostsByTopicId(topicId) : [];

    if (!topic) {
      throw new Response("Topic not found", { status: 404 });
    }

    // スレッド構造に整理
    const threadPosts = postService.buildThreadTree(posts);

    return { user, topic, posts: threadPosts, topicId };
  } catch (error) {
    console.error("Topic詳細取得エラー:", error);
    throw new Response("Internal Server Error", { status: 500 });
  }
}

interface ActionData {
  error?: string;
  success?: string;
  replyTo?: string;
  action?: string;
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const userId = await requireAuth(request);
  const formData = await request.formData();
  const topicId = params.id;
  const actionType = formData.get("action");

  if (!topicId) {
    return { error: "Topic ID is required" };
  }

  try {
    // データベース接続を取得
    const db = drizzle(context.cloudflare.env.BINDING_NAME);
    const postService = new PostService(db);

    // 投稿編集
    if (actionType === "edit_post") {
      const postId = formData.get("postId");
      const content = formData.get("content");

      if (typeof postId !== "string" || typeof content !== "string" || content.trim().length === 0) {
        return { error: "投稿内容を入力してください" };
      }

      await postService.updatePost({
        id: postId,
        content: content.trim(),
        user_id: parseInt(userId),
      });

      return { success: "投稿を更新しました", action: "edit_post" };
    }

    // 投稿削除
    if (actionType === "delete_post") {
      const postId = formData.get("postId");

      if (typeof postId !== "string") {
        return { error: "投稿IDが無効です" };
      }

      await postService.deletePost(postId, parseInt(userId));

      return { success: "投稿を削除しました", action: "delete_post" };
    }

    // 新規投稿（既存の処理）
    const content = formData.get("content");
    const replyTo = formData.get("replyTo");

    // バリデーション
    if (typeof content !== "string" || content.trim().length === 0) {
      return {
        error: "投稿内容を入力してください",
        replyTo: typeof replyTo === "string" ? replyTo : undefined,
      };
    }

    // PostServiceを使用してPost作成
    const postId = await postService.createPost({
      content: content.trim(),
      topic_id: topicId,
      parent_post_id: typeof replyTo === "string" ? replyTo : undefined,
      user_id: parseInt(userId),
    });

    console.log("Post作成成功:", { postId, topicId, userId });
    return { success: "投稿しました" };
  } catch (error) {
    console.error("Post操作エラー:", error);
    return {
      error: error instanceof Error ? error.message : "操作に失敗しました",
      replyTo: typeof formData.get("replyTo") === "string" ? formData.get("replyTo") : undefined,
    };
  }
}

export default function TopicDetail({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { user, topic, posts, topicId } = loaderData;
  const typedActionData = actionData as ActionData | undefined;
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");

  // 編集成功時に編集モードをリセット
  useEffect(() => {
    if (typedActionData?.success && typedActionData?.action === "edit_post") {
      setEditingPostId(null);
      setEditingContent("");
    }
  }, [typedActionData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link to="/" className="text-3xl font-bold text-gray-900">
                t-note
              </Link>
              <span className="ml-4 text-sm text-gray-600">
                {user?.username}さん
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ホームに戻る
              </Link>
              <Link
                to="/logout"
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ログアウト
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Topic情報 */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              {topic ? (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {topic.title}
                  </h1>
                  <div className="text-gray-700 mb-4 whitespace-pre-wrap">
                    {topic.content}
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>作成日: {topic.created_at.toLocaleDateString()}</span>
                    {topic.tags && topic.tags.length > 0 && (
                      <div className="flex space-x-2">
                        {topic.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Topic詳細（開発中）
                  </h1>
                  <p className="text-gray-600 mb-4">Topic ID: {topicId}</p>
                  <div className="text-sm text-gray-500">
                    実際のTopicデータは後で実装されます
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 新規投稿フォーム */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                新しい投稿
              </h2>

              <Form method="post" className="space-y-4">
                <div>
                  <label htmlFor="content" className="sr-only">
                    投稿内容
                  </label>
                  <textarea
                    name="content"
                    id="content"
                    rows={4}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="投稿内容を入力してください..."
                    required
                  />
                </div>

                {/* エラー・成功メッセージ */}
                {typedActionData?.error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">
                      {typedActionData.error}
                    </div>
                  </div>
                )}

                {typedActionData?.success && (
                  <div className="rounded-md bg-green-50 p-4">
                    <div className="text-sm text-green-700">
                      {typedActionData.success}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    投稿する
                  </button>
                </div>
              </Form>
            </div>
          </div>

          {/* スレッド投稿一覧 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                投稿一覧
              </h2>

              {posts.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  まだ投稿がありません。
                  <br />
                  最初の投稿をしてスレッドを開始しましょう！
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className={`border-l-4 pl-4 py-3 ${
                        post.parent_post_id
                          ? "border-gray-300 ml-6"
                          : "border-indigo-400"
                      }`}
                    >
                      {editingPostId === post.id ? (
                        <Form method="post" className="space-y-3">
                          <input type="hidden" name="action" value="edit_post" />
                          <input type="hidden" name="postId" value={post.id} />
                          <textarea
                            name="content"
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            rows={3}
                            required
                          />
                          <div className="flex space-x-2">
                            <button
                              type="submit"
                              className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                            >
                              保存
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPostId(null)}
                              className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400"
                            >
                              キャンセル
                            </button>
                          </div>
                        </Form>
                      ) : (
                        <>
                          <div className="text-gray-700 whitespace-pre-wrap mb-2">
                            {post.content}
                          </div>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>
                              投稿日: {post.created_at.toLocaleDateString()}
                            </span>
                            <div className="space-x-2">
                              <button
                                type="button"
                                className="text-indigo-600 hover:text-indigo-800"
                                onClick={() => {
                                  // TODO: 返信フォームの表示切り替え
                                  console.log("返信:", post.id);
                                }}
                              >
                                返信
                              </button>
                              {post.user_id === parseInt(user?.id || "0") && (
                                <>
                                  <button
                                    type="button"
                                    className="text-gray-600 hover:text-gray-800"
                                    onClick={() => {
                                      setEditingPostId(post.id);
                                      setEditingContent(post.content);
                                    }}
                                  >
                                    編集
                                  </button>
                                  <Form method="post" className="inline">
                                    <input type="hidden" name="action" value="delete_post" />
                                    <input type="hidden" name="postId" value={post.id} />
                                    <button
                                      type="submit"
                                      className="text-red-600 hover:text-red-800"
                                      onClick={(e) => {
                                        if (!confirm("この投稿を削除してもよろしいですか？")) {
                                          e.preventDefault();
                                        }
                                      }}
                                    >
                                      削除
                                    </button>
                                  </Form>
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
