import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const useAuthMethods = () => {
  const navigate = useNavigate();
  const { login: contextLogin, logout: contextLogout } = useAuth();

  const login = (jwtToken, userData) => {
    contextLogin(jwtToken, userData);
    navigate("/dashboard");
  };

  const logout = () => {
    contextLogout();
    navigate("/login");
  };

  return { login, logout };
};

export default useAuthMethods;
