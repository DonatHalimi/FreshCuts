import { createRoutesFromElements, Navigate, Route } from 'react-router-dom';
import App from './App.jsx';
import AppShell from './components/layout/AppShell.jsx';
import GuestRoute from './components/layout/GuestRoute.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import SidebarShell from './components/layout/SidebarShell.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ProviderDetailPage from './pages/ProviderDetailPage.jsx';
import ProvidersPage from './pages/ProvidersPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';

export const routes = createRoutesFromElements(
  <Route element={<App />}>
    <Route element={<AppShell />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/providers" element={<ProvidersPage />} />
      <Route path="/providers/:id" element={<ProviderDetailPage />} />

      <Route element={<GuestRoute />}>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/404" element={<NotFoundPage />} />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route element={<SidebarShell />}>
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/404" replace />} />
  </Route>,
);