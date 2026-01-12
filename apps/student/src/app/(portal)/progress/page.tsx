import { Card, EmptyState } from '@tdc/ui';

export default function ProgressPage(): JSX.Element {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary-900">Tiến độ học tập</h1>

      <Card>
        <EmptyState
          icon={
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
          title="Chưa có dữ liệu"
          description="Bắt đầu học để theo dõi tiến độ của bạn"
        />
      </Card>
    </div>
  );
}
