'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge, Button } from '@tdc/ui';
import type { LabRequirement } from '@tdc/schemas';

export interface RequirementItemProps {
  /** The requirement to display */
  requirement: LabRequirement;
  /** Handler for toggling active status */
  onToggleActive: () => void;
  /** Handler for editing */
  onEdit: () => void;
  /** Handler for deleting */
  onDelete: () => void;
}

/**
 * RequirementItem component - sortable item for drag-drop reordering
 * Requirements: 3.1, 3.5, 3.6
 */
export function RequirementItem({
  requirement,
  onToggleActive,
  onEdit,
  onDelete,
}: RequirementItemProps): JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: requirement.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border bg-white p-4 ${
        isDragging ? 'border-primary-300 shadow-lg opacity-90' : 'border-secondary-200'
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="cursor-grab touch-none p-1 text-secondary-400 hover:text-secondary-600 active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Kéo để sắp xếp"
      >
        <DragHandleIcon />
      </button>

      {/* Order number */}
      <span className="flex h-6 w-6 items-center justify-center rounded bg-secondary-100 text-xs font-medium text-secondary-600">
        {requirement.order + 1}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-secondary-900 truncate">
            {requirement.title}
          </h4>
          {requirement.requiresVerification && (
            <Badge variant="warning" className="shrink-0">
              Cần xác nhận
            </Badge>
          )}
          {!requirement.isActive && (
            <Badge variant="default" className="shrink-0">
              Ẩn
            </Badge>
          )}
        </div>
        {requirement.description && (
          <p className="mt-0.5 text-sm text-secondary-500 truncate">
            {requirement.description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Toggle active button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleActive}
          title={requirement.isActive ? 'Ẩn yêu cầu' : 'Hiện yêu cầu'}
          aria-label={requirement.isActive ? 'Ẩn yêu cầu' : 'Hiện yêu cầu'}
        >
          {requirement.isActive ? <EyeIcon /> : <EyeOffIcon />}
        </Button>

        {/* Edit button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onEdit}
          title="Chỉnh sửa"
          aria-label="Chỉnh sửa yêu cầu"
        >
          <EditIcon />
        </Button>

        {/* Delete button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDelete}
          title="Xóa"
          aria-label="Xóa yêu cầu"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <TrashIcon />
        </Button>
      </div>
    </div>
  );
}

// Icon components
function DragHandleIcon(): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="5" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="19" r="1" />
    </svg>
  );
}

function EyeIcon(): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon(): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function EditIcon(): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function TrashIcon(): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}
