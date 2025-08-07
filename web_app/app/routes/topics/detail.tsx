import type { Route } from "./+types/detail";
import { Form, Link } from "react-router";
import { requireAuth } from "../../auth/guards.server";
import { getUserById } from "../../auth/user.server";
import type { Topic, Post } from "../../../model/topic";

export function meta() {
  return [
    { title: `Topic詳細 - t-note` },
    { name: "description", content: "Topicの詳細とスレッド投稿" },
  ];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireAuth(request);
  const user = await getUserById(userId);
  const topicId = params.id;
  
  // TODO: TopicServiceとPostServiceを使用してデータを取得
  // 開発中のダミーデータまたはnull
  const topic: Topic | null = null;
  const posts: Post[] = [];
  
  if (!topic) {
    // 開発中は404ではなくプレースホルダーを表示
    // throw new Response("Topic not found", { status: 404 });
  }
  
  return { user, topic, posts, topicId };
}

interface ActionData {
  error?: string;
  success?: string;
  replyTo?: string;
}

export async function action({ request, params }: Route.ActionArgs) {
  const userId = await requireAuth(request);
  const formData = await request.formData();
  const topicId = params.id;
  
  const content = formData.get("content");
  const replyTo = formData.get("replyTo");
  
  // バリデーション
  if (typeof content !== "string" || content.trim().length === 0) {
    return {
      error: "投稿内容を入力してください",
      replyTo: typeof replyTo === "string" ? replyTo : undefined,
    };
  }

  try {
    // TODO: PostServiceを使用してPost作成
    // const postService = new PostService(db);
    // const postId = await postService.createPost({
    //   content: content.trim(),
    //   topic_id: topicId,
    //   parent_post_id: typeof replyTo === "string" ? replyTo : undefined,
    //   user_id: parseInt(userId),
    // });
    
    // 仮の実装
    console.log("Post作成:", { 
      content: content.trim(), 
      topicId, 
      replyTo: typeof replyTo === "string" ? replyTo : undefined,
      userId 
    });
    
    return { success: "投稿しました" };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "投稿に失敗しました",
      replyTo: typeof replyTo === "string" ? replyTo : undefined,
    };
  }
}

export default function TopicDetail({ loaderData, actionData }: Route.ComponentProps) {
  const { user, topic, posts, topicId } = loaderData;
  const typedActionData = actionData as ActionData | undefined;

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
              {topic && topic as Topic ? (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {(topic as Topic).title}
                  </h1>
                  <div className="text-gray-700 mb-4 whitespace-pre-wrap">
                    {(topic as Topic).content}
                  </div>
                  <div className="text-sm text-gray-500">
                    作成日: {(topic as Topic).created_at.toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Topic詳細（開発中）
                  </h1>
                  <p className="text-gray-600 mb-4">
                    Topic ID: {topicId}
                  </p>
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
                  まだ投稿がありません。<br/>
                  最初の投稿をしてスレッドを開始しましょう！
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className={`border-l-4 pl-4 py-3 ${
                        post.parent_post_id ? 'border-gray-300 ml-6' : 'border-indigo-400'
                      }`}
                    >
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
                              >
                                編集
                              </button>
                              <button
                                type="button"
                                className="text-red-600 hover:text-red-800"
                              >
                                削除
                              </button>
                            </>
                          )}
                        </div>
                      </div>
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