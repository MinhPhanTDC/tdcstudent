'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userRepository, studentRepository, studentService } from '@tdc/firebase';
import type { User, Student, CreateUserInput, CreateStudentInput, PaginationInput } from '@tdc/schemas';
import type { Result } from '@tdc/types';

// Query keys factory
export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (filters?: StudentFilters, pagination?: PaginationInput) =>
    [...studentKeys.lists(), filters, pagination] as const,
  paginated: (filters?: StudentFilters, pagination?: PaginationInput) =>
    [...studentKeys.all, 'paginated', filters, pagination] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
  search: (query: string) => [...studentKeys.all, 'search', query] as const,
};

export interface StudentFilters {
  search?: string;
  isActive?: boolean;
  currentSemesterId?: string;
  limit?: number;
}

export interface StudentWithUser extends Student {
  user: User;
}

export interface PaginatedStudents {
  items: StudentWithUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Hook to fetch all students with their user data
 */
export function useStudents(filters?: StudentFilters) {
  return useQuery({
    queryKey: studentKeys.list(filters),
    queryFn: async (): Promise<StudentWithUser[]> => {
      // Get all users with student role
      const usersResult = await userRepository.findByRole('student');
      if (!usersResult.success) {
        throw usersResult.error;
      }

      // Get all students
      const studentsResult = await studentRepository.findAll([]);
      if (!studentsResult.success) {
        throw studentsResult.error;
      }

      // Merge user and student data
      const studentsWithUsers: StudentWithUser[] = [];

      for (const student of studentsResult.data) {
        const user = usersResult.data.find((u) => u.id === student.userId);
        if (user) {
          // Apply filters
          if (filters?.isActive !== undefined && student.isActive !== filters.isActive) {
            continue;
          }
          if (filters?.currentSemesterId && student.currentSemesterId !== filters.currentSemesterId) {
            continue;
          }
          if (
            filters?.search &&
            !student.displayName.toLowerCase().includes(filters.search.toLowerCase()) &&
            !student.email.toLowerCase().includes(filters.search.toLowerCase())
          ) {
            continue;
          }

          studentsWithUsers.push({ ...student, user });
        }
      }

      // Apply limit if specified
      if (filters?.limit && studentsWithUsers.length > filters.limit) {
        return studentsWithUsers.slice(0, filters.limit);
      }

      return studentsWithUsers;
    },
  });
}

/**
 * Hook to fetch students with pagination support
 * Requirements: 3.1, 3.9
 */
export function useStudentsPaginated(filters?: StudentFilters, pagination?: PaginationInput) {
  return useQuery({
    queryKey: studentKeys.paginated(filters, pagination),
    queryFn: async (): Promise<PaginatedStudents> => {
      // Get paginated students from repository
      const result = await studentRepository.findWithFilters(
        {
          isActive: filters?.isActive,
          currentSemesterId: filters?.currentSemesterId,
        },
        pagination
      );

      if (!result.success) {
        throw result.error;
      }

      // Get user data for each student
      const usersResult = await userRepository.findByRole('student');
      if (!usersResult.success) {
        throw usersResult.error;
      }

      // Merge user data
      const studentsWithUsers: StudentWithUser[] = [];
      for (const student of result.data.items) {
        const user = usersResult.data.find((u) => u.id === student.userId);
        if (user) {
          // Apply search filter if specified
          if (
            filters?.search &&
            !student.displayName.toLowerCase().includes(filters.search.toLowerCase()) &&
            !student.email.toLowerCase().includes(filters.search.toLowerCase())
          ) {
            continue;
          }
          studentsWithUsers.push({ ...student, user });
        }
      }

      return {
        items: studentsWithUsers,
        pagination: result.data.pagination,
      };
    },
  });
}

/**
 * Hook to search students by name or email
 * Requirements: 3.1, 3.10
 */
export function useSearchStudents(searchQuery: string) {
  return useQuery({
    queryKey: studentKeys.search(searchQuery),
    queryFn: async (): Promise<StudentWithUser[]> => {
      if (!searchQuery || searchQuery.length < 2) {
        return [];
      }

      const result = await studentRepository.search(searchQuery);
      if (!result.success) {
        throw result.error;
      }

      // Get user data for each student
      const usersResult = await userRepository.findByRole('student');
      if (!usersResult.success) {
        throw usersResult.error;
      }

      const studentsWithUsers: StudentWithUser[] = [];
      for (const student of result.data) {
        const user = usersResult.data.find((u) => u.id === student.userId);
        if (user) {
          studentsWithUsers.push({ ...student, user });
        }
      }

      return studentsWithUsers;
    },
    enabled: searchQuery.length >= 2,
  });
}

/**
 * Hook to fetch a single student by ID
 */
export function useStudent(studentId: string) {
  return useQuery({
    queryKey: studentKeys.detail(studentId),
    queryFn: async (): Promise<StudentWithUser | null> => {
      const studentResult = await studentRepository.findById(studentId);
      if (!studentResult.success) {
        throw studentResult.error;
      }

      const userResult = await userRepository.findById(studentResult.data.userId);
      if (!userResult.success) {
        throw userResult.error;
      }

      return { ...studentResult.data, user: userResult.data };
    },
    enabled: !!studentId,
  });
}

/**
 * Hook to create a new student
 */
export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: CreateUserInput & { enrolledCourses?: string[] }
    ): Promise<Result<StudentWithUser>> => {
      // Create user first
      const userResult = await userRepository.create({
        ...input,
        role: 'student',
        isActive: true,
        lastLoginAt: null,
      });

      if (!userResult.success) {
        return userResult;
      }

      // Create student record with all required fields
      const studentResult = await studentRepository.create({
        userId: userResult.data.id,
        email: input.email,
        displayName: input.displayName,
        enrolledCourses: input.enrolledCourses || [],
        progress: {},
        isActive: true,
        enrolledAt: new Date(),
      });

      if (!studentResult.success) {
        return studentResult;
      }

      return {
        success: true,
        data: { ...studentResult.data, user: userResult.data },
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
}

/**
 * Hook to update a student
 */
export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      userId,
      userData,
      studentData,
    }: {
      studentId: string;
      userId: string;
      userData?: Partial<User>;
      studentData?: Partial<Student>;
    }): Promise<Result<void>> => {
      if (userData) {
        const userResult = await userRepository.update(userId, userData);
        if (!userResult.success) {
          return userResult;
        }
      }

      if (studentData) {
        const studentResult = await studentRepository.update(studentId, studentData);
        if (!studentResult.success) {
          return studentResult;
        }
      }

      return { success: true, data: undefined };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(variables.studentId) });
    },
  });
}

/**
 * Hook to deactivate a student
 * Requirements: 3.6
 */
export function useDeactivateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: string): Promise<Result<void>> => {
      return studentService.deactivateStudent(studentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
}

/**
 * Hook to activate a student
 * Requirements: 3.7
 */
export function useActivateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: string): Promise<Result<void>> => {
      return studentService.activateStudent(studentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
}

/**
 * Hook to toggle student active status
 * Requirements: 3.6, 3.7
 */
export function useToggleStudentActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: string): Promise<Result<Student>> => {
      return studentRepository.toggleActive(studentId);
    },
    onSuccess: (_, studentId) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(studentId) });
    },
  });
}

/**
 * Hook to create a student with Firebase Auth
 * Requirements: 3.2, 3.3, 3.4
 */
export function useCreateStudentWithAuth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateStudentInput) => {
      return studentService.createStudentWithAuth(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
}

/**
 * Hook to override a student's major selection (admin only)
 * Requirements: 6.1, 6.2
 */
export function useOverrideStudentMajor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      majorId,
    }: {
      studentId: string;
      majorId: string;
    }): Promise<Result<Student>> => {
      return studentService.overrideMajor(studentId, majorId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(variables.studentId) });
    },
  });
}

/**
 * Hook to clear a student's major selection (admin only)
 * Requirements: 6.3
 */
export function useClearStudentMajor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: string): Promise<Result<Student>> => {
      return studentService.clearMajor(studentId);
    },
    onSuccess: (_, studentId) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(studentId) });
    },
  });
}
