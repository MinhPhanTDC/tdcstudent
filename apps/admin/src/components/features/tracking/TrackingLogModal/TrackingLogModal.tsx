'use client';

import { Modal, Button } from '@tdc/ui';
import { TrackingLogList } from '../TrackingLogs';
import { useTrackingLogsByStudentCourse } from '@/hooks/useTrackingLogs';

export interface TrackingLogModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Student ID to fetch logs for */
  studentId: string;
  /** Course ID to fetch logs for */
  courseId: string;
  /** Student name for display */
  studentName: string;
  /** Course name for display */
  courseName: string;
}

/**
 * TrackingLogModal component for displaying tracking history
 * Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 *
 * - Opens when admin clicks "Lịch sử" button (3.2)
 * - Fetches tracking logs using useTrackingLogs hook (3.3)
 * - Displays TrackingLogList with action, values, timestamp, admin (3.4)
 * - Shows empty state when no logs (3.5)
 * - Shows skeleton loading state (3.6)
 * - Closes on backdrop click or close button (3.7)
 */
export function TrackingLogModal({
  isOpen,
  onClose,
  studentId,
  courseId,
  studentName,
  courseName,
}: TrackingLogModalProps): JSX.Element {
  const { data: logs = [], isLoading } = useTrackingLogsByStudentCourse(
    studentId,
    courseId
  );

  const title = `Lịch sử thay đổi - ${studentName}`;
  const subtitle = courseName;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      closeOnBackdrop={true}
      footer={
        <Button variant="ghost" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Course info subtitle */}
        <p className="text-sm text-secondary-600">
          Môn học: <span className="font-medium">{subtitle}</span>
        </p>

        {/* Tracking log list */}
        <TrackingLogList
          logs={logs}
          isLoading={isLoading}
          emptyMessage="Chưa có lịch sử thay đổi"
        />
      </div>
    </Modal>
  );
}
