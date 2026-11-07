import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../features/customer/LandingPage';
import SearchResultsPage from '../features/customer/SearchResultsPage';
import DealDetailPage from '../features/customer/DealDetailPage';
import CheckoutPage from '../features/customer/CheckoutPage';
import CustomerDashboardPage from '../features/customer/CustomerDashboardPage';
import OwnerDashboardPage from '../features/owner/OwnerDashboardPage';
import AdminDashboardPage from '../features/admin/AdminDashboardPage';
import DsaLabPage from '../features/dsa/DsaLabPage';
import AboutPage from '../features/customer/AboutPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/search" element={<SearchResultsPage />} />
      <Route path="/deals/:dealId" element={<DealDetailPage />} />
      <Route path="/checkout/:dealId" element={<CheckoutPage />} />
      <Route path="/trips" element={<CustomerDashboardPage />} />
      <Route path="/partner" element={<OwnerDashboardPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/dsa-lab" element={<DsaLabPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
