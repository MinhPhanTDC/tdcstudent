'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { majorService, majorCourseService, studentRepository, semesterRepository } from '@tdc/firebase';
import type { Major, MajorCourse, Semester } from '@tdc/schemas';
import { AppError, ErrorCode } from '@tdc/types';
import { useAuth } from '@/contexts/AuthContext';
import { useMyStudent } from './useMyCourses';

// Query keys factory
export const selectMajorKeys = {
  all: ['select-major'] as const,
  majors: () => [...selectMajorKeys.all, 'majors'] as const,
  majorCourses: (majorId: string) => [...selectMajorKeys.all, 'courses', majorId] as const,
  majorRequired: () => [...selectMajorKeys.all, 'required'] as const,
};

/**
 * Major with course count for selection display
 */
export interface MajorForSelection extends Major {
  courseCount: number;
}

/**
 * Result of checking if major selection is required
 */
export interface MajorRequiredCheck {
  isRequired: boolean;
  hasSelectedMajor: boolean;
  currentSemester?: Semester;
}

/**
 * Hook to get active majors for selection
 * Requirements: 4.2 - Display all active majors with name, description, and course count
 */
export function useMajorsForSelection() {
  return useQuery({
    queryKey: selectMajorKeys.majors(),
    queryFn: async (): Promise<MajorForSelection[]> => {
      // Get active majors
      const majorsResult = await majorService.getActiveMajors();
      if (!majorsResult.success) {
        throw majorsResult.error;
      }

      // Get course count for each major
      const majorsWithCount: MajorForSelection[] = await Promise.all(
        majorsResult.data.map(async (major) => {
          const countResult = await majorService.getCourseCount(major.id);
          return {
            ...major,
            courseCount: countResult.success ? countResult.data : 0,
          };
        })
      );

      return majorsWithCount;
    },
  });
}

/**
 * Hook to get courses for a specific major (preview before selection)
 * Requirements: 4.3 - Display the list of courses in that major
 */
export function useMajorCoursesPreview(majorId: string) {
  return useQuery({
    queryKey: selectMajorKeys.majorCourses(majorId),
    queryFn: async (): Promise<MajorCourse[]> => {
      if (!majorId) return [];

      const result = await majorCourseService.getMajorCourses(majorId);
      if (!result.success) {
        throw result.error;
      }

      return result.data;
    },
    enabled: !!majorId,
  });
}

/**
 * Hook to check if major selection is required for current student
 * Requirements: 3.4, 4.1 - Check if student needs to select major before accessing semester
 */
export function useCheckMajorRequired() {
  const { user } = useAuth();
  const { data: student } = useMyStudent();

  return useQuery({
    queryKey: selectMajorKeys.majorRequired(),
    queryFn: async (): Promise<MajorRequiredCheck> => {
      if (!student) {
        return { isRequired: false, hasSelectedMajor: false };
      }

      // Check if student already has a selected major
      const hasSelectedMajor = !!student.selectedMajorId;

      // Get current semester or next semester that requires major selection
      const semestersResult = await semesterRepository.findActive();
      if (!semestersResult.success) {
        return { isRequired: false, hasSelectedMajor };
      }

      // Find semester that requires major selection
      const semesterRequiringMajor = semestersResult.data.find(
        (s) => s.requiresMajorSelection
      );

      if (!semesterRequiringMajor) {
        return { isRequired: false, hasSelectedMajor };
      }

      // If student has selected major, not required
      if (hasSelectedMajor) {
        return { 
          isRequired: false, 
          hasSelectedMajor: true,
          currentSemester: semesterRequiringMajor,
        };
      }

      // Major selection is required
      return {
        isRequired: true,
        hasSelectedMajor: false,
        currentSemester: semesterRequiringMajor,
      };
    },
    enabled: !!user && !!student,
  });
}

/**
 * Course preview item with course details
 */
export interface CoursePreviewItem {
  majorCourse: MajorCourse;
  course: import('@tdc/schemas').Course | null;
}

/**
 * Hook to get major courses with full course details for preview
 * Requirements: 4.3 - Display the list of courses in that major
 */
export function useMajorCoursesWithDetails(majorId: string) {
  return useQuery({
    queryKey: [...selectMajorKeys.majorCourses(majorId), 'details'],
    queryFn: async (): Promise<CoursePreviewItem[]> => {
      if (!majorId) return [];

      // Get major courses
      const majorCoursesResult = await majorCourseService.getMajorCourses(majorId);
      if (!majorCoursesResult.success) {
        throw majorCoursesResult.error;
      }

      // Get course details for each major course
      const { courseRepository } = await import('@tdc/firebase');
      const coursesWithDetails: CoursePreviewItem[] = await Promise.all(
        majorCoursesResult.data.map(async (majorCourse) => {
          const courseResult = await courseRepository.findById(majorCourse.courseId);
          return {
            majorCourse,
            course: courseResult.success ? courseResult.data : null,
          };
        })
      );

      // Sort by order
      return coursesWithDetails.sort((a, b) => a.majorCourse.order - b.majorCourse.order);
    },
    enabled: !!majorId,
  });
}

/**
 * Hook to select a major
 * Requirements: 4.5, 4.6 - Update student's selectedMajorId and majorSelectedAt, prevent changing
 */
export function useSelectMajor() {
  const queryClient = useQueryClient();
  const { data: student } = useMyStudent();

  return useMutation({
    mutationFn: async (majorId: string): Promise<void> => {
      if (!student) {
        throw new AppError(ErrorCode.UNAUTHORIZED, 'Bạn cần đăng nhập để chọn chuyên ngành');
      }

      // Check if student already has a selected major (Requirements: 4.6)
      if (student.selectedMajorId) {
        throw new AppError(
          ErrorCode.MAJOR_ALREADY_SELECTED,
          'Bạn đã chọn chuyên ngành và không thể thay đổi'
        );
      }

      // Verify major exists and is active
      const majorResult = await majorService.getMajor(majorId);
      if (!majorResult.success) {
        throw majorResult.error;
      }

      if (!majorResult.data.isActive) {
        throw new AppError(
          ErrorCode.MAJOR_NOT_FOUND,
          'Chuyên ngành này không còn hoạt động'
        );
      }

      // Update student's selected major (Requirements: 4.5)
      const result = await studentRepository.setSelectedMajor(student.id, majorId);
      if (!result.success) {
        throw result.error;
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['my-courses', 'student'] });
      queryClient.invalidateQueries({ queryKey: selectMajorKeys.majorRequired() });
    },
  });
}
