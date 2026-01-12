'use client';

import { Card } from '@tdc/ui';
import { StudentHandbook } from '@/components/features/handbook';

/**
 * Handbook page - displays the student handbook in flipbook format
 * Requirements: 6.1
 */
export default function HandbookPage(): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Handbook</h1>
        <p className="mt-1 text-secondary-500">
          Tài liệu hướng dẫn dành cho học viên The Design Council.
        </p>
      </div>

      {/* Handbook viewer */}
      <Card className="p-6">
        <StudentHandbook />
      </Card>
    </div>
  );
}
