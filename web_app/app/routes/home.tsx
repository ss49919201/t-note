import type { Route } from "./+types/home";
import { Link } from "react-router";
import { requireAuth } from "../auth/guards.server";
import { getUserById } from "../auth/user.server";
import type { Topic } from "../../model/topic";
import { TopicService } from "../services/topic.server";
import { drizzle } from "drizzle-orm/d1";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "t-note - スレッド形式記録アプリ" },
    { name: "description", content: "Topic一覧とスレッド投稿を管理" },
  ];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const userId = await requireAuth(request);
  const user = await getUserById(userId);
  
  try {
    // データベース接続を取得
    const db = drizzle(context.cloudflare.env.BINDING_NAME);
    const topicService = new TopicService(db);
    
    // Topic一覧を取得（最新20件）
    const topics = await topicService.getAllTopics(20, 0);
    
    return { user, topics };
  } catch (error) {
    console.error("Topic一覧取得エラー:", error);
    // エラーの場合は空の配列を返す
    return { user, topics: [] };
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { user, topics } = loaderData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">t-note</h1>
              <span className="ml-4 text-sm text-gray-600">
                ようこそ、{user?.username}さん
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/topics/new"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                新しいTopic
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            {topics.length === 0 ? (
              <div className="text-center">
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Topicがありません
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  新しいTopicを作成してスレッドを開始しましょう。
                </p>
                <div className="mt-6">
                  <Link
                    to="/topics/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    新しいTopic
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">
                    Topics ({topics.length})
                  </h2>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          <Link
                            to={`/topics/${topic.id}`}
                            className="hover:text-indigo-600"
                          >
                            {topic.title}
                          </Link>
                        </h3>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {topic.content}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {topic.created_at.toLocaleDateString()}
                        </span>
                        {topic.tags && topic.tags.length > 0 && (
                          <div className="flex space-x-1">
                            {topic.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag.id}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                {tag.name}
                              </span>
                            ))}
                            {topic.tags.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                +{topic.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <Link
                          to={`/topics/${topic.id}`}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          詳細を見る →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                
                {topics.length >= 20 && (
                  <div className="text-center">
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                      さらに読み込む
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
