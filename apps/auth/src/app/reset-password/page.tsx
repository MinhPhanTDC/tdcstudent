'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, Input, Button } from '@tdc/ui';
import { getFirebaseAuth } from '@tdc/firebase';
import { confirmPasswordReset } from 'firebase/auth';

export default function ResetPasswordPage(): JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const oobCode = searchParams.get('oobCode');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (!oobCode) {
      setError('Link đặt lại mật khẩu không hợp lệ');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);

    try {
      const auth = getFirebaseAuth();
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch {
      setError('Không thể đặt lại mật khẩu. Link có thể đã hết hạn.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!oobCode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary-50 p-4">
        <Card className="w-full max-w-md text-center">
          <h1 className="text-xl font-semibold text-red-600">Link không hợp lệ</h1>
          <p className="mt-2 text-secondary-600">
            Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
          </p>
          <Button className="mt-4" onClick={() => router.push('/forgot-password')}>
            Yêu cầu link mới
          </Button>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary-50 p-4">
        <Card className="w-full max-w-md text-center">
          <h1 className="text-xl font-semibold text-green-600">Đặt lại mật khẩu thành công!</h1>
          <p className="mt-2 text-secondary-600">
            Bạn sẽ được chuyển đến trang đăng nhập trong giây lát...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary-50 p-4">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-secondary-900">Đặt lại mật khẩu</h1>
          <p className="mt-2 text-secondary-600">Nhập mật khẩu mới của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Mật khẩu mới"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới"
            required
          />

          <Input
            label="Xác nhận mật khẩu"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu"
            required
          />

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <Button type="submit" className="w-full" loading={isLoading}>
            Đặt lại mật khẩu
          </Button>
        </form>
      </Card>
    </div>
  );
}
