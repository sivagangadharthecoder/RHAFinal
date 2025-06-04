import { createContext, useState, useEffect } from "react";
import axios from "axios";

const AppContent = createContext();

const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_API_URL;
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUserData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/data`, {
        withCredentials: true
      });

      if (res.data.success) {
        setUserData(res.data.userData);
        setIsLoggedin(true);
      } else {
        console.log('Server Response:', res.data.message);
        setIsLoggedin(false);
        setUserData(null);
      }
    } catch (error) {
      console.error("Failed To Fetch User Data:", {
        message: error.message,
        response: error.response?.data
      });
      setIsLoggedin(false);
      setUserData(null);
    }
  };

  const getAuthState = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/is-auth`, {
        withCredentials: true
      });
      if (data.success) {
        await getUserData();
      } else {
        setIsLoggedin(false);
        setUserData(null);
      }
    } catch (error) {
      setIsLoggedin(false);
      setUserData(null);
      console.error("Auth Check Failed:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
    loading
  };

  return (
    <AppContent.Provider value={value}>
      {!loading && props.children}
    </AppContent.Provider>
  );
};

export { AppContent, AppContextProvider };