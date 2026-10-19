import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthenticationProvider } from './context/AuthenticationContext.jsx';
import { FinancialProvider } from './context/FinancialContext.jsx';
import { ProtectedRoute, PublicRoute } from './components/RouteGuards.jsx';
import Layout from './components/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import VerifyAccountPage from './pages/VerifyAccountPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import MovementsPage from './pages/MovementsPage.jsx';
import GoalsPage from './pages/GoalsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthenticationProvider>
        <FinancialProvider>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />
              <Route path="/verificar" element={<VerifyAccountPage />} />
              <Route path="/recuperar" element={<ForgotPasswordPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/movimientos" element={<MovementsPage />} />
                <Route path="/metas" element={<GoalsPage />} />
                <Route path="/perfil" element={<ProfilePage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </FinancialProvider>
      </AuthenticationProvider>
    </BrowserRouter>
  );
}
