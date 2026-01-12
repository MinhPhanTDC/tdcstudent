'use client';

import { cn } from '@tdc/ui';
import type { LearningTreeNode } from '@tdc/schemas';

export interface TreeNodeProps {
  node: LearningTreeNode;
  onClick?: () => void;
  isLast?: boolean;
  depth?: number;
}

/**
 * Get status configuration for a node
 */
function getStatusConfig(node: LearningTreeNode) {
  const baseConfig = {
    completed: {
      bgColor: 'bg-green-500',
      borderColor: 'border-green-500',
      textColor: 'text-green-700',
      icon: (
        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    current: {
      bgColor: 'bg-primary-500',
      borderColor: 'border-primary-500',
      textColor: 'text-primary-700',
      icon: (
        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    locked: {
      bgColor: 'bg-secondary-300',
      borderColor: 'border-secondary-300',
      textColor: 'text-secondary-400',
      icon: (
        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
  };

  // For major nodes with custom color
  if (node.type === 'major' && node.color) {
    const color = node.color;
    return {
      completed: {
        ...baseConfig.completed,
        bgColor: '',
        borderColor: '',
        textColor: '',
        customBgColor: color,
        customBorderColor: color,
        customTextColor: color,
      },
      current: {
        ...baseConfig.current,
        bgColor: '',
        borderColor: '',
        textColor: '',
        customBgColor: color,
        customBorderColor: color,
        customTextColor: color,
      },
      locked: baseConfig.locked,
    }[node.status];
  }

  return baseConfig[node.status];
}

/**
 * Get type label for a node
 */
function getTypeLabel(type: LearningTreeNode['type']): string {
  switch (type) {
    case 'semester':
      return 'Học kỳ';
    case 'major':
      return 'Chuyên ngành';
    case 'course':
      return 'Môn học';
    case 'milestone':
      return 'Cột mốc';
    default:
      return '';
  }
}

/**
 * Get icon for node type
 */
function getTypeIcon(type: LearningTreeNode['type'], status: LearningTreeNode['status']) {
  if (type === 'major') {
    return (
      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    );
  }
  
  if (type === 'course') {
    if (status === 'completed') {
      return (
        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    if (status === 'current') {
      return (
        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    }
    return (
      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    );
  }

  // Default icons for semester and milestone
  return null;
}

/**
 * TreeNode component - displays a single node in the learning tree
 * Requirements: 6.2, 6.3, 6.4, 6.5, 5.5
 */
export function TreeNode({ node, onClick, depth = 0 }: TreeNodeProps): JSX.Element {
  const isClickable = node.status !== 'locked' && onClick;
  const config = getStatusConfig(node);
  const typeIcon = getTypeIcon(node.type, node.status);
  const hasCustomColor = 'customBgColor' in config;

  const handleClick = () => {
    if (isClickable) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  // Handle child node clicks
  const handleChildClick = (childNode: LearningTreeNode) => {
    if (childNode.status !== 'locked' && onClick) {
      // For course children, we need to navigate to the course
      // The parent component should handle this
      onClick();
    }
  };

  return (
    <div className="relative">
      {/* Connector line from parent */}
      {depth > 0 && (
        <div
          className={cn(
            'absolute left-0 top-0 h-6 w-px bg-secondary-300',
            '-translate-x-4 -translate-y-full'
          )}
        />
      )}

      {/* Node content */}
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border-2 px-4 py-3 transition-all',
          !hasCustomColor && config.borderColor,
          isClickable && 'cursor-pointer hover:shadow-md',
          node.status === 'locked' && 'opacity-60',
          node.status === 'current' && !hasCustomColor && 'ring-2 ring-primary-200 ring-offset-2',
          // Special styling for course nodes
          node.type === 'course' && 'py-2 px-3'
        )}
        style={hasCustomColor ? { 
          borderColor: (config as { customBorderColor: string }).customBorderColor,
          ...(node.status === 'current' ? { 
            boxShadow: `0 0 0 2px ${(config as { customBorderColor: string }).customBorderColor}20` 
          } : {})
        } : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        aria-label={`${node.label} - ${node.status === 'completed' ? 'Hoàn thành' : node.status === 'current' ? 'Đang học' : 'Chưa mở khóa'}`}
      >
        {/* Status indicator */}
        <div
          className={cn(
            'flex items-center justify-center rounded-full',
            !hasCustomColor && config.bgColor,
            node.type === 'course' ? 'h-6 w-6' : 'h-8 w-8'
          )}
          style={hasCustomColor ? { 
            backgroundColor: (config as { customBgColor: string }).customBgColor 
          } : undefined}
        >
          {typeIcon || config.icon}
        </div>

        {/* Label */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span 
              className={cn(
                'font-medium',
                !hasCustomColor && config.textColor,
                node.type === 'course' && 'text-sm'
              )}
              style={hasCustomColor ? { 
                color: (config as { customTextColor: string }).customTextColor 
              } : undefined}
            >
              {node.label}
            </span>
            {/* Required badge for courses */}
            {node.type === 'course' && node.isRequired && (
              <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                Bắt buộc
              </span>
            )}
            {node.type === 'course' && node.isRequired === false && (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                Tự chọn
              </span>
            )}
          </div>
          <span className="text-xs text-secondary-400">{getTypeLabel(node.type)}</span>
        </div>

        {/* Arrow for clickable nodes */}
        {isClickable && (
          <svg className="h-5 w-5 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>

      {/* Children nodes */}
      {node.children && node.children.length > 0 && (
        <div className="ml-8 mt-2 space-y-2 border-l-2 border-secondary-200 pl-4">
          {node.children.map((child, index) => (
            <TreeNode
              key={child.id}
              node={child}
              onClick={() => handleChildClick(child)}
              isLast={index === node.children!.length - 1}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
