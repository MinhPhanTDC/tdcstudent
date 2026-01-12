import { z } from 'zod';

/**
 * Help category enum schema
 * Categories for organizing help topics in the admin user guide
 */
export const HelpCategorySchema = z.enum([
  'getting-started',
  'student-management',
  'course-management',
  'tracking',
  'settings',
  'faq',
]);

export type HelpCategory = z.infer<typeof HelpCategorySchema>;

/**
 * Help category display names (Vietnamese)
 */
export const HELP_CATEGORY_LABELS: Record<HelpCategory, string> = {
  'getting-started': 'Bắt đầu',
  'student-management': 'Quản lý Học viên',
  'course-management': 'Quản lý Khóa học',
  'tracking': 'Tracking',
  'settings': 'Cài đặt',
  'faq': 'Câu hỏi thường gặp',
};

/**
 * Help category icons (for UI display)
 */
export const HELP_CATEGORY_ICONS: Record<HelpCategory, string> = {
  'getting-started': '📚',
  'student-management': '👥',
  'course-management': '📖',
  'tracking': '📊',
  'settings': '⚙️',
  'faq': '❓',
};

/**
 * Help topic schema
 * Represents a single help topic with markdown content
 */
export const HelpTopicSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  title: z.string().min(1, 'Title is required'),
  category: HelpCategorySchema,
  content: z.string(), // Markdown content
  order: z.number().int().nonnegative(),
});

export type HelpTopic = z.infer<typeof HelpTopicSchema>;

/**
 * Filter topics by search query (case-insensitive)
 * Searches in both title and content
 */
export function filterHelpTopics(topics: HelpTopic[], query: string): HelpTopic[] {
  if (!query.trim()) {
    return topics;
  }
  
  const lowerQuery = query.toLowerCase().trim();
  
  return topics.filter(topic => 
    topic.title.toLowerCase().includes(lowerQuery) ||
    topic.content.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Group topics by category
 */
export function groupTopicsByCategory(topics: HelpTopic[]): Record<HelpCategory, HelpTopic[]> {
  const grouped: Record<HelpCategory, HelpTopic[]> = {
    'getting-started': [],
    'student-management': [],
    'course-management': [],
    'tracking': [],
    'settings': [],
    'faq': [],
  };
  
  for (const topic of topics) {
    grouped[topic.category].push(topic);
  }
  
  // Sort each category by order
  for (const category of Object.keys(grouped) as HelpCategory[]) {
    grouped[category].sort((a, b) => a.order - b.order);
  }
  
  return grouped;
}

/**
 * Get all categories in display order
 */
export const HELP_CATEGORIES_ORDER: HelpCategory[] = [
  'getting-started',
  'student-management',
  'course-management',
  'tracking',
  'settings',
  'faq',
];
