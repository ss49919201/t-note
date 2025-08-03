import type { Route } from "./+types/new";
import { Form, Link, redirect } from "react-router";
import { requireAuth } from "../../auth/guards.server";
import { getUserById } from "../../auth/user.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "新しいTopic作成 - t-note" },
    { name: "description", content: "新しいTopicを作成してスレッドを開始" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireAuth(request);
  const user = await getUserById(userId);

  return { user };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireAuth(request);
  const formData = await request.formData();

  const title = formData.get("title");
  const content = formData.get("content");
  const tagsInput = formData.get("tags");

  // バリデーション
  if (typeof title !== "string" || title.trim().length === 0) {
    return {
      error: "タイトルを入力してください",
      values: { 
        title: typeof title === "string" ? title : "", 
        content: typeof content === "string" ? content : "", 
        tags: typeof tagsInput === "string" ? tagsInput : "" 
      },
    };
  }

  if (typeof content !== "string" || content.trim().length === 0) {
    return {
      error: "内容を入力してください",
      values: { 
        title: typeof title === "string" ? title : "", 
        content: typeof content === "string" ? content : "", 
        tags: typeof tagsInput === "string" ? tagsInput : "" 
      },
    };
  }

  // タグの処理（カンマ区切りで分割）
  const tags =
    typeof tagsInput === "string" && tagsInput.trim()
      ? tagsInput
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : [];

  try {
    // TODO: TopicServiceを使用してTopic作成
    // const topicService = new TopicService(db);
    // const topicId = await topicService.createTopic({
    //   title: title.trim(),
    //   content: content.trim(),
    //   user_id: parseInt(userId),
    //   tags,
    // });

    // 仮の実装: リダイレクト
    console.log("Topic作成:", { title, content, tags, userId });

    return redirect("/");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Topic作成に失敗しました",
      values: { 
        title: typeof title === "string" ? title : "", 
        content: typeof content === "string" ? content : "", 
        tags: typeof tagsInput === "string" ? tagsInput : "" 
      },
    };
  }
}

interface ActionData {
  error?: string;
  values?: {
    title: string;
    content: string;
    tags: string;
  };
}

export default function NewTopic({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { user } = loaderData;
  const typedActionData = actionData as ActionData | undefined;
  const values = typedActionData?.values || { title: "", content: "", tags: "" };

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
      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                新しいTopic作成
              </h2>

              <Form method="post" className="space-y-6">
                {/* タイトル */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    タイトル
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="title"
                      id="title"
                      defaultValue={values.title || ""}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Topicのタイトルを入力してください"
                    />
                  </div>
                </div>

                {/* 内容 */}
                <div>
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-700"
                  >
                    内容
                  </label>
                  <div className="mt-1">
                    <textarea
                      name="content"
                      id="content"
                      rows={8}
                      defaultValue={values.content || ""}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Topicの内容をマークダウン形式で入力してください..."
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    マークダウン記法が使用できます。
                  </p>
                </div>

                {/* タグ */}
                <div>
                  <label
                    htmlFor="tags"
                    className="block text-sm font-medium text-gray-700"
                  >
                    タグ（オプション）
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="tags"
                      id="tags"
                      defaultValue={values.tags || ""}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="タグをカンマ区切りで入力（例: 開発,テスト,議論）"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    タグはカンマ（,）で区切って入力してください。
                  </p>
                </div>

                {/* エラーメッセージ */}
                {typedActionData?.error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">
                      {typedActionData.error}
                    </div>
                  </div>
                )}

                {/* ボタン */}
                <div className="flex justify-end space-x-3">
                  <Link
                    to="/"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    キャンセル
                  </Link>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Topic作成
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
