import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

const makeToken = (expSecondsFromNow) => {
  const payload = btoa(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expSecondsFromNow }),
  );
  return `header.${payload}.signature`;
};

const renderAuth = () => renderHook(() => useAuth(), { wrapper: AuthProvider });

describe("AuthContext", () => {
  it("arranca sin sesión", async () => {
    const { result } = renderAuth();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("restaura una sesión válida desde localStorage", async () => {
    localStorage.setItem("token", makeToken(3600));
    localStorage.setItem(
      "user",
      JSON.stringify({ userName: "yume", email: "y@y.com" }),
    );

    const { result } = renderAuth();

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(result.current.user.userName).toBe("yume");
  });

  it("descarta un token vencido", async () => {
    localStorage.setItem("token", makeToken(-60));

    const { result } = renderAuth();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("no se rompe con un usuario corrupto en localStorage", async () => {
    localStorage.setItem("token", makeToken(3600));
    localStorage.setItem("user", "{no-es-json");

    const { result } = renderAuth();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it("login y logout actualizan estado y storage", async () => {
    const { result } = renderAuth();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() =>
      result.current.login({
        token: makeToken(3600),
        userName: "yume",
        email: "y@y.com",
      }),
    );

    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem("token")).not.toBeNull();

    act(() => result.current.logout());

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem("token")).toBeNull();
  });
});
