/* eslint-disable react-refresh/only-export-components */

import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

axios.defaults.withCredentials = true;

export const AppContent = createContext(null);

export const AppContextProvider = ({ children }) => {

  axios.defaults.withCredentials = true;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const getUserData = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/user/data`
      );

      if (data.success) {
        setUserData(data.userData);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, [backendUrl]);

  const getAuthState = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/auth/is-auth`
      );

      if (data.success) {
        setIsLoggedIn(true);
        await getUserData();
      }
    } catch {
      // user not authenticated → silent fail
    }
  }, [backendUrl, getUserData]);

  useEffect(() => {
    getAuthState();
  }, [getAuthState]);

  const value = {
    backendUrl,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    getUserData,
  };

  return (
    <AppContent.Provider value={value}>
      {children}
    </AppContent.Provider>
  );
};
