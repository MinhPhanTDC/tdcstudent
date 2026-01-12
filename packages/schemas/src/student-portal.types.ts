import type { Semester } from './semester.schema';
import type { Course } from './course.schema';
import type { StudentProgress } from './progress.schema';

/**
 * Semester with computed status for student portal
 * Requirements: 1.2
 */
export interface SemesterWithStatus {
  semester: Semester;
  status: 'completed' | 'in_progress' | 'locked';
  courseCount: number;
  completedCount: number;
}

/**
 * Course with progress information for student portal
 * Requirements: 2.2
 */
export interface CourseWithProgress {
  course: Course;
  progress: StudentProgress | null;
  isLocked: boolean;
  previousCourse?: Course;
  nextCourse?: Course;
}

/**
 * Overall progress statistics for student dashboard
 * Requirements: 5.2
 */
export interface OverallProgress {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalProjects: number;
  submittedProjects: number;
  completionPercentage: number;
  currentCourse?: CourseWithProgress;
  nextCourses: Course[];
}

/**
 * Learning tree node for visualization
 * Requirements: 6.2, 6.3, 6.4, 5.5
 */
export interface LearningTreeNode {
  id: string;
  type: 'semester' | 'major' | 'course' | 'milestone';
  label: string;
  status: 'completed' | 'current' | 'locked';
  children?: LearningTreeNode[];
  /** Optional color for major nodes */
  color?: string;
  /** Whether this is a required course in a major */
  isRequired?: boolean;
}
