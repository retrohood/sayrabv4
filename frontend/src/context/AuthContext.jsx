import { createContext, useCallback, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const defaultAuthContext = {
  user: null,
  loading: true,
  login: async () => {},
  registerDonor: async () => {},
  registerFundraiser: async () => {},
  registerManufacturer: async () => {},
  registerAdmin: async () => {},
  completeOAuthLogin: async () => {},
  logout: () => {},
  setUser: () => {},
};

const AuthContext = createContext(defaultAuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sayrab_token');
    if (token) {
      api
        .get('/auth/me')
        .then((res) => {
          setUser(res.data);
          if (res.data?._id) {
            localStorage.setItem('sayrab_current_user_id', res.data._id);
          }
        })
        .catch(() => {
          localStorage.removeItem('sayrab_token');
          localStorage.removeItem('sayrab_current_user_id');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('sayrab_token', res.data.token);
    if (res.data.user?._id) {
      localStorage.setItem('sayrab_current_user_id', res.data.user._id);
    }
    setUser(res.data.user);
    return res.data;
  };

  const registerDonor = async (data) => {
    const res = await api.post('/auth/register/donor', data);
    localStorage.setItem('sayrab_token', res.data.token);
    if (res.data.user?._id) {
      localStorage.setItem('sayrab_current_user_id', res.data.user._id);
    }
    setUser(res.data.user);
    return res.data;
  };

  const registerFundraiser = async (data) => {
    const res = await api.post('/auth/register/fundraiser', data);
    localStorage.setItem('sayrab_token', res.data.token);
    if (res.data.user?._id) {
      localStorage.setItem('sayrab_current_user_id', res.data.user._id);
    }
    setUser(res.data.user);
    return res.data;
  };

  const registerManufacturer = async (data) => {
    const res = await api.post('/auth/register/manufacturer', data);
    localStorage.setItem('sayrab_token', res.data.token);
    if (res.data.user?._id) {
      localStorage.setItem('sayrab_current_user_id', res.data.user._id);
    }
    setUser(res.data.user);
    return res.data;
  };

  const registerAdmin = async (data) => {
    const res = await api.post('/auth/register/admin', data);
    localStorage.setItem('sayrab_token', res.data.token);
    if (res.data.user?._id) {
      localStorage.setItem('sayrab_current_user_id', res.data.user._id);
    }
    setUser(res.data.user);
    return res.data;
  };

  const completeOAuthLogin = useCallback(async (token) => {
    localStorage.setItem('sayrab_token', token);
    const res = await api.get('/auth/me');
    if (res.data?._id) {
      localStorage.setItem('sayrab_current_user_id', res.data._id);
    }
    setUser(res.data);
    return res.data;
  }, []);

  const logout = () => {
    localStorage.removeItem('sayrab_token');
    localStorage.removeItem('sayrab_current_user_id');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        registerDonor,
        registerFundraiser,
        registerManufacturer,
        registerAdmin,
        completeOAuthLogin,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext) || defaultAuthContext;
