import { createContext, useCallback, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateUserState = (userData) => {
    setUser(userData);
    if (userData && userData._id) {
      localStorage.setItem('sayrab_user_id', userData._id);
    } else {
      localStorage.removeItem('sayrab_user_id');
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('sayrab_cart_updated', {
          detail: { userId: userData?._id || 'guest' },
        })
      );
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('sayrab_token');
    if (token) {
      api
        .get('/auth/me')
        .then((res) => updateUserState(res.data))
        .catch(() => {
          localStorage.removeItem('sayrab_token');
          updateUserState(null);
        })
        .finally(() => setLoading(false));
    } else {
      updateUserState(null);
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('sayrab_token', res.data.token);
    updateUserState(res.data.user);
    return res.data;
  };

  const registerDonor = async (data) => {
    const res = await api.post('/auth/register/donor', data);
    localStorage.setItem('sayrab_token', res.data.token);
    updateUserState(res.data.user);
    return res.data;
  };

  const registerFundraiser = async (data) => {
    const res = await api.post('/auth/register/fundraiser', data);
    localStorage.setItem('sayrab_token', res.data.token);
    updateUserState(res.data.user);
    return res.data;
  };

  const registerManufacturer = async (data) => {
    const res = await api.post('/auth/register/manufacturer', data);
    localStorage.setItem('sayrab_token', res.data.token);
    updateUserState(res.data.user);
    return res.data;
  };

  const completeOAuthLogin = useCallback(async (token) => {
    localStorage.setItem('sayrab_token', token);
    const res = await api.get('/auth/me');
    updateUserState(res.data);
    return res.data;
  }, []);

  const logout = () => {
    localStorage.removeItem('sayrab_token');
    updateUserState(null);
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
        completeOAuthLogin,
        logout,
        setUser: updateUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

