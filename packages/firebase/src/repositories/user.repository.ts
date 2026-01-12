import { where } from 'firebase/firestore';
import { type Result } from '@tdc/types';
import { UserSchema, type User, type UserRole } from '@tdc/schemas';
import { BaseRepository } from './base.repository';

/**
 * User repository for Firestore operations
 */
class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users', UserSchema);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<Result<User | null>> {
    const result = await this.findAll([where('email', '==', email)]);

    if (!result.success) {
      return result;
    }

    return { success: true, data: result.data[0] || null };
  }

  /**
   * Find users by role
   */
  async findByRole(role: UserRole): Promise<Result<User[]>> {
    return this.findAll([where('role', '==', role)]);
  }

  /**
   * Find active users
   */
  async findActive(): Promise<Result<User[]>> {
    return this.findAll([where('isActive', '==', true)]);
  }
}

// Singleton export
export const userRepository = new UserRepository();
