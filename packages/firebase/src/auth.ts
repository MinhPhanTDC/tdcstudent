import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signInWithCustomToken,
  type User as FirebaseUser,
  type Unsubscribe,
} from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { type Result, success, failure, AppError, ErrorCode } from '@tdc/types';
import { UserSchema, type User, type LoginCredentials } from '@tdc/schemas';
import { getFirebaseAuth, getFirebaseDb, getFirebaseConfig, getFirebaseRtdb } from './config';
import { mapFirebaseError } from './errors';
import { activityService } from './services/activity.service';

/**
 * Sign in with email and password
 */
export async function signIn(credentials: LoginCredentials): Promise<Result<User>> {
  try {
    const { email, password } = credentials;
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();
    const credential = await signInWithEmailAndPassword(auth, email, password);

    console.log('signIn - Firebase auth successful, uid:', credential.user.uid);
    console.log('signIn - currentUser after signIn:', auth.currentUser?.email);

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', credential.user.uid));

    if (!userDoc.exists()) {
      // User authenticated but no profile in Firestore
      // This means admin needs to create user document
      console.error('User profile not found in Firestore for UID:', credential.user.uid);
      return failure(new AppError(ErrorCode.USER_NOT_FOUND, 'Hồ sơ người dùng chưa được tạo trong hệ thống'));
    }

    // Validate user data
    const userData = userDoc.data();
    const parsed = UserSchema.safeParse({
      id: userDoc.id,
      ...userData,
    });

    if (!parsed.success) {
      console.error('Invalid user data:', parsed.error.flatten());
      console.error('Raw user data:', userData);
      return failure(new AppError(ErrorCode.VALIDATION_ERROR, 'Dữ liệu người dùng không hợp lệ'));
    }

    // Update last login timestamp (don't fail if this fails)
    try {
      await updateDoc(doc(db, 'users', credential.user.uid), {
        lastLoginAt: serverTimestamp(),
      });
    } catch (updateError) {
      console.warn('Failed to update lastLoginAt:', updateError);
    }

    // Log login activity (Requirements: 6.4)
    // Use timeout to prevent blocking login if RTDB is not configured
    try {
      // Check if RTDB is configured before attempting to log
      const rtdb = getFirebaseRtdb();
      if (rtdb) {
        const activityPromise = activityService.logLogin({
          userId: parsed.data.id,
          userName: parsed.data.displayName,
        });
        
        // Don't wait more than 3 seconds for activity logging
        await Promise.race([
          activityPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Activity logging timeout')), 3000)
          ),
        ]);
      } else {
        console.log('signIn - RTDB not configured, skipping activity logging');
      }
    } catch (activityError) {
      // Don't fail the login if activity logging fails
      console.warn('Failed to log login activity:', activityError);
    }

    console.log('signIn - returning user:', parsed.data.email, 'role:', parsed.data.role);
    return success(parsed.data);
  } catch (error) {
    console.error('Sign in error:', error);
    return failure(mapFirebaseError(error));
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<Result<void>> {
  try {
    await firebaseSignOut(getFirebaseAuth());
    return success(undefined);
  } catch (error) {
    return failure(mapFirebaseError(error));
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<Result<void>> {
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email);
    return success(undefined);
  } catch (error) {
    return failure(mapFirebaseError(error));
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void): Unsubscribe {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

/**
 * Get current Firebase user
 */
export function getCurrentFirebaseUser(): FirebaseUser | null {
  return getFirebaseAuth().currentUser;
}

/**
 * Get current user profile from Firestore
 */
export async function getCurrentUser(): Promise<Result<User | null>> {
  try {
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      return success(null);
    }

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (!userDoc.exists()) {
      return success(null);
    }

    const parsed = UserSchema.safeParse({
      id: userDoc.id,
      ...userDoc.data(),
    });

    if (!parsed.success) {
      return failure(mapFirebaseError(new Error('Invalid user data')));
    }

    return success(parsed.data);
  } catch (error) {
    return failure(mapFirebaseError(error));
  }
}

/**
 * Get ID token for current user
 * Used for cross-domain authentication
 */
export async function getIdToken(): Promise<Result<string>> {
  try {
    const auth = getFirebaseAuth();
    const firebaseUser = auth.currentUser;

    console.log('getIdToken - currentUser:', firebaseUser?.email || 'null');

    if (!firebaseUser) {
      return failure(new AppError(ErrorCode.UNAUTHORIZED, 'No user logged in'));
    }

    const token = await firebaseUser.getIdToken();
    console.log('getIdToken - got token, length:', token.length);
    return success(token);
  } catch (error) {
    console.error('getIdToken error:', error);
    return failure(mapFirebaseError(error));
  }
}

/**
 * Verify ID token and get user data
 * Uses Firebase REST API to verify token
 * This is used for cross-domain authentication
 */
export async function verifyIdToken(idToken: string): Promise<Result<{ uid: string; email: string }>> {
  try {
    // Get API key from Firebase config
    const config = getFirebaseConfig();
    const apiKey = config.apiKey;
    
    if (!apiKey) {
      return failure(new AppError(ErrorCode.UNKNOWN_ERROR, 'Firebase API key not configured'));
    }

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!response.ok) {
      return failure(new AppError(ErrorCode.UNAUTHORIZED, 'Invalid token'));
    }

    const data = await response.json();
    const user = data.users?.[0];

    if (!user) {
      return failure(new AppError(ErrorCode.USER_NOT_FOUND, 'User not found'));
    }

    return success({ uid: user.localId, email: user.email });
  } catch (error) {
    return failure(mapFirebaseError(error));
  }
}

/**
 * Exchange ID token for a new session
 * This verifies the token and attempts to establish a Firebase Auth session
 */
export async function exchangeToken(idToken: string): Promise<Result<User>> {
  try {
    // Verify the token using REST API
    const verifyResult = await verifyIdToken(idToken);
    if (!verifyResult.success) {
      return failure(verifyResult.error);
    }

    const { uid, email } = verifyResult.data;
    const db = getFirebaseDb();
    const auth = getFirebaseAuth();
    
    // Wait for Firebase Auth to restore session if available
    // This handles the case where the user is already signed in
    await new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, () => {
        unsubscribe();
        resolve();
      });
      // Timeout after 2 seconds
      setTimeout(() => {
        unsubscribe();
        resolve();
      }, 2000);
    });
    
    // Check if we now have an authenticated user
    if (auth.currentUser && auth.currentUser.uid === uid) {
      // We have a matching session, get full user data
      const userDoc = await getDoc(doc(db, 'users', uid));

      if (userDoc.exists()) {
        const parsed = UserSchema.safeParse({
          id: userDoc.id,
          ...userDoc.data(),
        });

        if (parsed.success) {
          return success(parsed.data);
        }
      }
    }
    
    // No Firebase Auth session, return minimal user info from token
    // The role will need to be fetched separately or stored in token claims
    console.log('exchangeToken - no Firebase Auth session, fetching via REST API');
    
    // Try to get role from Firestore using REST API
    // The ID token will authenticate the request
    const config = getFirebaseConfig();
    const projectId = config.projectId;
    
    console.log('exchangeToken - fetching user from Firestore REST API, projectId:', projectId);
    
    try {
      // Use Firestore REST API with the ID token for authentication
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`;
      console.log('exchangeToken - Firestore URL:', firestoreUrl);
      
      const firestoreResponse = await fetch(firestoreUrl, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      
      console.log('exchangeToken - Firestore response status:', firestoreResponse.status);
      
      if (firestoreResponse.ok) {
        const firestoreData = await firestoreResponse.json();
        console.log('exchangeToken - Firestore data:', JSON.stringify(firestoreData, null, 2));
        const fields = firestoreData.fields;
        
        if (fields) {
          const userData: User = {
            id: uid,
            email: fields.email?.stringValue || email,
            displayName: fields.displayName?.stringValue || email.split('@')[0],
            role: (fields.role?.stringValue as 'admin' | 'student') || 'student',
            isActive: fields.isActive?.booleanValue ?? true,
            createdAt: fields.createdAt?.timestampValue ? new Date(fields.createdAt.timestampValue) : new Date(),
            updatedAt: fields.updatedAt?.timestampValue ? new Date(fields.updatedAt.timestampValue) : new Date(),
            lastLoginAt: fields.lastLoginAt?.timestampValue ? new Date(fields.lastLoginAt.timestampValue) : new Date(),
          };
          
          return success(userData);
        }
      } else {
        const errorText = await firestoreResponse.text();
        console.error('exchangeToken - Firestore error:', firestoreResponse.status, errorText);
      }
    } catch (restError) {
      console.warn('Failed to fetch user via REST API:', restError);
    }
    
    // Fallback: return minimal user with unknown role
    // This will likely cause a role check failure, which is expected
    const minimalUser: User = {
      id: uid,
      email: email,
      displayName: email.split('@')[0],
      role: 'student',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
    };

    return success(minimalUser);
  } catch (error) {
    return failure(mapFirebaseError(error));
  }
}

/**
 * Sign in with custom token (for cross-domain auth)
 * Note: This requires Firebase Admin SDK to generate custom tokens
 */
export async function signInWithToken(customToken: string): Promise<Result<User>> {
  try {
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();
    
    const credential = await signInWithCustomToken(auth, customToken);
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', credential.user.uid));

    if (!userDoc.exists()) {
      return failure(new AppError(ErrorCode.USER_NOT_FOUND, 'User profile not found'));
    }

    const parsed = UserSchema.safeParse({
      id: userDoc.id,
      ...userDoc.data(),
    });

    if (!parsed.success) {
      return failure(new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid user data'));
    }

    return success(parsed.data);
  } catch (error) {
    return failure(mapFirebaseError(error));
  }
}
