import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setCredentials,
  logout as logoutAction,
  useGetUserQuery,
} from "../redux/auth/authSlice"; // Corrected import: useGetUserQuery from authSlice

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Use the getUser query from authSlice
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUserQuery,
  } = useGetUserQuery(undefined, {
    skip: !token,
    pollingInterval: 0,
  });

  useEffect(() => {
    setIsLoading(userLoading);
    setError(userError);

    if (token && userData) {
      setCurrentUser(userData);
    } else if (!token) {
      setCurrentUser(null);
    }
  }, [userData, userLoading, userError, token]);

  const login = useCallback(
    (user, accessToken) => {
      dispatch(setCredentials({ user, token: accessToken }));
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch(logoutAction());
    setCurrentUser(null);
    setError(null);
  }, [dispatch]);

  const refetchUser = useCallback(() => {
    if (token) {
      refetchUserQuery();
    }
  }, [token, refetchUserQuery]);

  const value = {
    currentUser,
    isLoading,
    error,
    login,
    logout,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
