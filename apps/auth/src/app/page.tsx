import { LoginForm } from '@/components/LoginForm';
import { HandbookViewer } from '@/components/HandbookViewer';

/**
 * Login page with handbook flipbook viewer
 * Requirements: 8.1
 */
export default function LoginPage(): JSX.Element {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 max-w-5xl w-full">
        {/* Handbook Flipbook - hidden on small screens, shown on lg+ */}
        <div className="hidden lg:block">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-secondary-700">
              Sổ tay học viên
            </h2>
            <p className="text-sm text-secondary-500">
              Tìm hiểu về The Design Council
            </p>
          </div>
          <HandbookViewer width={350} height={495} />
        </div>

        {/* Login Form */}
        <div className="w-full max-w-md">
          <LoginForm />
        </div>

        {/* Handbook Flipbook - shown on small screens below login form */}
        <div className="lg:hidden mt-8 w-full flex flex-col items-center">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-secondary-700">
              Sổ tay học viên
            </h2>
            <p className="text-sm text-secondary-500">
              Tìm hiểu về The Design Council
            </p>
          </div>
          <HandbookViewer width={300} height={424} />
        </div>
      </div>
    </main>
  );
}
