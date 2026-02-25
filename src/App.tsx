import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppProvider } from './context/AppContext';
import { BuyerDashboardPage } from './pages/BuyerDashboardPage';
import { BuyerQuotePage } from './pages/BuyerQuotePage';
import { ContactPage } from './pages/ContactPage';
import { EditorialPolicyPage } from './pages/EditorialPolicyPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { MasterDashboardPage } from './pages/MasterDashboardPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { SearchPage } from './pages/SearchPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { SignupPage } from './pages/SignupPage';
import { TermsPage } from './pages/TermsPage';
import { VendorDetailPage } from './pages/VendorDetailPage';
import { VendorsPage } from './pages/VendorsPage';
import { AboutPage } from './pages/AboutPage';

const App = () => {
  return (
    <AppProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/editorial-policy" element={<EditorialPolicyPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/vendor/:id" element={<VendorDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/buyer/quote" element={<BuyerQuotePage />} />
          <Route
            path="/buyer/dashboard"
            element={
              <ProtectedRoute roles={['buyer', 'seller']}>
                <BuyerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute roles={['seller']}>
                <SellerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/master/dashboard"
            element={
              <ProtectedRoute roles={['admin']}>
                <MasterDashboardPage />
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
