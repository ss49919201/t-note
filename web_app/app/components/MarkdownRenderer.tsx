import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  return (
    <div className={`prose prose-gray max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // カスタムスタイリング
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold text-gray-900 mb-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold text-gray-900 mb-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-bold text-gray-900 mb-2" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-gray-700 mb-3 leading-relaxed" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc list-inside mb-3 text-gray-700"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal list-inside mb-3 text-gray-700"
              {...props}
            />
          ),
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-indigo-300 pl-4 italic text-gray-600 mb-3"
              {...props}
            />
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <code
                className="block bg-gray-100 p-3 rounded text-sm overflow-x-auto"
                {...props}
              >
                {children}
              </code>
            ) : (
              <code
                className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ node, ...props }) => (
            <pre
              className="bg-gray-100 p-3 rounded text-sm overflow-x-auto mb-3"
              {...props}
            />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-indigo-600 hover:text-indigo-800 underline"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <table
              className="min-w-full border border-gray-300 mb-3"
              {...props}
            />
          ),
          th: ({ node, ...props }) => (
            <th
              className="border border-gray-300 px-3 py-2 bg-gray-100 font-medium text-left"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-gray-300 px-3 py-2" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
