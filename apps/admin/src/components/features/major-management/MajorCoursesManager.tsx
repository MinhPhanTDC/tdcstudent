'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, EmptyState, Skeleton } from '@tdc/ui';
import type { MajorCourse, Course } from '@tdc/schemas';
import { MajorCourseItem } from './MajorCourseItem';

export interface MajorCoursesManagerProps {
  majorCourses: MajorCourse[];
  coursesMap: Record<string, Course>;
  isLoading?: boolean;
  onAddCourse: () => void;
  onRemoveCourse: (majorCourseId: string) => void;
  onToggleRequired: (majorCourseId: string) => void;
  onReorder: (majorCourseIds: string[]) => void;
  removingId?: string | null;
  togglingId?: string | null;
  isReordering?: boolean;
}

/**
 * MajorCoursesManager component - drag-and-drop list of courses, add course button
 * Requirements: 2.2, 2.3, 2.4, 2.5
 */
export function MajorCoursesManager({
  majorCourses,
  coursesMap,
  isLoading = false,
  onAddCourse,
  onRemoveCourse,
  onToggleRequired,
  onReorder,
  removingId,
  togglingId,
  isReordering = false,
}: MajorCoursesManagerProps): JSX.Element {
  const [items, setItems] = useState<MajorCourse[]>(majorCourses);

  // Update items when majorCourses changes
  useState(() => {
    setItems(majorCourses);
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        setItems(newItems);

        // Call onReorder with new order
        onReorder(newItems.map((item) => item.id));
      }
    },
    [items, onReorder]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-secondary-900">
          Môn học trong chuyên ngành ({majorCourses.length})
        </h3>
        <Button onClick={onAddCourse} size="sm">
          <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm môn học
        </Button>
      </div>

      {/* Empty state */}
      {majorCourses.length === 0 ? (
        <EmptyState
          title="Chưa có môn học"
          description="Thêm môn học vào chuyên ngành để xây dựng chương trình đào tạo."
          icon={
            <svg
              className="h-12 w-12 text-secondary-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          }
          action={
            <Button onClick={onAddCourse}>
              <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm môn học đầu tiên
            </Button>
          }
        />
      ) : (
        /* Sortable list */
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((majorCourse, index) => (
                <SortableMajorCourseItem
                  key={majorCourse.id}
                  majorCourse={majorCourse}
                  course={coursesMap[majorCourse.courseId]}
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                  onToggleRequired={() => onToggleRequired(majorCourse.id)}
                  onRemove={() => onRemoveCourse(majorCourse.id)}
                  isToggling={togglingId === majorCourse.id}
                  isRemoving={removingId === majorCourse.id}
                  isReordering={isReordering}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

/**
 * Sortable wrapper for MajorCourseItem
 */
interface SortableMajorCourseItemProps {
  majorCourse: MajorCourse;
  course?: Course;
  isFirst: boolean;
  isLast: boolean;
  onToggleRequired: () => void;
  onRemove: () => void;
  isToggling: boolean;
  isRemoving: boolean;
  isReordering: boolean;
}

function SortableMajorCourseItem({
  majorCourse,
  course,
  isFirst,
  isLast,
  onToggleRequired,
  onRemove,
  isToggling,
  isRemoving,
  isReordering,
}: SortableMajorCourseItemProps): JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: majorCourse.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <MajorCourseItem
        majorCourse={majorCourse}
        course={course}
        isFirst={isFirst}
        isLast={isLast}
        onToggleRequired={onToggleRequired}
        onRemove={onRemove}
        isToggling={isToggling}
        isRemoving={isRemoving}
        isReordering={isReordering}
        showDragHandle={true}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
