import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';

import {verifyCredentials} from '../config/authConfig';

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Keeps authentication as simple in-memory state: the app always starts on
 * the Login screen, and staying logged in only lasts for the current run of
 * the app. That matches a single-operator, offline counter device where the
 * tablet is expected to be unlocked each time the POS app is opened.
 */
export function AuthProvider({children}: {children: React.ReactNode}): React.JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback((username: string, password: string): boolean => {
    const success = verifyCredentials(username, password);
    if (success) {
      setIsAuthenticated(true);
    }
    return success;
  }, []);

  const logout = useCallback(() => setIsAuthenticated(false), []);

  const value = useMemo(() => ({isAuthenticated, login, logout}), [isAuthenticated, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}
