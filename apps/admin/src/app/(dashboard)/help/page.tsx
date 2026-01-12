'use client';

import { useState, useMemo } from 'react';
import { HelpTopicList, HelpSearch, HelpContent } from '@/components/features/help';
import { helpTopics } from '@/data/helpTopics';
import { filterHelpTopics } from '@tdc/schemas';

/**
 * Admin Help page
 * Two-column layout: topic list + content
 * Search bar at top
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
export default function HelpPage(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Filter topics based on search query
  const filteredTopics = useMemo(() => {
    return filterHelpTopics(helpTopics, searchQuery);
  }, [searchQuery]);

  // Get selected topic
  const selectedTopic = useMemo(() => {
    if (!selectedTopicId) return null;
    return helpTopics.find((topic) => topic.id === selectedTopicId) ?? null;
  }, [selectedTopicId]);

  // Handle search - clear selection if topic is filtered out
  const handleSearch = (query: string): void => {
    setSearchQuery(query);
    
    // If current selection is filtered out, clear it
    if (selectedTopicId && query) {
      const stillVisible = filterHelpTopics(helpTopics, query).some(
        (t) => t.id === selectedTopicId
      );
      if (!stillVisible) {
        setSelectedTopicId(null);
      }
    }
  };

  // Handle topic selection
  const handleSelectTopic = (id: string): void => {
    setSelectedTopicId(id);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Hướng dẫn sử dụng</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Tìm hiểu cách sử dụng các tính năng của hệ thống
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <HelpSearch
          value={searchQuery}
          onSearch={handleSearch}
          placeholder="Tìm kiếm hướng dẫn..."
        />
      </div>

      {/* Two-column Layout */}
      <div className="flex flex-1 gap-6 overflow-hidden rounded-lg border border-secondary-200 bg-white">
        {/* Left Column - Topic List */}
        <aside className="w-72 flex-shrink-0 overflow-y-auto border-r border-secondary-200 p-4">
          {filteredTopics.length > 0 ? (
            <HelpTopicList
              topics={filteredTopics}
              selectedId={selectedTopicId}
              onSelect={handleSelectTopic}
            />
          ) : (
            <NoSearchResults query={searchQuery} />
          )}
        </aside>

        {/* Right Column - Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <HelpContent topic={selectedTopic} />
        </main>
      </div>
    </div>
  );
}

/**
 * No search results message
 */
function NoSearchResults({ query }: { query: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="text-3xl mb-3">🔍</div>
      <p className="text-sm text-secondary-600 mb-1">
        Không tìm thấy kết quả cho
      </p>
      <p className="text-sm font-medium text-secondary-900">&ldquo;{query}&rdquo;</p>
      <p className="text-xs text-secondary-500 mt-3">
        Thử tìm kiếm với từ khóa khác
      </p>
    </div>
  );
}
