import type { Route } from "./+types/detail";
import { Link } from "react-router";
import { requireAuth } from "../../auth/guards.server";
import { getUserById } from "../../auth/user.server";
import type { Topic, Post } from "../../model/topic";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Topic詳細 - t-note` },
    { name: "description", content: "Topicの詳細とスレッド投稿" },
  ];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireAuth(request);
  const user = await getUserById(userId);
  const topicId = params.id;
  
  // TODO: TopicServiceを使用してTopic詳細を取得
  const topic: Topic | null = null;
  const posts: Post[] = [];
  
  if (!topic) {
    throw new Response("Topic not found", { status: 404 });
  }
  
  return { user, topic, posts, topicId };
}

export default function TopicDetail({ loaderData }: Route.ComponentProps) {
  const { user, topic, posts, topicId } = loaderData;

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
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Topic詳細実装予定
                </h1>
                <p className="text-gray-600 mb-4">
                  Topic ID: {topicId}
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div>・Topic情報の表示</div>
                  <div>・マークダウンレンダリング</div>
                  <div>・スレッド投稿の表示</div>
                  <div>・返信機能</div>
                  <div>・編集・削除機能</div>
                </div>
              </div>
            </div>
          </div>

          {/* スレッド投稿エリア（実装予定） */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                スレッド投稿
              </h2>
              <div className="text-center text-gray-500">
                スレッド投稿機能は次のフェーズで実装予定です
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}