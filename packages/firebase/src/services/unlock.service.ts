import { type Result, success, failure, AppError, ErrorCode } from '@tdc/types';
import {
  type StudentProgress,
  type Course,
  type Semester,
} from '@tdc/schemas';
import { progressRepository } from '../repositories/progress.repository';
import { courseRepository } from '../repositories/course.repository';
import { semesterRepository } from '../repositories/semester.repository';
import { studentRepository } from '../repositories/student.repository';
import { trackingLogRepository } from '../repositories/tracking-log.repository';
import { notificationRepository } from '../repositories/notification.repository';

/**
 * Unlock result containing information about what was unlocked
 */
export interface UnlockResult {
  unlockedCourse?: {
    courseId: string;
    courseName: string;
  };
  unlockedSemester?: {
    semesterId: string;
    semesterName: string;
  };
  notifications: string[];
}

/**
 * Find the next course in a semester by order
 * 
 * @param courses - List of courses in the semester
 * @param currentCourseOrder - Order of the current course
 * @returns The next course or null if none exists
 */
export function findNextCourseInSemester(
  courses: Course[],
  currentCourseOrder: number
): Course | null {
  // Sort courses by order
  const sortedCourses = [...courses].sort((a, b) => a.order - b.order);
  
  // Find the next course with order > currentCourseOrder
  const nextCourse = sortedCourses.find((c) => c.order > currentCourseOrder);
  
  return nextCourse || null;
}

/**
 * Check if all courses in a semester are completed
 * 
 * @param progressList - List of progress records for the student
 * @param courses - List of courses in the semester
 * @returns True if all courses are completed
 */
export function areAllCoursesCompleted(
  progressList: StudentProgress[],
  courses: Course[]
): boolean {
  if (courses.length === 0) {
    return false;
  }

  // Check each course has a completed progress record
  for (const course of courses) {
    const progress = progressList.find((p) => p.courseId === course.id);
    if (!progress || progress.status !== 'completed') {
      return false;
    }
  }

  return true;
}

/**
 * Find the next semester by order
 * 
 * @param semesters - List of all semesters
 * @param currentSemesterOrder - Order of the current semester
 * @returns The next semester or null if none exists
 */
export function findNextSemester(
  semesters: Semester[],
  currentSemesterOrder: number
): Semester | null {
  // Sort semesters by order
  const sortedSemesters = [...semesters].sort((a, b) => a.order - b.order);
  
  // Find the next semester with order > currentSemesterOrder
  const nextSemester = sortedSemesters.find((s) => s.order > currentSemesterOrder);
  
  return nextSemester || null;
}

/**
 * Unlock service for managing course and semester unlocking
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
export const unlockService = {
  /**
   * Unlock the next course after a student completes a course
   * Requirements: 5.1, 5.2
   * 
   * @param studentId - The student's ID
   * @param completedCourseId - The ID of the completed course
   * @param adminId - The admin who approved the completion
   * @returns UnlockResult with information about what was unlocked
   */
  async unlockNextCourse(
    studentId: string,
    completedCourseId: string,
    adminId: string
  ): Promise<Result<UnlockResult>> {
    const result: UnlockResult = {
      notifications: [],
    };

    // Get the completed course
    const courseResult = await courseRepository.findById(completedCourseId);
    if (!courseResult.success) {
      return failure(new AppError(ErrorCode.COURSE_NOT_FOUND, 'Không tìm thấy môn học'));
    }
    const completedCourse = courseResult.data;

    // Get all courses in the same semester
    const semesterCoursesResult = await courseRepository.findBySemester(completedCourse.semesterId);
    if (!semesterCoursesResult.success) {
      return failure(semesterCoursesResult.error);
    }
    const semesterCourses = semesterCoursesResult.data;

    // Find the next course in the semester
    const nextCourse = findNextCourseInSemester(semesterCourses, completedCourse.order);

    if (nextCourse) {
      // Unlock the next course
      const unlockResult = await this.unlockCourseForStudent(
        studentId,
        nextCourse.id,
        adminId
      );

      if (unlockResult.success) {
        result.unlockedCourse = {
          courseId: nextCourse.id,
          courseName: nextCourse.title,
        };

        // Create notification for course unlock
        const notificationResult = await notificationRepository.createNotification({
          userId: studentId,
          type: 'course_unlocked',
          title: 'Môn học mới đã mở khóa',
          message: `Chúc mừng! Bạn đã mở khóa môn học "${nextCourse.title}".`,
          metadata: {
            courseId: nextCourse.id,
            courseName: nextCourse.title,
          },
        });

        if (notificationResult.success) {
          result.notifications.push(notificationResult.data.id);
        }
      }
    } else {
      // No next course in semester - check if semester is complete
      const semesterCompleteResult = await this.checkAndUnlockNextSemester(
        studentId,
        completedCourse.semesterId,
        adminId
      );

      if (semesterCompleteResult.success && semesterCompleteResult.data.unlockedSemester) {
        result.unlockedSemester = semesterCompleteResult.data.unlockedSemester;
        result.notifications.push(...semesterCompleteResult.data.notifications);
      }
    }

    return success(result);
  },

  /**
   * Check if a semester is complete and unlock the next semester if so
   * Requirements: 5.3, 5.4, 5.5
   * 
   * @param studentId - The student's ID
   * @param semesterId - The semester to check
   * @param adminId - The admin who approved the completion
   * @returns UnlockResult with information about what was unlocked
   */
  async checkAndUnlockNextSemester(
    studentId: string,
    semesterId: string,
    adminId: string
  ): Promise<Result<UnlockResult>> {
    const result: UnlockResult = {
      notifications: [],
    };

    // Get all courses in the semester
    const coursesResult = await courseRepository.findBySemester(semesterId);
    if (!coursesResult.success) {
      return failure(coursesResult.error);
    }
    const courses = coursesResult.data;

    // Get all progress records for the student
    const progressResult = await progressRepository.findByStudentId(studentId);
    if (!progressResult.success) {
      return failure(progressResult.error);
    }
    const progressList = progressResult.data;

    // Check if all courses are completed
    if (!areAllCoursesCompleted(progressList, courses)) {
      // Not all courses completed, nothing to unlock
      return success(result);
    }

    // Get current semester
    const currentSemesterResult = await semesterRepository.findById(semesterId);
    if (!currentSemesterResult.success) {
      return failure(new AppError(ErrorCode.SEMESTER_NOT_FOUND, 'Không tìm thấy học kỳ'));
    }
    const currentSemester = currentSemesterResult.data;

    // Get all semesters
    const allSemestersResult = await semesterRepository.findAllSorted();
    if (!allSemestersResult.success) {
      return failure(allSemestersResult.error);
    }
    const allSemesters = allSemestersResult.data;

    // Find the next semester
    const nextSemester = findNextSemester(allSemesters, currentSemester.order);

    if (!nextSemester) {
      // No next semester - student has completed all semesters
      return success(result);
    }

    // Update student's current semester
    const updateStudentResult = await studentRepository.updateCurrentSemester(
      studentId,
      nextSemester.id
    );

    if (!updateStudentResult.success) {
      return failure(updateStudentResult.error);
    }

    // Get first course in the new semester
    const nextSemesterCoursesResult = await courseRepository.findBySemester(nextSemester.id);
    if (!nextSemesterCoursesResult.success) {
      return failure(nextSemesterCoursesResult.error);
    }
    const nextSemesterCourses = nextSemesterCoursesResult.data;

    // Sort by order and get the first course
    const sortedCourses = [...nextSemesterCourses].sort((a, b) => a.order - b.order);
    const firstCourse = sortedCourses[0];

    if (firstCourse) {
      // Unlock the first course of the new semester
      const unlockResult = await this.unlockCourseForStudent(
        studentId,
        firstCourse.id,
        adminId
      );

      if (unlockResult.success) {
        result.unlockedCourse = {
          courseId: firstCourse.id,
          courseName: firstCourse.title,
        };
      }
    }

    result.unlockedSemester = {
      semesterId: nextSemester.id,
      semesterName: nextSemester.name,
    };

    // Create notification for semester unlock
    const semesterNotificationResult = await notificationRepository.createNotification({
      userId: studentId,
      type: 'semester_unlocked',
      title: 'Học kỳ mới đã mở khóa',
      message: `Chúc mừng! Bạn đã hoàn thành học kỳ và mở khóa "${nextSemester.name}".`,
      metadata: {
        semesterId: nextSemester.id,
        semesterName: nextSemester.name,
      },
    });

    if (semesterNotificationResult.success) {
      result.notifications.push(semesterNotificationResult.data.id);
    }

    // Create tracking log for semester unlock
    await trackingLogRepository.createLog({
      studentId,
      courseId: firstCourse?.id || '',
      action: 'unlock_semester',
      previousValue: currentSemester.id,
      newValue: nextSemester.id,
      performedBy: adminId,
      performedAt: new Date(),
    });

    return success(result);
  },

  /**
   * Unlock a specific course for a student
   * Creates or updates the progress record to not_started status
   * 
   * @param studentId - The student's ID
   * @param courseId - The course to unlock
   * @param adminId - The admin performing the unlock
   * @returns The updated progress record
   */
  async unlockCourseForStudent(
    studentId: string,
    courseId: string,
    adminId: string
  ): Promise<Result<StudentProgress>> {
    // Check if progress record exists
    const existingResult = await progressRepository.findByStudentAndCourse(
      studentId,
      courseId
    );

    if (!existingResult.success) {
      return failure(existingResult.error);
    }

    if (existingResult.data) {
      // Progress exists - update status to not_started if locked
      if (existingResult.data.status === 'locked') {
        const updateResult = await progressRepository.updateStatus(
          existingResult.data.id,
          'not_started'
        );

        if (updateResult.success) {
          // Create tracking log
          await trackingLogRepository.createLog({
            studentId,
            courseId,
            action: 'unlock_course',
            previousValue: 'locked',
            newValue: 'not_started',
            performedBy: adminId,
            performedAt: new Date(),
          });
        }

        return updateResult;
      }

      // Already unlocked
      return success(existingResult.data);
    }

    // Create new progress record with not_started status
    const createResult = await progressRepository.create({
      studentId,
      courseId,
      completedSessions: 0,
      projectsSubmitted: 0,
      projectLinks: [],
      status: 'not_started',
      completedAt: null,
      approvedAt: null,
    });

    if (createResult.success) {
      // Create tracking log
      await trackingLogRepository.createLog({
        studentId,
        courseId,
        action: 'unlock_course',
        newValue: 'not_started',
        performedBy: adminId,
        performedAt: new Date(),
      });
    }

    return createResult;
  },
};
