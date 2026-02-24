import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppProvider } from './context/AppContext';
import { BuyerDashboardPage } from './pages/BuyerDashboardPage';
import { BuyerQuotePage } from './pages/BuyerQuotePage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SearchPage } from './pages/SearchPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { SignupPage } from './pages/SignupPage';
import { VendorDetailPage } from './pages/VendorDetailPage';
import { VendorsPage } from './pages/VendorsPage';

const App = () => {
  return (
    <AppProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/vendor/:id" element={<VendorDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/buyer/quote" element={<BuyerQuotePage />} />
          <Route
            path="/buyer/dashboard"
            element={
              <ProtectedRoute role="buyer">
                <BuyerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute role="seller">
                <SellerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AppProvider>
  );
};

export default App;
