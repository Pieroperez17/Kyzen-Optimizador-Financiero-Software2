import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import SessionStorage from '../services/SessionStorage.js';
import { apiClient } from '../services/ApiClient.js';
import { authenticationService } from '../services/AuthenticationService.js';

const AuthenticationContext = createContext(null);

export function AuthenticationProvider({ children }) {
  const [token, setToken] = useState(SessionStorage.getToken());
  const [user, setUser] = useState(SessionStorage.getUser());

  const startSession = useCallback((newToken, newUser) => {
    SessionStorage.saveSession(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    SessionStorage.clear();
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((newUser) => {
    SessionStorage.saveUser(newUser);
    setUser(newUser);
  }, []);

  useEffect(() => {
    apiClient.onUnauthorized(logout);
  }, [logout]);

  useEffect(() => {
    if (!token) return;
    authenticationService
      .getProfile()
      .then((result) => updateUser(result.user))
      .catch(() => {});
  }, [token, updateUser]);

  const login = useCallback(async (email, password) => {
    const result = await authenticationService.login(email, password);
    startSession(result.token, result.user);
    return result;
  }, [startSession]);

  const verifyAccount = useCallback(async (email, code) => {
    const result = await authenticationService.verifyAccount(email, code);
    startSession(result.token, result.user);
    return result;
  }, [startSession]);

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), login, verifyAccount, logout, updateUser }),
    [token, user, login, verifyAccount, logout, updateUser]
  );

  return <AuthenticationContext.Provider value={value}>{children}</AuthenticationContext.Provider>;
}

export function useAuthentication() {
  return useContext(AuthenticationContext);
}
