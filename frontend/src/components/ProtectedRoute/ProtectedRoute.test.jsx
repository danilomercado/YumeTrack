import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "../../context/AuthContext";

const renderRoute = () =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/privada"]}>
        <Routes>
          <Route path="/login" element={<p>login</p>} />
          <Route
            path="/privada"
            element={
              <ProtectedRoute>
                <p>contenido privado</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );

describe("ProtectedRoute", () => {
  it("redirige al login si no hay sesión", async () => {
    renderRoute();

    expect(await screen.findByText("login")).toBeInTheDocument();
  });

  it("muestra el contenido con sesión válida", async () => {
    const payload = btoa(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
    );
    localStorage.setItem("token", `h.${payload}.s`);

    renderRoute();

    expect(await screen.findByText("contenido privado")).toBeInTheDocument();
  });
});
