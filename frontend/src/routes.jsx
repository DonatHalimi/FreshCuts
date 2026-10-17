import { Navigate, createRoutesFromElements, Route } from 'react-router-dom';
import App from './App.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import RoleRoute from './components/layout/RoleRoute.jsx';
import StaffLayout from './components/layout/StaffLayout.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';

import HomePage from './pages/HomePage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import ProvidersPage from './pages/ProvidersPage.jsx';
import ProviderDetailPage from './pages/ProviderDetailPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

import AccountDashboardPage from './pages/account/AccountDashboardPage.jsx';
import BookAppointmentPage from './pages/account/BookAppointmentPage.jsx';
import AppointmentsPage from './pages/account/AppointmentsPage.jsx';
import AppointmentDetailsPage from './pages/account/AppointmentDetailsPage.jsx';
import ServiceHistoryPage from './pages/account/ServiceHistoryPage.jsx';
import NotificationsPage from './pages/account/NotificationsPage.jsx';

import StaffLoginPage from './pages/staff/StaffLoginPage.jsx';
import StaffDashboardPage from './pages/staff/StaffDashboardPage.jsx';
import StaffRosterPage from './pages/staff/StaffRosterPage.jsx';
import StaffSchedulePage from './pages/staff/StaffSchedulePage.jsx';
import StaffProfilePage from './pages/staff/StaffProfilePage.jsx';

import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import AdminServicesPage from './pages/admin/AdminServicesPage.jsx';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage.jsx';
import AdminProvidersPage from './pages/admin/AdminProvidersPage.jsx';
import AdminCreateServicePage from './pages/admin/AdminCreateServicePage.jsx';
import AdminCreateProviderPage from './pages/admin/AdminCreateProviderPage.jsx';
import AdminCreateUserPage from './pages/admin/AdminCreateUserPage.jsx';
import AdminMenusPage from './pages/admin/AdminMenusPage.jsx';

import NotFoundPage from './pages/NotFoundPage.jsx';

export const routes = createRoutesFromElements(
  <Route element={<App />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/services" element={<ServicesPage />} />
    <Route path="/providers" element={<ProvidersPage />} />
    <Route path="/providers/:id" element={<ProviderDetailPage />} />

    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/staff/login" element={<StaffLoginPage />} />
    <Route path="/verify-email" element={<VerifyEmailPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/account" element={<AccountDashboardPage />} />
      <Route path="/account/appointments" element={<AppointmentsPage />} />
      <Route path="/account/appointments/:id" element={<AppointmentDetailsPage />} />
      <Route path="/account/history" element={<ServiceHistoryPage />} />
      <Route path="/account/notifications" element={<NotificationsPage />} />
      <Route path="/book" element={<BookAppointmentPage />} />
    </Route>

    <Route element={<RoleRoute roles={['PROVIDER', 'ADMIN']} />}>
      <Route element={<StaffLayout />}>
        <Route path="/staff" element={<StaffDashboardPage />} />
        <Route path="/staff/roster" element={<StaffRosterPage />} />
        <Route path="/staff/schedule" element={<StaffSchedulePage />} />
        <Route path="/staff/profile" element={<StaffProfilePage />} />
      </Route>
    </Route>

    <Route element={<RoleRoute roles={['ADMIN']} />}>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/menus" element={<AdminMenusPage />} />
        <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/users/new" element={<AdminCreateUserPage />} />
        <Route path="/admin/providers/new" element={<AdminCreateProviderPage />} />
        <Route path="/admin/providers" element={<AdminProvidersPage />} />
        <Route path="/admin/services/new" element={<AdminCreateServicePage />} />
        <Route path="/admin/services" element={<AdminServicesPage />} />
      </Route>
    </Route>

    <Route path="/404" element={<NotFoundPage />} />
    <Route path="*" element={<Navigate to="/404" replace />} />
  </Route>,
);