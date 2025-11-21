import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuthStore } from "./store/auth.store";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { PetsPage } from "./pages/PetsPage";
import { PetDetailPage } from "./pages/PetDetailPage";
import { ReportPage } from "./pages/ReportPage";
import { ReportsPage } from "./pages/ReportsListPage";
import { ReportDetailPage } from "./pages/ReportDetailPage";
import { RescuesPage } from "./pages/RescuesPage";
import { RescueDetailPage } from "./pages/RescueDetailPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfilePage } from "./pages/ProfilePage";

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />

          {/* Auth routes - redirect if already logged in */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginPage />
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <RegisterPage />
              )
            }
          />

          {/* Public pages - browsing */}
          <Route path="/pets" element={<PetsPage />} />
          <Route path="/pets/:id" element={<PetDetailPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/:id" element={<ReportDetailPage />} />
          <Route path="/rescues" element={<RescuesPage />} />
          <Route path="/rescues/:id" element={<RescueDetailPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
