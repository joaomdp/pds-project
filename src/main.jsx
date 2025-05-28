import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import "./index.css";
import LoginPage from "./pages/LoginPage.jsx";
import ClientesPage from "./pages/ClientesPage.jsx";
import MaquinasPage from "./pages/MaquinasPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import LandingPage from "./pages/LeadingPage.jsx";
import LocacoesPage from "./pages/LocacoesPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clientes"
            element={
              <ProtectedRoute>
                <ClientesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maquinas"
            element={
              <ProtectedRoute>
                <MaquinasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/locacoes"
            element={
              <ProtectedRoute>
                <LocacoesPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
