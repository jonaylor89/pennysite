import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getAccessToken, setAccessToken, clearAccessToken } from "./token-store";

const BASE_URL = import.meta.env.VITE_API_URL || "";

export interface User {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string) => Promise<{ error?: string; message?: string }>;
  logout: () => Promise<void>;
  setPassword: (password: string) => Promise<{ error?: string }>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, try to restore session from refresh token cookie
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAccessToken(data.accessToken);
        setUser(data.user);
      } else {
        clearAccessToken();
        setUser(null);
      }
    } catch {
      clearAccessToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ error?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || "Login failed" };
      }
      setAccessToken(data.accessToken);
      setUser(data.user);
      return {};
    } catch {
      return { error: "Network error" };
    }
  };

  const signup = async (
    email: string,
    password: string,
  ): Promise<{ error?: string; message?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || "Signup failed" };
      }
      setAccessToken(data.accessToken);
      setUser(data.user);
      return {};
    } catch {
      return { error: "Network error" };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Continue with local cleanup even if server call fails
    }
    clearAccessToken();
    setUser(null);
  };

  const setPasswordFn = async (
    password: string,
  ): Promise<{ error?: string }> => {
    try {
      const token = getAccessToken();
      const res = await fetch(`${BASE_URL}/api/auth/set-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        return { error: data.error || "Failed to set password" };
      }
      // Refresh user to clear needs_password flag
      await refreshUser();
      return {};
    } catch {
      return { error: "Network error" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        setPassword: setPasswordFn,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
