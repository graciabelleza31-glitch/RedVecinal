import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../api.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'redvecinal_token';
const USER_KEY = 'redvecinal_user';

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);

  const saveSession = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Valida el token guardado al cargar la app
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }
    apiRequest('/auth/me', { token: stored })
      .then((data) => {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        setUser(data.user);
      })
      .catch((err) => {
        // Solo cerramos sesión si el token es inválido; no si el servidor está caído
        if (err.status === 401) logout();
      })
      .finally(() => setLoading(false));
  }, [logout]);

  const login = async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    saveSession(data.token, data.user);
    return data.user;
  };

  const register = async (formData) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: formData,
    });
    saveSession(data.token, data.user);
    return data.user;
  };

  const updateUser = useCallback((newUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const value = {
    token,
    user,
    loading,
    isAuthenticated: Boolean(token),
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
