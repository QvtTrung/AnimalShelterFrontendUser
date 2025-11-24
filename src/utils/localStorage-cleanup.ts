/**
 * Cleanup utility to remove old/duplicate localStorage keys
 * Run this on app initialization to ensure clean state
 */

export const cleanupLocalStorage = () => {
  // List of keys that should NOT be in localStorage (handled by Zustand persist)
  const keysToRemove = [
    'appUser',           // Old key - now in auth-storage
    'directusUser',      // Old key - not needed
    'user',              // Old key - now in auth-storage
  ];

  keysToRemove.forEach((key) => {
    if (localStorage.getItem(key)) {
      console.log(`[Cleanup] Removing old localStorage key: ${key}`);
      localStorage.removeItem(key);
    }
  });

  // Verify that required keys exist
  const hasToken = localStorage.getItem('token');
  const hasAuthStorage = localStorage.getItem('auth-storage');

  if (!hasToken || !hasAuthStorage) {
    console.log('[Cleanup] Missing authentication data, clearing all auth keys');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth-storage');
  }

  console.log('[Cleanup] localStorage cleanup complete');
};

/**
 * Get the current authenticated user from the auth store
 * This is the single source of truth for user data
 */
export const getCurrentUser = () => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (!authStorage) return null;

    const parsed = JSON.parse(authStorage);
    return parsed?.state?.user || null;
  } catch (error) {
    console.error('[getCurrentUser] Error parsing auth storage:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  const user = getCurrentUser();
  return !!(token && user);
};
