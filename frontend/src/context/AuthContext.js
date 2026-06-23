import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bussify_token');
    const savedUser = localStorage.getItem('bussify_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    const res = await API.post('/auth/login', { email, password, role });
    localStorage.setItem('bussify_token', res.data.token);
    localStorage.setItem('bussify_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password, phone) => {
    const res = await API.post('/auth/register', { name, email, password, phone });
    localStorage.setItem('bussify_token', res.data.token);
    localStorage.setItem('bussify_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('bussify_token');
    localStorage.removeItem('bussify_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
