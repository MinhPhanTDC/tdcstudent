import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { UserDebugInfo } from '@/components/debug';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="min-h-screen bg-secondary-50">
      <AdminSidebar />
      <div className="ml-64">
        <AdminHeader />
        <main className="p-6">{children}</main>
      </div>
      <UserDebugInfo />
    </div>
  );
}
