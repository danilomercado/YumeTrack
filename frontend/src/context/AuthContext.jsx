import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext();

const normalizeUser = (rawUser) => {
  if (!rawUser) return null;

  return {
    id: rawUser.id ?? null,
    userName: rawUser.userName ?? rawUser.username ?? rawUser.name ?? "",
    email: rawUser.email ?? "",
  };
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(normalizeUser(parsedUser));
    }

    setIsLoading(false);
  }, []);

  const login = (authData) => {
    const newToken = authData.token;

    const newUser = {
      userName: authData.userName,
      email: authData.email,
    };

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => {
    return {
      token,
      user,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      logout,
    };
  }, [token, user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
