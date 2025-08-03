import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarkdownRenderer } from "./MarkdownRenderer";

describe("MarkdownRenderer", () => {
  test("基本的なマークダウンをレンダリングできる", () => {
    const content = "# タイトル\n\nこれは**太字**のテストです。";
    
    render(<MarkdownRenderer content={content} />);
    
    expect(screen.getByText("タイトル")).toBeInTheDocument();
    expect(screen.getByText("太字")).toBeInTheDocument();
  });

  test("空の内容でもエラーにならない", () => {
    render(<MarkdownRenderer content="" />);
    
    // エラーが発生しないことを確認
    expect(document.body).toBeInTheDocument();
  });

  test("リストをレンダリングできる", () => {
    const content = "- アイテム1\n- アイテム2\n- アイテム3";
    
    render(<MarkdownRenderer content={content} />);
    
    expect(screen.getByText("アイテム1")).toBeInTheDocument();
    expect(screen.getByText("アイテム2")).toBeInTheDocument();
    expect(screen.getByText("アイテム3")).toBeInTheDocument();
  });

  test("コードブロックをレンダリングできる", () => {
    const content = "```javascript\nconsole.log('Hello World');\n```";
    
    render(<MarkdownRenderer content={content} />);
    
    expect(screen.getByText("console.log('Hello World');")).toBeInTheDocument();
  });

  test("インラインコードをレンダリングできる", () => {
    const content = "これは`inline code`の例です。";
    
    const { container } = render(<MarkdownRenderer content={content} />);
    
    expect(screen.getByText("inline code")).toBeInTheDocument();
    // コード要素が適切なクラスを持つことを確認
    const codeElement = screen.getByText("inline code");
    expect(codeElement).toHaveClass("bg-gray-100", "text-red-600");
  });

  test("リンクをレンダリングできる", () => {
    const content = "[Google](https://www.google.com)";
    
    render(<MarkdownRenderer content={content} />);
    
    const link = screen.getByText("Google");
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', 'https://www.google.com');
  });

  test("テーブルをレンダリングできる", () => {
    const content = "| 列1 | 列2 |\n|-----|-----|\n| セル1 | セル2 |";
    
    render(<MarkdownRenderer content={content} />);
    
    expect(screen.getByText("列1")).toBeInTheDocument();
    expect(screen.getByText("列2")).toBeInTheDocument();
    expect(screen.getByText("セル1")).toBeInTheDocument();
    expect(screen.getByText("セル2")).toBeInTheDocument();
  });

  test("カスタムクラスが適用される", () => {
    const content = "テスト内容";
    const customClass = "custom-class";
    
    const { container } = render(
      <MarkdownRenderer content={content} className={customClass} />
    );
    
    expect(container.firstChild).toHaveClass(customClass);
  });
});