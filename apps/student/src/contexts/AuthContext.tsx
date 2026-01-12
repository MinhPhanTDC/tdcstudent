'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from 'react';
import { onAuthChange, getCurrentUser, signOut, exchangeToken, presenceService } from '@tdc/firebase';
import { type User, type UserRole, UserSchema } from '@tdc/schemas';
import { Spinner } from '@tdc/ui';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = 'tdc_auth_user';

interface AuthProviderProps {
  children: ReactNode;
  requiredRole: UserRole;
}

/**
 * Save user to session storage for persistence across page refreshes
 */
function saveUserToSession(user: User): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch (error) {
    console.warn('Failed to save user to session:', error);
  }
}

/**
 * Get user from session storage
 */
function getUserFromSession(): User | null {
  try {
    const data = sessionStorage.getItem(SESSION_KEY);
    if (!data) return null;

    const parsed = UserSchema.safeParse(JSON.parse(data));
    return parsed.success ? parsed.data : null;
  } catch (error) {
    console.warn('Failed to get user from session:', error);
    return null;
  }
}

/**
 * Clear user from session storage
 */
function clearUserSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.warn('Failed to clear user session:', error);
  }
}

/**
 * Check if URL has token in hash fragment (for cross-domain auth)
 */
function hasTokenInUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash;
  return hash.includes('token=');
}

/**
 * Get token from URL hash fragment
 */
function getTokenFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (!hash) return null;
  
  // Parse hash fragment: #token=xxx
  const match = hash.match(/token=([^&]+)/);
  if (!match) return null;
  
  return decodeURIComponent(match[1]);
}

/**
 * Clear token from URL hash
 */
function clearTokenFromUrl(): void {
  if (typeof window === 'undefined') return;
  // Remove hash from URL
  window.history.replaceState({}, '', window.location.pathname + window.location.search);
}

export function AuthProvider({ children, requiredRole }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingToken, setIsProcessingToken] = useState(hasTokenInUrl());
  const tokenProcessed = useRef(false);

  // Handle token from URL (cross-domain auth) - runs first
  useEffect(() => {
    const handleTokenFromUrl = async (): Promise<void> => {
      if (tokenProcessed.current) return;

      const token = getTokenFromUrl();

      if (!token) {
        setIsProcessingToken(false);
        return;
      }

      tokenProcessed.current = true;
      console.log('Processing token from URL hash...');

      // Remove token from URL for security
      clearTokenFromUrl();

      try {
        // Exchange token for user data
        const result = await exchangeToken(token);

        if (result.success) {
          console.log('Token exchange successful:', result.data.email);

          // Check role
          if (result.data.role !== requiredRole) {
            console.log('Wrong role, redirecting...');
            const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000';
            window.location.href = `${authUrl}?error=unauthorized`;
            return;
          }

          // Save to session for persistence
          saveUserToSession(result.data);
          setUser(result.data);
          setIsLoading(false);
          setIsProcessingToken(false);
        } else {
          console.error('Token exchange failed:', result.error);
          setIsProcessingToken(false);
          // Token invalid, redirect to login
          const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000';
          window.location.href = authUrl;
        }
      } catch (error) {
        console.error('Error processing token from URL:', error);
        setIsProcessingToken(false);
        const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000';
        window.location.href = authUrl;
      }
    };

    handleTokenFromUrl();
  }, [requiredRole]);

  // Check session storage on mount (only if no token in URL)
  useEffect(() => {
    if (isProcessingToken) return;

    const sessionUser = getUserFromSession();
    if (sessionUser && sessionUser.role === requiredRole) {
      console.log('Restored user from session:', sessionUser.email);
      setUser(sessionUser);
      setIsLoading(false);
    }
  }, [requiredRole, isProcessingToken]);

  // Listen to Firebase auth state changes (only if no token processing)
  useEffect(() => {
    // Skip if processing token
    if (isProcessingToken) {
      console.log('Skipping onAuthChange - processing token');
      return;
    }

    // Skip if we already have a user
    if (user) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.email || 'null');

      if (firebaseUser) {
        try {
          const result = await getCurrentUser();

          if (result.success && result.data) {
            // Check role
            if (result.data.role !== requiredRole) {
              console.log('Wrong role, redirecting...');
              const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000';
              window.location.href = `${authUrl}?error=unauthorized`;
              return;
            }

            saveUserToSession(result.data);
            setUser(result.data);
          } else {
            console.log('Failed to get user data:', result);
          }
        } catch (error) {
          console.error('Error getting user:', error);
        }
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [requiredRole, user, isProcessingToken]);

  // Redirect to login if not authenticated after loading
  useEffect(() => {
    // Don't redirect if still processing token or loading
    if (isProcessingToken || isLoading) {
      return;
    }

    if (!user) {
      console.log('Not authenticated after loading, redirecting...');
      clearUserSession();
      const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000';
      window.location.href = authUrl;
    }
  }, [isLoading, user, isProcessingToken]);

  // Setup presence tracking when user is authenticated
  // Requirements: 5.2, 5.3
  useEffect(() => {
    if (!user) return;

    // Setup presence for student user
    presenceService.setupPresence(user.id, 'student');

    // Cleanup presence on unmount (logout)
    return () => {
      presenceService.cleanupPresence(user.id);
    };
  }, [user]);

  const logout = async (): Promise<void> => {
    // Cleanup presence before logout
    if (user) {
      await presenceService.cleanupPresence(user.id);
    }
    clearUserSession();
    await signOut();
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000';
    window.location.href = authUrl;
  };

  // Show loading while processing token or checking auth
  if (isLoading || isProcessingToken) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
