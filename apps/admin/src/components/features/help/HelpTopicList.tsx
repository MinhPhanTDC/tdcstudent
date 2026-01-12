'use client';

import { cn } from '@tdc/ui';
import type { HelpTopic, HelpCategory } from '@tdc/schemas';
import {
  HELP_CATEGORY_LABELS,
  HELP_CATEGORY_ICONS,
  HELP_CATEGORIES_ORDER,
  groupTopicsByCategory,
} from '@tdc/schemas';

export interface HelpTopicListProps {
  /** List of help topics to display */
  topics: HelpTopic[];
  /** Currently selected topic ID */
  selectedId: string | null;
  /** Callback when a topic is selected */
  onSelect: (id: string) => void;
}

/**
 * HelpTopicList component
 * Sidebar with categorized topics and highlight for selected topic
 * Requirements: 5.1, 5.2
 */
export function HelpTopicList({
  topics,
  selectedId,
  onSelect,
}: HelpTopicListProps): JSX.Element {
  const groupedTopics = groupTopicsByCategory(topics);

  return (
    <nav className="space-y-4" aria-label="Help topics navigation">
      {HELP_CATEGORIES_ORDER.map((category) => {
        const categoryTopics = groupedTopics[category];
        
        // Skip empty categories
        if (categoryTopics.length === 0) {
          return null;
        }

        return (
          <CategorySection
            key={category}
            category={category}
            topics={categoryTopics}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        );
      })}
    </nav>
  );
}

interface CategorySectionProps {
  category: HelpCategory;
  topics: HelpTopic[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * Category section with icon, label and topic list
 */
function CategorySection({
  category,
  topics,
  selectedId,
  onSelect,
}: CategorySectionProps): JSX.Element {
  const icon = HELP_CATEGORY_ICONS[category];
  const label = HELP_CATEGORY_LABELS[category];

  return (
    <div>
      {/* Category Header */}
      <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-secondary-700">
        <span>{icon}</span>
        <span>{label}</span>
      </div>

      {/* Topic List */}
      <ul className="space-y-0.5">
        {topics.map((topic) => (
          <TopicItem
            key={topic.id}
            topic={topic}
            isSelected={topic.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </div>
  );
}

interface TopicItemProps {
  topic: HelpTopic;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

/**
 * Individual topic item with selection state
 */
function TopicItem({ topic, isSelected, onSelect }: TopicItemProps): JSX.Element {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(topic.id)}
        className={cn(
          'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
          'hover:bg-secondary-100',
          isSelected
            ? 'bg-primary-50 text-primary-700 font-medium'
            : 'text-secondary-600'
        )}
        aria-current={isSelected ? 'page' : undefined}
      >
        {topic.title}
      </button>
    </li>
  );
}
