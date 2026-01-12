'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Badge, Button, Avatar, Spinner, Select, Modal } from '@tdc/ui';
import { useStudent, useDeactivateStudent, useActivateStudent, useOverrideStudentMajor, useClearStudentMajor } from '@/hooks/useStudents';
import { useSemester } from '@/hooks/useSemesters';
import { useCourses } from '@/hooks/useCourses';
import { useActiveMajors, useMajor } from '@/hooks/useMajors';

/**
 * Student detail page client component
 * Displays student information, current semester, and enrolled courses
 * Requirements: 3.8, 6.1, 6.2
 */
export default function StudentDetailClient(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const { data: student, isLoading, error } = useStudent(studentId);
  const deactivateStudent = useDeactivateStudent();
  const activateStudent = useActivateStudent();
  const overrideMajor = useOverrideStudentMajor();
  const clearMajor = useClearStudentMajor();

  // Major override state
  const [showMajorOverrideModal, setShowMajorOverrideModal] = useState(false);
  const [selectedMajorId, setSelectedMajorId] = useState('');

  // Fetch current semester if student has one
  const { data: currentSemester } = useSemester(student?.currentSemesterId || '');

  // Fetch current major if student has one
  const { data: currentMajor } = useMajor(student?.selectedMajorId || '');

  // Fetch all active majors for override dropdown
  const { data: activeMajors = [] } = useActiveMajors();

  // Fetch all courses to display enrolled courses
  const { data: allCourses = [] } = useCourses();

  // Get enrolled courses
  const enrolledCourses = allCourses.filter((course) =>
    student?.enrolledCourses.includes(course.id)
  );

  const handleDeactivate = async (): Promise<void> => {
    if (!student) return;

    if (confirm('Bạn có chắc muốn vô hiệu hóa học viên này?')) {
      const result = await deactivateStudent.mutateAsync(student.id);
      if (result.success) {
        router.refresh();
      }
    }
  };

  const handleActivate = async (): Promise<void> => {
    if (!student) return;

    if (confirm('Bạn có chắc muốn kích hoạt lại học viên này?')) {
      const result = await activateStudent.mutateAsync(student.id);
      if (result.success) {
        router.refresh();
      }
    }
  };


  /**
   * Handle major override
   * Requirements: 6.2
   */
  const handleMajorOverride = async (): Promise<void> => {
    if (!student || !selectedMajorId) return;

    const result = await overrideMajor.mutateAsync({
      studentId: student.id,
      majorId: selectedMajorId,
    });

    if (result.success) {
      setShowMajorOverrideModal(false);
      setSelectedMajorId('');
    }
  };

  /**
   * Handle clear major selection
   * Requirements: 6.3
   */
  const handleClearMajor = async (): Promise<void> => {
    if (!student) return;

    if (confirm('Bạn có chắc muốn xóa chuyên ngành của học viên này? Học viên sẽ có thể chọn lại chuyên ngành.')) {
      const result = await clearMajor.mutateAsync(student.id);
      if (result.success) {
        router.refresh();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600">Không tìm thấy học viên</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Chi tiết học viên</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Quay lại
          </Button>
          {student.isActive ? (
            <Button
              variant="danger"
              onClick={handleDeactivate}
              loading={deactivateStudent.isPending}
            >
              Vô hiệu hóa
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleActivate}
              loading={activateStudent.isPending}
            >
              Kích hoạt
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <Avatar name={student.displayName} size="xl" />
            <h2 className="mt-4 text-lg font-semibold text-secondary-900">
              {student.displayName}
            </h2>
            <p className="text-sm text-secondary-500">{student.email}</p>
            <Badge
              variant={student.isActive ? 'success' : 'danger'}
              className="mt-3"
            >
              {student.isActive ? 'Hoạt động' : 'Vô hiệu'}
            </Badge>
          </div>
        </Card>

        {/* Information Card */}
        <Card title="Thông tin" className="lg:col-span-2">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-secondary-500">Email</dt>
              <dd className="mt-1 text-secondary-900">{student.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-secondary-500">Họ và tên</dt>
              <dd className="mt-1 text-secondary-900">{student.displayName}</dd>
            </div>
            {student.phone && (
              <div>
                <dt className="text-sm font-medium text-secondary-500">Số điện thoại</dt>
                <dd className="mt-1 text-secondary-900">{student.phone}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-secondary-500">Học kỳ hiện tại</dt>
              <dd className="mt-1 text-secondary-900">
                {currentSemester ? (
                  <Link
                    href={`/semesters/${currentSemester.id}`}
                    className="text-primary-600 hover:underline"
                  >
                    {currentSemester.name}
                  </Link>
                ) : (
                  <span className="text-secondary-400">Chưa xác định</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-secondary-500">Số khóa học đăng ký</dt>
              <dd className="mt-1 text-secondary-900">{student.enrolledCourses.length}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-secondary-500">Ngày đăng ký</dt>
              <dd className="mt-1 text-secondary-900">
                {new Date(student.enrolledAt).toLocaleDateString('vi-VN')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-secondary-500">Ngày tạo</dt>
              <dd className="mt-1 text-secondary-900">
                {new Date(student.createdAt).toLocaleDateString('vi-VN')}
              </dd>
            </div>
          </dl>
        </Card>


        {/* Major Selection Card - Requirements: 6.1, 6.2 */}
        <Card title="Chuyên ngành" className="lg:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              {currentMajor ? (
                <div className="flex items-center gap-3">
                  {currentMajor.color && (
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: currentMajor.color }}
                    />
                  )}
                  <div>
                    <Link
                      href={`/majors/${currentMajor.id}`}
                      className="font-medium text-secondary-900 hover:text-primary-600"
                    >
                      {currentMajor.name}
                    </Link>
                    {student.majorSelectedAt && (
                      <p className="text-sm text-secondary-500">
                        Đã chọn ngày {new Date(student.majorSelectedAt).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <span className="text-secondary-400">Chưa chọn chuyên ngành</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMajorOverrideModal(true)}
              >
                {currentMajor ? 'Đổi chuyên ngành' : 'Gán chuyên ngành'}
              </Button>
              {currentMajor && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleClearMajor}
                  loading={clearMajor.isPending}
                >
                  Xóa chuyên ngành
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Enrolled Courses Card */}
        <Card title="Khóa học đã đăng ký" className="lg:col-span-3">
          {enrolledCourses.length === 0 ? (
            <p className="text-secondary-500">Chưa đăng ký khóa học nào</p>
          ) : (
            <div className="divide-y divide-secondary-200">
              {enrolledCourses.map((course) => {
                const progress = student.progress[course.id] || 0;
                return (
                  <div key={course.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link
                          href={`/courses/${course.id}`}
                          className="font-medium text-secondary-900 hover:text-primary-600"
                        >
                          {course.title}
                        </Link>
                        {course.description && (
                          <p className="mt-1 text-sm text-secondary-500 line-clamp-1">
                            {course.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          progress >= 80 ? 'success' : progress >= 50 ? 'warning' : 'default'
                        }
                      >
                        {progress}%
                      </Badge>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary-200">
                      <div
                        className="h-full rounded-full bg-primary-600 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Progress Card */}
        <Card title="Tiến độ học tập" className="lg:col-span-3">
          {Object.keys(student.progress).length === 0 ? (
            <p className="text-secondary-500">Chưa có dữ liệu tiến độ</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(student.progress).map(([courseId, progress]) => {
                const course = allCourses.find((c) => c.id === courseId);
                return (
                  <div key={courseId}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-secondary-700">
                        {course ? course.title : `Khóa học ${courseId}`}
                      </span>
                      <span className="font-medium text-secondary-900">{progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary-200">
                      <div
                        className="h-full rounded-full bg-primary-600"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Major Override Modal - Requirements: 6.2 */}
      <Modal
        isOpen={showMajorOverrideModal}
        onClose={() => {
          setShowMajorOverrideModal(false);
          setSelectedMajorId('');
        }}
        title={currentMajor ? 'Đổi chuyên ngành' : 'Gán chuyên ngành'}
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary-600">
            {currentMajor
              ? 'Chọn chuyên ngành mới để thay thế chuyên ngành hiện tại của học viên.'
              : 'Chọn chuyên ngành để gán cho học viên.'}
          </p>
          <Select
            label="Chuyên ngành"
            placeholder="Chọn chuyên ngành"
            value={selectedMajorId}
            onChange={(e) => setSelectedMajorId(e.target.value)}
            options={activeMajors.map((major) => ({
              value: major.id,
              label: major.name,
            }))}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowMajorOverrideModal(false);
                setSelectedMajorId('');
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleMajorOverride}
              loading={overrideMajor.isPending}
              disabled={!selectedMajorId}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
