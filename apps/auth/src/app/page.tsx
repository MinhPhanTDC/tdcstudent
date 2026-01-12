import { LoginForm } from '@/components/LoginForm';
import { LoginBackground } from '@/components/LoginBackground';
import Image from 'next/image';

/**
 * Login page with split layout - form on left, image on right
 */
export default function LoginPage(): JSX.Element {
  return (
    <main className="flex min-h-screen">
      {/* Left side - Login Form */}
      <div className="flex w-full flex-col justify-between px-8 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/logo.png"
              alt="TDC Logo"
              width={80}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </div>

          {/* Welcome text */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1e3a5f]">
              Welcome back 👋
            </h1>
            <p className="mt-3 text-secondary-600">
              Hôm nay là một ngày đầy năng lượng sáng tạo.
              <br />
              Chúc bạn học tập đạt hiệu quả cao!
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Support text */}
          <p className="mt-8 text-center text-sm text-secondary-500">
            Liên hệ Fanpage TDC nếu bạn cần hỗ trợ nhé!
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs font-medium tracking-wider text-secondary-400">
            TDC PORTFOLIO PROGRAM
          </p>
        </div>
      </div>

      {/* Right side - Background Image */}
      <div className="hidden lg:block lg:w-1/2">
        <LoginBackground />
      </div>
    </main>
  );
}
