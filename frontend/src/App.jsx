import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { ToastProvider } from "./context/ToastContext";
import AppRouter from "./router/AppRouter";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <ChatProvider>
          <ToastProvider>
            <AppRouter />
          </ToastProvider>
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
