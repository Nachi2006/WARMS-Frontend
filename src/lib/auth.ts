import { jwtDecode } from "jwt-decode";
import type { UserRole } from "@/types";

const TOKEN_KEY = "warms_token";

interface JwtPayload {
  sub: string;
  role: UserRole;
  exp: number;
}

export function saveToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getTokenPayload(): JwtPayload | null {
  const token = getToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (decoded.exp * 1000 < Date.now()) {
      clearToken();
      return null;
    }
    return decoded;
  } catch {
    clearToken();
    return null;
  }
}

export function getRole(): UserRole | null {
  const payload = getTokenPayload();
  return payload?.role ?? null;
}

export function isAuthenticated(): boolean {
  return getTokenPayload() !== null;
}

export function getUserEmail(): string | null {
  const payload = getTokenPayload();
  return payload?.sub ?? null;
}
