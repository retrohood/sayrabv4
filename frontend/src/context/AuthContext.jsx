import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sayrab_token');
    if (token) {
      api
        .get('/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('sayrab_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('sayrab_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const registerDonor = async (data) => {
    const res = await api.post('/auth/register/donor', data);
    localStorage.setItem('sayrab_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const registerFundraiser = async (data) => {
    const res = await api.post('/auth/register/fundraiser', data);
    localStorage.setItem('sayrab_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('sayrab_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, registerDonor, registerFundraiser, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
