'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { semesterRepository } from '@tdc/firebase';
import { useSemesterCourses } from '@/hooks/useSemesterCourses';
import { useMyStudent } from '@/hooks/useMyCourses';
import { CourseList } from '@/components/features/course';
import { FormError, Skeleton, Card, Button } from '@tdc/ui';
import { 
  checkMajorSelectionRequired, 
  MAJOR_SELECTION_PATH,
  type MajorGuardResult 
} from '@/lib/majorGuard';

/**
 * Semester detail page client component - displays courses within a semester
 * Requirements: 2.1, 2.6, 3.4, 4.1
 */
export default function SemesterDetailClient(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const semesterId = params.id as string;

  // Fetch student data for major selection check
  const { data: student, isLoading: studentLoading } = useMyStudent();

  // Fetch semester details
  const {
    data: semester,
    isLoading: semesterLoading,
    error: semesterError,
  } = useQuery({
    queryKey: ['semester', semesterId],
    queryFn: async () => {
      const result = await semesterRepository.findById(semesterId);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    enabled: !!semesterId,
  });

  // Fetch courses for this semester
  const {
    data: courses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useSemesterCourses(semesterId);


  // Check major selection requirement
  // Requirements: 3.4 - Block access if major selection required but not selected
  const majorGuardResult: MajorGuardResult = checkMajorSelectionRequired(student, semester);

  // Redirect to major selection page if needed
  // Requirements: 4.1 - Redirect to major selection page
  useEffect(() => {
    if (!studentLoading && !semesterLoading && !majorGuardResult.allowed) {
      router.push(MAJOR_SELECTION_PATH);
    }
  }, [studentLoading, semesterLoading, majorGuardResult.allowed, router]);

  const isLoading = semesterLoading || coursesLoading || studentLoading;
  const error = semesterError || coursesError;

  if (isLoading) {
    return <SemesterDetailSkeleton />;
  }

  // Show blocking message if major selection is required
  // This is a fallback in case redirect doesn't happen immediately
  if (!majorGuardResult.allowed) {
    return (
      <div className="space-y-6">
        <BackButton />
        <MajorSelectionRequired reason={majorGuardResult.reason} />
      </div>
    );
  }

  if (error || !semester) {
    return (
      <div className="space-y-6">
        <BackButton />
        <FormError message="Không thể tải thông tin học kỳ. Vui lòng thử lại sau." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <BackButton />

      {/* Semester header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">{semester.name}</h1>
        {semester.description && (
          <p className="mt-1 text-sm text-secondary-500">{semester.description}</p>
        )}
        <p className="mt-2 text-sm text-secondary-500">
          {courses?.length ?? 0} môn học trong học kỳ này
        </p>
      </div>

      {/* Course list */}
      <CourseList courses={courses ?? []} isLoading={false} />
    </div>
  );
}

/**
 * Component shown when major selection is required
 * Requirements: 3.4, 4.1
 */
function MajorSelectionRequired({ reason }: { reason?: string }): JSX.Element {
  const router = useRouter();

  return (
    <Card className="text-center py-8">
      <div className="space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-primary-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-secondary-900">
            Yêu cầu chọn chuyên ngành
          </h2>
          <p className="mt-2 text-sm text-secondary-500">
            {reason || 'Bạn cần chọn chuyên ngành trước khi truy cập học kỳ này'}
          </p>
        </div>
        <Button
          onClick={() => router.push(MAJOR_SELECTION_PATH)}
          className="mt-4"
        >
          Chọn chuyên ngành
        </Button>
      </div>
    </Card>
  );
}


/**
 * Back button component
 */
function BackButton(): JSX.Element {
  return (
    <Link
      href="/semesters"
      className="inline-flex items-center gap-2 text-sm text-secondary-500 hover:text-secondary-700 transition-colors"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Quay lại danh sách học kỳ
    </Link>
  );
}

/**
 * Skeleton loading state for semester detail
 */
function SemesterDetailSkeleton(): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Back button skeleton */}
      <Skeleton height={20} width={180} rounded="sm" />

      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton height={32} width={250} rounded="sm" />
        <Skeleton height={16} width={350} rounded="sm" />
        <Skeleton height={14} width={150} rounded="sm" />
      </div>

      {/* Course list skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton rounded="full" className="h-10 w-10" />
                  <div className="space-y-2">
                    <Skeleton height={20} width={200} rounded="sm" />
                    <Skeleton height={14} width={150} rounded="sm" />
                  </div>
                </div>
                <Skeleton height={20} width={20} rounded="sm" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Skeleton height={12} width={50} rounded="sm" />
                  <Skeleton height={12} width={30} rounded="sm" />
                </div>
                <Skeleton height={8} width="100%" rounded="full" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton height={16} width={60} rounded="sm" />
                  <Skeleton height={16} width={60} rounded="sm" />
                </div>
                <Skeleton height={20} width={80} rounded="full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
