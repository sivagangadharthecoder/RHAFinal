import { createContext, useState, useEffect } from "react";
import axios from "axios";

const AppContent = createContext();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

const AppContextProvider = (props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data
  const getUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/user/data');
      
      if (response.data.success) {
        setUserData(response.data.userData);
        setIsLoggedIn(true);
      } else {
        handleLogout();
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch user data');
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const getAuthState = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/auth/is-auth');
      
      if (response.data.success) {
        await getUserData();
      } else {
        handleLogout();
      }
    } catch (error) {
      handleApiError(error, 'Authentication check failed');
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    
  };

  const handleApiError = (error, defaultMessage) => {
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        defaultMessage;
    
    setError(errorMessage);
    console.error('API Error:', {
      message: errorMessage,
      response: error.response?.data,
      stack: error.stack
    });
  };

  // Initialize auth state
  useEffect(() => {
    getAuthState();
    
    const responseInterceptor = api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const value = {
    api, 
    isLoggedIn,
    userData,
    loading,
    error,
    setError,
    getUserData,
    handleLogout,
    refreshAuth: getAuthState 
  };

  return (
    <AppContent.Provider value={value}>
      {!loading && props.children}
    </AppContent.Provider>
  );
};

export { AppContent, AppContextProvider };
