import type { Route } from "./+types/home";
import { Link } from "react-router";
import { requireAuth } from "../auth/guards.server";
import { getUserById } from "../auth/user.server";
import type { Topic } from "../../model/topic";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "t-note - スレッド形式記録アプリ" },
    { name: "description", content: "Topic一覧とスレッド投稿を管理" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireAuth(request);
  const user = await getUserById(userId);
  
  // TODO: TopicServiceを使用してTopic一覧を取得
  const topics: Topic[] = [];
  
  return { user, topics };
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
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900">Topics</h2>
                {/* TODO: Topic一覧の表示 */}
                <div className="text-sm text-gray-600">
                  Topic一覧の実装予定地
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
