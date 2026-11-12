import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getMyProfileRequest } from "../services/userService";

const AuthContext = createContext();

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

const normalizeUser = (rawUser) => {
  if (!rawUser) return null;

  return {
    id: rawUser.id ?? null,
    userName: rawUser.userName ?? rawUser.username ?? rawUser.name ?? "",
    email: rawUser.email ?? "",
    isAdmin: Boolean(rawUser.isAdmin),
    avatarUrl: rawUser.avatarUrl ?? null,
  };
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && isTokenExpired(savedToken)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoading(false);
      return;
    }

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedUser) {
      try {
        setUser(normalizeUser(JSON.parse(savedUser)));
      } catch {
        localStorage.removeItem("user");
      }
    }

    setIsLoading(false);
  }, []);

  // El login no trae la foto de perfil: se pide una vez por sesión y se
  // guarda junto al usuario para que la barra y el resto la muestren.
  useEffect(() => {
    if (!token) return undefined;

    let cancelled = false;
    getMyProfileRequest()
      .then((profile) => {
        if (cancelled) return;
        setUser((current) =>
          current
            ? { ...current, avatarUrl: profile?.avatarUrl ?? null }
            : current,
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [token]);

  const updateUser = useCallback((patch) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  }, []);

  const login = (authData) => {
    const newToken = authData.token;

    const newUser = normalizeUser(authData);

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
      updateUser,
    };
  }, [token, user, isLoading, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
