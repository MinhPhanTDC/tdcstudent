'use client';

import { Card, Button, Badge } from '@tdc/ui';
import type { MajorForSelection } from '@/hooks/useSelectMajor';

export interface MajorSelectionCardProps {
  major: MajorForSelection;
  onViewDetails: (majorId: string) => void;
  onSelect: (majorId: string) => void;
  isSelected?: boolean;
}

/**
 * MajorSelectionCard component - displays major info for student selection
 * Requirements: 4.2, 4.3 - Display major with name, description, course count, view details, select button
 */
export function MajorSelectionCard({
  major,
  onViewDetails,
  onSelect,
  isSelected = false,
}: MajorSelectionCardProps): JSX.Element {
  return (
    <Card
      className={`transition-all ${
        isSelected
          ? 'ring-2 ring-primary-500 border-primary-500'
          : 'hover:shadow-md'
      }`}
    >
      <div className="space-y-4">
        {/* Header with color indicator */}
        <div className="flex items-start gap-4">
          {/* Color indicator */}
          <div
            className="h-12 w-12 rounded-lg flex-shrink-0"
            style={{ backgroundColor: major.color || '#6366f1' }}
          />

          {/* Major info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-secondary-900 text-lg">
              {major.name}
            </h3>
            {major.description && (
              <p className="mt-1 text-sm text-secondary-500 line-clamp-2">
                {major.description}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <Badge variant="default">
            <span className="flex items-center gap-1">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              {major.courseCount} môn học
            </span>
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(major.id)}
            className="flex-1"
          >
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Xem chi tiết
          </Button>
          <Button
            variant={isSelected ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => onSelect(major.id)}
            className="flex-1"
          >
            {isSelected ? (
              <>
                <svg
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Đã chọn
              </>
            ) : (
              'Chọn ngành này'
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
