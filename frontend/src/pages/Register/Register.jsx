import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { registerRequest } from "../../services/authService";
import AuthShell from "../../components/AuthShell/AuthShell";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const Register = () => {
  useDocumentTitle("Crear cuenta");
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrorMessage("");
    setUsernameSuggestions([]);
  };

  const handleSuggestionClick = (suggestion) => {
    setForm((prev) => ({
      ...prev,
      userName: suggestion,
    }));

    setErrorMessage("");
    setUsernameSuggestions([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading) return;

    setErrorMessage("");
    setUsernameSuggestions([]);

    if (!form.userName.trim() || !form.email.trim() || !form.password.trim()) {
      setErrorMessage("Completá usuario, correo y contraseña.");
      return;
    }

    try {
      setIsLoading(true);

      const data = await registerRequest({
        userName: form.userName.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      login(data);
      navigate("/search");
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        error?.message ||
        "No se pudo crear la cuenta.";

      setErrorMessage(backendMessage);

      const suggestions = error?.response?.data?.suggestions;

      if (Array.isArray(suggestions)) {
        setUsernameSuggestions(suggestions);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Registrate y empezá a trackear títulos."
      tagline="ようこそ！"
      altText="¿Ya tenés cuenta?"
      altLabel="Ingresar"
      altTo="/login"
      characters={["/characters/gon.webp", "/characters/narutito.webp"]}
    >
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            className="mb-2 block text-sm text-zinc-300"
            htmlFor="userName"
          >
            Usuario
          </label>
          <input
            id="userName"
            name="userName"
            type="text"
            value={form.userName}
            onChange={handleChange}
            placeholder="nombre"
            className="w-full rounded-xl bg-ground px-4 py-3 text-paper transition"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-zinc-300" htmlFor="email">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="email@gmail.com"
            className="w-full rounded-xl bg-ground px-4 py-3 text-paper transition"
          />
        </div>
        <div>
          <label
            className="mb-2 block text-sm text-zinc-300"
            htmlFor="password"
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="********"
            className="w-full rounded-xl bg-ground px-4 py-3 text-paper transition"
          />
        </div>
        {errorMessage && (
          <div className="rounded-xl   bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <p>{errorMessage}</p>

            {usernameSuggestions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {usernameSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="rounded-full bg-panel-2 px-3 py-1 text-[13px] text-paper transition hover:bg-white/10"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-paper transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Creando cuenta..." : "Registrarme"}
        </button>
      </form>
    </AuthShell>
  );
};

export default Register;
