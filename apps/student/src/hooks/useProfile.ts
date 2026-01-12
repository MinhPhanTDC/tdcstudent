'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getFirebaseAuth } from '@tdc/firebase';
import type { Result } from '@tdc/types';
import { success, failure, AppError, ErrorCode } from '@tdc/types';

interface UpdateProfileInput {
  displayName?: string;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput): Promise<Result<void>> => {
      try {
        const auth = getFirebaseAuth();
        const user = auth.currentUser;
        if (!user) {
          return failure(new AppError(ErrorCode.UNAUTHORIZED, 'Chưa đăng nhập'));
        }

        // Use Firebase updateProfile from the auth module
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(user, {
          displayName: input.displayName,
        });

        return success(undefined);
      } catch {
        return failure(new AppError(ErrorCode.UNKNOWN_ERROR, 'Không thể cập nhật hồ sơ'));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
