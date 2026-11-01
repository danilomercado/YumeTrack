import { Component } from "react";

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Error de render:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl text-paper">Algo salió mal</h1>
        <p className="mt-3 text-sm text-zinc-400">
          Ocurrió un error inesperado. Recargá la página para volver a intentar.
        </p>
        <button
          type="button"
          onClick={() => window.location.assign("/")}
          className="mt-6 rounded-md bg-accent px-5 py-3 text-sm font-medium text-paper transition hover:bg-accent-hover"
        >
          Volver al inicio
        </button>
      </main>
    );
  }
}

export default ErrorBoundary;
