import { StudentSidebar } from '@/components/layout/StudentSidebar';
import { StudentHeader } from '@/components/layout/StudentHeader';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="min-h-screen bg-secondary-50">
      <StudentSidebar />
      <div className="ml-64">
        <StudentHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
