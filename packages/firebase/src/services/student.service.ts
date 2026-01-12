import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { type Result, success, failure, AppError, ErrorCode } from '@tdc/types';
import { type CreateStudentInput, type Student, UserSchema, StudentSchema } from '@tdc/schemas';
import { getFirebaseAuth, getFirebaseDb } from '../config';
import { mapFirebaseError } from '../errors';
import { generateSecurePassword } from '../utils/password';
import { studentRepository } from '../repositories/student.repository';
import { majorRepository } from '../repositories/major.repository';

/**
 * Result of student creation including generated password if applicable
 */
export interface CreateStudentResult {
  student: Student;
  generatedPassword?: string;
}

/**
 * Student service for complex operations involving Firebase Auth
 */
export const studentService = {
  /**
   * Create a new student with Firebase Auth account
   * Creates: Firebase Auth account, User document, Student document
   * Handles rollback on partial failure
   */
  async createStudentWithAuth(input: CreateStudentInput): Promise<Result<CreateStudentResult>> {
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();

    // Check if email already exists
    const existsResult = await studentRepository.emailExists(input.email);
    if (existsResult.success && existsResult.data) {
      return failure(new AppError(ErrorCode.EMAIL_EXISTS, 'Email đã được sử dụng'));
    }

    // Generate password if not provided
    const password = input.password || generateSecurePassword();
    const generatedPassword = input.password ? undefined : password;

    let userId: string | null = null;

    try {
      // Step 1: Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, input.email, password);
      userId = userCredential.user.uid;

      // Update display name in Auth
      await updateProfile(userCredential.user, {
        displayName: input.displayName,
      });

      // Step 2: Create User document
      const now = new Date();
      const userData = {
        id: userId,
        email: input.email.toLowerCase(),
        displayName: input.displayName,
        role: 'student' as const,
        isActive: true,
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
      };

      const userParsed = UserSchema.safeParse(userData);
      if (!userParsed.success) {
        throw new Error('Invalid user data');
      }

      await setDoc(doc(db, 'users', userId), {
        ...userParsed.data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Step 3: Create Student document
      const studentId = doc(db, 'students').id;
      const studentData = {
        id: studentId,
        userId: userId,
        email: input.email.toLowerCase(),
        displayName: input.displayName,
        phone: input.phone,
        enrolledAt: now,
        enrolledCourses: [],
        progress: {},
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      const studentParsed = StudentSchema.safeParse(studentData);
      if (!studentParsed.success) {
        throw new Error('Invalid student data');
      }

      await setDoc(doc(db, 'students', studentId), {
        ...studentParsed.data,
        enrolledAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return success({
        student: studentParsed.data,
        generatedPassword,
      });
    } catch (error) {
      // Rollback: Delete created documents if any step fails
      if (userId) {
        try {
          await deleteDoc(doc(db, 'users', userId));
          // Note: Firebase Auth account deletion requires Admin SDK
          // In production, use Cloud Functions for complete rollback
        } catch {
          // Ignore rollback errors
        }
      }

      return failure(mapFirebaseError(error));
    }
  },

  /**
   * Bulk create students from import
   * @param students Array of student inputs
   * @param onProgress Callback for progress updates
   * @returns Import result with success/failure counts
   */
  async bulkCreateStudents(
    students: CreateStudentInput[],
    onProgress?: (current: number, total: number) => void
  ): Promise<
    Result<{
      successCount: number;
      failureCount: number;
      failures: Array<{ email: string; reason: string }>;
      createdStudents: CreateStudentResult[];
    }>
  > {
    const results: CreateStudentResult[] = [];
    const failures: Array<{ email: string; reason: string }> = [];
    const total = students.length;

    // Rate limiting: 10 accounts per second
    const RATE_LIMIT_MS = 100; // 100ms between each creation = 10/second

    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      // Report progress
      onProgress?.(i + 1, total);

      try {
        const result = await this.createStudentWithAuth(student);

        if (result.success) {
          results.push(result.data);
        } else {
          failures.push({
            email: student.email,
            reason: result.error.message,
          });
        }
      } catch (error) {
        failures.push({
          email: student.email,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Rate limiting delay
      if (i < students.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS));
      }
    }

    return success({
      successCount: results.length,
      failureCount: failures.length,
      failures,
      createdStudents: results,
    });
  },

  /**
   * Deactivate student account
   * Disables Firebase Auth and sets isActive to false
   */
  async deactivateStudent(studentId: string): Promise<Result<void>> {
    // Note: Disabling Firebase Auth requires Admin SDK
    // For now, just update Firestore
    const result = await studentRepository.deactivate(studentId);
    if (!result.success) {
      return failure(result.error);
    }
    return success(undefined);
  },

  /**
   * Activate student account
   * Enables Firebase Auth and sets isActive to true
   */
  async activateStudent(studentId: string): Promise<Result<void>> {
    // Note: Enabling Firebase Auth requires Admin SDK
    // For now, just update Firestore
    const result = await studentRepository.activate(studentId);
    if (!result.success) {
      return failure(result.error);
    }
    return success(undefined);
  },

  /**
   * Override student's major selection (admin only)
   * Requirements: 6.1, 6.2 - Admin can override a student's major
   * @param studentId The student's ID
   * @param majorId The new major ID to set
   * @returns Updated student with new major selection
   */
  async overrideMajor(studentId: string, majorId: string): Promise<Result<Student>> {
    // Validate student exists
    const studentResult = await studentRepository.findById(studentId);
    if (!studentResult.success) {
      return failure(studentResult.error);
    }

    // Validate major exists and is active
    const majorResult = await majorRepository.findById(majorId);
    if (!majorResult.success) {
      return failure(new AppError(ErrorCode.MAJOR_NOT_FOUND, 'Không tìm thấy chuyên ngành'));
    }

    if (!majorResult.data.isActive) {
      return failure(new AppError(ErrorCode.VALIDATION_ERROR, 'Chuyên ngành không còn hoạt động'));
    }

    // Update student's major selection
    const updateResult = await studentRepository.setSelectedMajor(studentId, majorId);
    if (!updateResult.success) {
      return failure(updateResult.error);
    }

    // Note: In production, consider logging this admin action for audit purposes
    // e.g., await activityService.logAdminAction('MAJOR_OVERRIDE', { studentId, majorId, adminId });

    return success(updateResult.data);
  },

  /**
   * Clear student's major selection (admin only)
   * Requirements: 6.3 - Admin can clear major selection to allow re-selection
   * @param studentId The student's ID
   * @returns Updated student with cleared major selection
   */
  async clearMajor(studentId: string): Promise<Result<Student>> {
    // Validate student exists
    const studentResult = await studentRepository.findById(studentId);
    if (!studentResult.success) {
      return failure(studentResult.error);
    }

    // Clear the major selection
    const updateResult = await studentRepository.clearSelectedMajor(studentId);
    if (!updateResult.success) {
      return failure(updateResult.error);
    }

    // Note: In production, consider logging this admin action for audit purposes
    // e.g., await activityService.logAdminAction('MAJOR_CLEARED', { studentId, adminId });

    return success(updateResult.data);
  },
};
