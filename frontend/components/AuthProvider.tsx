"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import * as api from "@/lib/client-api";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  loading: boolean; // true 7ta n3rfo wach user m-connecti
  login: (identifier: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Mlli page kat7el: ila kayn token, kanjibo user
  useEffect(() => {
    const request = api.getToken() ? api.getMe() : Promise.resolve(null);
    request
      .then(setUser)
      .catch(() => api.setToken(null)) // token sala wla ghalat
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const { access_token } = await api.login(identifier, password);
    api.setToken(access_token);
    setUser(await api.getMe());
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    const { access_token } = await api.loginWithGoogle(credential);
    api.setToken(access_token);
    setUser(await api.getMe());
  }, []);

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      await api.register(email, username, password);
      await login(email, password);
    },
    [login],
  );

  const logout = useCallback(() => {
    api.setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithGoogle, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
