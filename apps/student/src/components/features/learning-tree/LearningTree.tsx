'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@tdc/ui';
import type { SemesterWithStatus, LearningTreeNode } from '@tdc/schemas';
import { TreeNode } from './TreeNode';
import type { MajorCourseWithStatus, MyMajorData } from '@/hooks/useMyMajor';

export interface LearningTreeProps {
  semesters: SemesterWithStatus[];
  currentSemesterId?: string;
  /** Optional major data to include in tree visualization */
  majorData?: MyMajorData | null;
}

/**
 * Converts semester status to tree node status
 */
function mapSemesterStatusToNodeStatus(
  semesterStatus: 'completed' | 'in_progress' | 'locked',
  isCurrent: boolean
): 'completed' | 'current' | 'locked' {
  if (isCurrent || semesterStatus === 'in_progress') {
    return 'current';
  }
  if (semesterStatus === 'completed') {
    return 'completed';
  }
  return 'locked';
}

/**
 * Converts major course status to tree node status
 */
function mapMajorCourseStatusToNodeStatus(
  courseStatus: 'completed' | 'in_progress' | 'locked'
): 'completed' | 'current' | 'locked' {
  if (courseStatus === 'in_progress') {
    return 'current';
  }
  return courseStatus;
}

/**
 * Builds tree nodes from major courses
 */
function buildMajorCourseNodes(courses: MajorCourseWithStatus[]): LearningTreeNode[] {
  return courses.map((courseWithStatus) => ({
    id: courseWithStatus.majorCourse.courseId,
    type: 'course' as const,
    label: courseWithStatus.course?.title ?? 'Môn học không xác định',
    status: mapMajorCourseStatusToNodeStatus(courseWithStatus.status),
    isRequired: courseWithStatus.majorCourse.isRequired,
  }));
}

/**
 * Builds tree structure from semesters
 */
function buildTreeFromSemesters(
  semesters: SemesterWithStatus[],
  currentSemesterId?: string
): LearningTreeNode[] {
  return semesters.map((semesterWithStatus) => {
    const { semester, status } = semesterWithStatus;
    const isCurrent = semester.id === currentSemesterId;

    return {
      id: semester.id,
      type: 'semester' as const,
      label: semester.name,
      status: mapSemesterStatusToNodeStatus(status, isCurrent),
    };
  });
}

/**
 * Builds major node with course children
 */
function buildMajorNode(majorData: MyMajorData): LearningTreeNode {
  const hasInProgress = majorData.inProgressCourses > 0;
  const isCompleted = majorData.completedCourses === majorData.totalCourses && majorData.totalCourses > 0;
  
  return {
    id: majorData.major.id,
    type: 'major' as const,
    label: majorData.major.name,
    status: isCompleted ? 'completed' : hasInProgress ? 'current' : 'locked',
    color: majorData.major.color,
    children: buildMajorCourseNodes(majorData.courses),
  };
}

/**
 * LearningTree component - displays learning path as a tree visualization
 * Requirements: 6.1, 6.2, 6.3, 6.4, 5.5
 */
export function LearningTree({ semesters, currentSemesterId, majorData }: LearningTreeProps): JSX.Element {
  const router = useRouter();

  // Find current semester if not provided (used for highlighting)
  const effectiveCurrentId = useMemo(() => {
    if (currentSemesterId) return currentSemesterId;
    const inProgress = semesters.find((s) => s.status === 'in_progress');
    return inProgress?.semester.id;
  }, [semesters, currentSemesterId]);

  // Rebuild tree nodes when effective current changes
  const treeNodesWithCurrent = useMemo(
    () => buildTreeFromSemesters(semesters, effectiveCurrentId),
    [semesters, effectiveCurrentId]
  );

  // Build major node if major data is available
  const majorNode = useMemo(
    () => (majorData ? buildMajorNode(majorData) : null),
    [majorData]
  );

  const handleNodeClick = (nodeId: string, nodeType: string) => {
    if (nodeType === 'semester') {
      router.push(`/semesters/${nodeId}`);
    } else if (nodeType === 'course') {
      router.push(`/courses/${nodeId}`);
    } else if (nodeType === 'major') {
      router.push('/my-major');
    }
  };

  if (semesters.length === 0) {
    return (
      <Card className="text-center">
        <div className="py-8">
          <svg
            className="mx-auto h-12 w-12 text-secondary-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mt-4 text-secondary-500">Chưa có học kỳ nào</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-green-500" />
          <span className="text-secondary-600">Hoàn thành</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-primary-500" />
          <span className="text-secondary-600">Đang học</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-secondary-300" />
          <span className="text-secondary-600">Chưa mở khóa</span>
        </div>
        {majorData && (
          <div className="flex items-center gap-2">
            <div 
              className="h-4 w-4 rounded-full" 
              style={{ backgroundColor: majorData.major.color || '#8B5CF6' }}
            />
            <span className="text-secondary-600">Chuyên ngành</span>
          </div>
        )}
      </div>

      {/* Tree visualization */}
      <Card>
        <div className="space-y-4">
          {/* Start node */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
              <svg
                className="h-5 w-5 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <span className="font-medium text-secondary-700">Bắt đầu hành trình</span>
          </div>

          {/* Connector line */}
          <div className="ml-5 h-4 w-px bg-secondary-300" />

          {/* Tree nodes */}
          <div className="space-y-3">
            {treeNodesWithCurrent.map((node, index) => (
              <div key={node.id}>
                <TreeNode
                  node={node}
                  onClick={() => handleNodeClick(node.id, node.type)}
                />
                {/* Connector between nodes */}
                {index < treeNodesWithCurrent.length - 1 && (
                  <div className="ml-5 h-3 w-px bg-secondary-300" />
                )}
              </div>
            ))}
          </div>

          {/* Major section - if student has selected a major */}
          {majorNode && (
            <>
              {/* Connector to major section */}
              <div className="ml-5 h-4 w-px bg-secondary-300" />
              
              {/* Major section header */}
              <div className="flex items-center gap-3">
                <div 
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${majorData?.major.color || '#8B5CF6'}20` }}
                >
                  <svg
                    className="h-5 w-5"
                    style={{ color: majorData?.major.color || '#8B5CF6' }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <span className="font-medium text-secondary-700">Chuyên ngành của bạn</span>
              </div>

              {/* Connector */}
              <div className="ml-5 h-3 w-px bg-secondary-300" />

              {/* Major node with courses */}
              <TreeNode
                node={majorNode}
                onClick={() => handleNodeClick(majorNode.id, majorNode.type)}
              />
            </>
          )}

          {/* End node */}
          <div className="ml-5 h-4 w-px bg-secondary-300" />
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-5 w-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <span className="font-medium text-secondary-700">Hoàn thành chương trình</span>
          </div>
        </div>
      </Card>

      {/* Progress summary */}
      <div className="rounded-lg bg-primary-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary-900">Tiến độ học tập</p>
            <p className="text-xs text-primary-600">
              {semesters.filter((s) => s.status === 'completed').length}/{semesters.length} học kỳ hoàn thành
            </p>
          </div>
          <div className="text-2xl font-bold text-primary-700">
            {Math.round(
              (semesters.filter((s) => s.status === 'completed').length / semesters.length) * 100
            )}%
          </div>
        </div>
      </div>

      {/* Major progress summary - if student has selected a major */}
      {majorData && (
        <div 
          className="rounded-lg p-4"
          style={{ backgroundColor: `${majorData.major.color || '#8B5CF6'}10` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p 
                className="text-sm font-medium"
                style={{ color: majorData.major.color || '#8B5CF6' }}
              >
                Tiến độ chuyên ngành
              </p>
              <p className="text-xs text-secondary-600">
                {majorData.completedCourses}/{majorData.totalCourses} môn hoàn thành
              </p>
            </div>
            <div 
              className="text-2xl font-bold"
              style={{ color: majorData.major.color || '#8B5CF6' }}
            >
              {majorData.progressPercentage}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
