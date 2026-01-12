'use client';

import type { HelpTopic } from '@tdc/schemas';
import { HELP_CATEGORY_LABELS, HELP_CATEGORY_ICONS } from '@tdc/schemas';

export interface HelpContentProps {
  /** The topic to display, or null if none selected */
  topic: HelpTopic | null;
}

/**
 * HelpContent component
 * Display selected topic content with markdown rendering
 * Requirements: 5.2, 5.5
 */
export function HelpContent({ topic }: HelpContentProps): JSX.Element {
  if (!topic) {
    return <EmptyState />;
  }

  return (
    <article className="h-full overflow-auto">
      {/* Topic Header */}
      <header className="mb-6 border-b border-secondary-200 pb-4">
        <div className="flex items-center gap-2 text-sm text-secondary-500 mb-2">
          <span>{HELP_CATEGORY_ICONS[topic.category]}</span>
          <span>{HELP_CATEGORY_LABELS[topic.category]}</span>
        </div>
        <h1 className="text-2xl font-bold text-secondary-900">{topic.title}</h1>
      </header>

      {/* Topic Content - Rendered Markdown */}
      <div className="prose prose-secondary max-w-none">
        <MarkdownContent content={topic.content} />
      </div>
    </article>
  );
}

/**
 * Empty state when no topic is selected
 */
function EmptyState(): JSX.Element {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">📖</div>
        <h2 className="text-lg font-medium text-secondary-900 mb-2">
          Chọn một chủ đề
        </h2>
        <p className="text-sm text-secondary-500">
          Chọn một chủ đề từ danh sách bên trái để xem hướng dẫn chi tiết
        </p>
      </div>
    </div>
  );
}

interface MarkdownContentProps {
  content: string;
}

/**
 * Simple markdown renderer
 * Converts markdown to HTML with basic styling
 */
function MarkdownContent({ content }: MarkdownContentProps): JSX.Element {
  // Parse markdown to HTML
  const html = parseMarkdown(content);

  return (
    <div
      className="help-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Simple markdown parser
 * Supports: headers, bold, italic, code, lists, blockquotes, links
 */
function parseMarkdown(markdown: string): string {
  let html = markdown;

  // Escape HTML entities first (except for our markdown conversions)
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headers (## and ###)
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-secondary-900 mt-6 mb-3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-secondary-900 mt-8 mb-4">$1</h2>');

  // Bold (**text**)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>');

  // Italic (*text*)
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code class="bg-secondary-100 px-1.5 py-0.5 rounded text-sm font-mono text-secondary-800">$1</code>');

  // Blockquotes (&gt; text) - note: > was escaped to &gt;
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-4 border-primary-500 pl-4 py-2 my-4 bg-primary-50 text-secondary-700 italic">$1</blockquote>');

  // Unordered lists (- item)
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-secondary-700">$1</li>');
  
  // Wrap consecutive list items in ul
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => {
    return `<ul class="my-4 space-y-2">${match}</ul>`;
  });

  // Ordered lists (1. item, 2. item, etc.)
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-secondary-700">$1</li>');

  // Paragraphs (double newlines)
  html = html.replace(/\n\n/g, '</p><p class="my-4 text-secondary-700">');
  
  // Single newlines within paragraphs
  html = html.replace(/\n/g, '<br />');

  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<')) {
    html = `<p class="my-4 text-secondary-700">${html}</p>`;
  }

  return html;
}
