import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || null);

  const login = (newToken) => {
    localStorage.setItem('admin_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);