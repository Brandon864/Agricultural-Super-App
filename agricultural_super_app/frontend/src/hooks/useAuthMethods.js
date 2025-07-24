// src/hooks/useAuthMethods.js (Simplified - if you still want a custom hook for navigation)
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import useAuth

const useAuthMethods = () => {
  const navigate = useNavigate();
  const { login, logout } = useAuth(); 
 
  const handleLoginAndNavigate = async (credentials) => {
    const result = await login(credentials); 
    if (result.success) {
      navigate("/dashboard"); 
    }
    return result; 
  };

  
  const handleLogoutAndNavigate = () => {
    logout(); 
    navigate("/login"); // Navigate to login after logout
  };

  return { login: handleLoginAndNavigate, logout: handleLogoutAndNavigate };
};

export default useAuthMethods;
