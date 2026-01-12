'use client';

import Link from 'next/link';
import { Card, Button } from '@tdc/ui';

/**
 * Quick action button component
 */
interface QuickActionButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

function QuickActionButton({ href, icon, label }: QuickActionButtonProps): JSX.Element {
  return (
    <Link href={href} className="block">
      <Button variant="outline" className="w-full justify-start gap-3">
        {icon}
        <span>{label}</span>
      </Button>
    </Link>
  );
}

/**
 * Quick actions component for dashboard
 * Provides shortcuts to common admin actions
 * Requirements: 5.4
 */
export function QuickActions(): JSX.Element {
  return (
    <Card title="Thao tác nhanh">
      <div className="space-y-3">
        {/* Add Student Button */}
        <QuickActionButton
          href="/students/new"
          label="Thêm học viên"
          icon={
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          }
        />

        {/* Add Course Button */}
        <QuickActionButton
          href="/courses/new"
          label="Thêm môn học"
          icon={
            <svg
              className="h-5 w-5 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          }
        />

        {/* Import Excel Button */}
        <QuickActionButton
          href="/students?import=true"
          label="Import từ Excel"
          icon={
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          }
        />
      </div>
    </Card>
  );
}
