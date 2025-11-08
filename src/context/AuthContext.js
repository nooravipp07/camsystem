import React, { createContext, useState, useEffect } from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';
import axios from 'axios';
import { BASE_URL } from '../config/Config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [splashLoading, setSplashLoading] = useState(true); // default true

  // Login
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/authentication/login`, {
        email,
        password,
      });
      const { data } = res.data;
      setUserInfo(data.user);
      setToken(data.token);

      await EncryptedStorage.setItem('userInfo', JSON.stringify(data.user));
      await EncryptedStorage.setItem('token', data.token);
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'Login Gagal';
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/authentication/logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await EncryptedStorage.removeItem('userInfo');
      await EncryptedStorage.removeItem('token');
      setUserInfo(null);
      setToken(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cek token saat app start
  const checkAuthStatus = async () => {
    try {
      const storedToken = await EncryptedStorage.getItem('token');
      const storedUserInfo = await EncryptedStorage.getItem('userInfo');

      if (storedToken && storedUserInfo) {
        setToken(storedToken);
        setUserInfo(JSON.parse(storedUserInfo));
      } else {
        console.log('Tidak ada token, user harus login');
      }
    } catch (error) {
      console.error('Gagal memuat data user', error);
    } finally {
      setSplashLoading(false); // selesai loading splash
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userInfo,
        token,
        isLoading,
        splashLoading,
        login,
        logout,
        setToken,
        setUserInfo,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
