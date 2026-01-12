'use client';

import { useState } from 'react';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { LabRequirement } from '@tdc/schemas';
import { RequirementItem } from './RequirementItem';

export interface RequirementManagerProps {
  /** List of requirements to manage */
  requirements: LabRequirement[];
  /** Handler for reordering requirements */
  onReorder: (requirementIds: string[]) => void;
  /** Handler for toggling active status */
  onToggleActive: (id: string) => void;
  /** Handler for editing a requirement */
  onEdit: (requirement: LabRequirement) => void;
  /** Handler for deleting a requirement */
  onDelete: (id: string) => void;
  /** Loading state for reorder operation */
  isReordering?: boolean;
}

/**
 * RequirementManager component - manages lab requirements with drag-drop reordering
 * Requirements: 3.1, 3.5, 3.6
 */
export function RequirementManager({
  requirements,
  onReorder,
  onToggleActive,
  onEdit,
  onDelete,
  isReordering = false,
}: RequirementManagerProps): JSX.Element {
  const [items, setItems] = useState(requirements);

  // Update items when requirements prop changes
  if (requirements !== items && !isReordering) {
    setItems(requirements);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Notify parent of new order
      onReorder(newItems.map((item) => item.id));
    }
  };

  if (requirements.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-secondary-300 p-8 text-center">
        <p className="text-secondary-500">Chưa có yêu cầu nào.</p>
        <p className="mt-1 text-sm text-secondary-400">
          Nhấn &quot;Thêm yêu cầu&quot; để tạo yêu cầu mới.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((requirement) => (
            <RequirementItem
              key={requirement.id}
              requirement={requirement}
              onToggleActive={() => onToggleActive(requirement.id)}
              onEdit={() => onEdit(requirement)}
              onDelete={() => onDelete(requirement.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
