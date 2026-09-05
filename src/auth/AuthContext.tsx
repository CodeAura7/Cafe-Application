import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';

import {hasAccount, verifyLogin} from '../services/LocalAuthService';
import {initializeDatabase} from '../database';

interface AuthContextValue {
  isAuthenticated: boolean;
  isReady: boolean;
  hasAccount: boolean;
  refreshAccount: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Authentication remains local to this device. Credentials and recovery
 * answers are salted PBKDF2 hashes held in SQLite, never in source code.
 */
export function AuthProvider({children}: {children: React.ReactNode}): React.JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [accountExists, setAccountExists] = useState(false);

  const refreshAccount = useCallback(async () => {
    await initializeDatabase();
    setAccountExists(await hasAccount());
    setIsReady(true);
  }, []);

  useEffect(() => { void refreshAccount(); }, [refreshAccount]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const success = await verifyLogin(username, password);
    if (success) {
      setIsAuthenticated(true);
    }
    return success;
  }, []);

  const logout = useCallback(() => setIsAuthenticated(false), []);

  const value = useMemo(() => ({isAuthenticated, isReady, hasAccount: accountExists, refreshAccount, login, logout}), [isAuthenticated, isReady, accountExists, refreshAccount, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}
