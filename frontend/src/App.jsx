import { lazy, Suspense, useState, useEffect } from "react";
import { Navigate, Route, Routes, useLocation, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { useReports } from "./context/ReportsContext.jsx";
import LoadingIndicator from "./components/common/LoadingIndicator.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import "./utils/clearLocalStorage.js"; // Initialize localStorage clearing utility
import WorkspaceLayout from "./layouts/WorkspaceLayout.jsx";
import { Outlet } from "react-router-dom";

// Public pages
import PublicHomePage from "./pages/public/Home.jsx";
import AboutPage from "./pages/public/About.jsx";
import ContactPage from "./pages/public/Contact.jsx";
import PricingPage from "./pages/public/Pricing.jsx";
import ProductPage from "./pages/public/Product.jsx";
import ProductDiscoverPage from "./pages/public/ProductDiscover.jsx";
import ProductValidatePage from "./pages/public/ProductValidate.jsx";
import ProductNetworkPage from "./pages/public/ProductNetwork.jsx";
import PrivacyPage from "./pages/public/Privacy.jsx";
import TermsPage from "./pages/public/Terms.jsx";
import ResourceTemplatesPage from "./pages/public/ResourceTemplates.jsx";
import BlogArticlePage from "./pages/public/BlogArticle.jsx";

// Discovery pages
import HomePage from "./pages/discovery/Home.jsx";
import ProfileReport from "./pages/discovery/ProfileReport.jsx";
import RecommendationsReport from "./pages/discovery/RecommendationsReport.jsx";
import RecommendationDetail from "./pages/discovery/RecommendationDetail.jsx";

// Validation pages
import IdeaValidator from "./pages/validation/IdeaValidator.jsx";
import ValidationResult from "./pages/validation/ValidationResult.jsx";

// Resources pages
import ResourcesPage from "./pages/resources/Resources.jsx";
import AdvisorResourcesPage from "./pages/resources/AdvisorResources.jsx";
import HowAdvisorThinksPage from "./pages/resources/HowAdvisorThinks.jsx";
import BlogPage from "./pages/resources/Blog.jsx";

// Help pages
import ValidateIdeaHelp from "./pages/help/ValidateIdeaHelp.jsx";
import DiscoverHelp from "./pages/help/DiscoverHelp.jsx";
import FounderNetworkHelp from "./pages/help/FounderNetworkHelp.jsx";
import WorkspaceHelp from "./pages/help/WorkspaceHelp.jsx";
import FrameworksHelp from "./pages/help/FrameworksHelp.jsx";
import AccountHelp from "./pages/help/AccountHelp.jsx";

// Dashboard pages
import DashboardPage from "./pages/dashboard/Dashboard.jsx";
import CompareSessionsPage from "./pages/dashboard/CompareSessions.jsx";
import RunHistoryPage from "./pages/dashboard/RunHistoryPage.jsx";
import WorkspaceFrameworksPage from "./pages/dashboard/WorkspaceFrameworksPage.jsx";
import FounderConnectPage from "./pages/founder/FounderConnect.jsx";
import FounderPsychologyPage from "./pages/founder/FounderPsychology.jsx";
import PsycheQuestionnairePage from "./pages/psyche/PsycheQuestionnaire.jsx";
import PsycheProfilePage from "./pages/psyche/PsycheProfile.jsx";
import PsycheCompletePage from "./pages/psyche/PsycheComplete.jsx";

// Lazy load heavy pages
const AccountPage = lazy(() => import("./pages/dashboard/Account.jsx"));

// Auth pages
import RegisterPage from "./pages/auth/Register.jsx";
import LoginPage from "./pages/auth/Login.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPassword.jsx";
import ResetPasswordPage from "./pages/auth/ResetPassword.jsx";

// Admin pages - lazy load
const AdminPage = lazy(() => import("./pages/admin/Admin.jsx"));
const AdminForgotPasswordPage = lazy(() => import("./pages/admin/AdminForgotPassword.jsx"));
const AdminResetPasswordPage = lazy(() => import("./pages/admin/AdminResetPassword.jsx"));


export default function App() {
 const { reports, loading } = useReports();
 const { isAuthenticated } = useAuth();
 const { pathname } = useLocation();
 const hasReports = Boolean(
 reports?.profile_analysis || reports?.personalized_recommendations
 );

 // Check if current route is an admin route
 const isAdminRoute = pathname.startsWith("/admin");

 return (
 <div className={isAdminRoute ? "min-h-screen bg-app" : "min-h-screen"}>
 {/* Layout is now owned by pages via Marketing/Workspace/Focus layouts (UI only). */}
 <ErrorBoundary>
 <Routes>
 <Route
 path="/"
 element={
 isAuthenticated ? <Navigate to="/dashboard" replace /> : <PublicHomePage />
 }
 />
 <Route path="/register" element={<RegisterPage />} />
 <Route path="/login" element={<LoginPage />} />
 <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/product" element={<ProductPage />} />
 <Route path="/product/discover" element={<ProductDiscoverPage />} />
 <Route path="/product/validate" element={<ProductValidatePage />} />
 <Route path="/product/network" element={<ProductNetworkPage />} />
 <Route path="/pricing" element={<PricingPage />} />
        <Route path="/resources" element={<Navigate to="/resources/templates" replace />} />
        <Route path="/resources/templates" element={<ResourceTemplatesPage />} />
        <Route path="/resources/frameworks" element={<Navigate to="/resources/templates" replace />} />
        <Route path="/frameworks" element={<Navigate to="/resources/templates" replace />} />
        <Route path="/advisor-resources" element={<AdvisorResourcesPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogArticlePage />} />
 <Route path="/about" element={<AboutPage />} />
 <Route path="/contact" element={<ContactPage />} />
 {/* Workspace nested layout (Sidebar persists between workspace routes) */}
 <Route element={<WorkspaceLayout />}>
 <Route element={<ProtectedRoute><WorkspaceOutlet /></ProtectedRoute>}>
 <Route path="/dashboard" element={<DashboardPage />} />
 {/* New IA workspace routes */}
 <Route path="/dashboard/ideas" element={<Navigate to="/dashboard?tab=ideas" replace />} />
 <Route path="/dashboard/validations" element={<Navigate to="/dashboard?tab=validations" replace />} />
 <Route path="/dashboard/history" element={<Navigate to="/dashboard?tab=history" replace />} />
 <Route path="/dashboard/insights" element={<Navigate to="/dashboard?tab=ideas" replace />} />
 {/* Back-compat routes */}
 <Route path="/dashboard/workspace" element={<Navigate to="/dashboard?tab=ideas" replace />} />
 <Route path="/dashboard/compare" element={<CompareSessionsPage />} />
 <Route
 path="/dashboard/runs"
 element={
 <Suspense fallback={<LoadingIndicator simple={true} message="Loading run history..." />}>
 <RunHistoryPage />
 </Suspense>
 }
 />
        <Route
          path="/validate-result"
          element={
            <ProtectedRoute>
              <ValidationResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/validate-idea"
          element={
            <ProtectedRoute>
              <IdeaValidator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/advisor"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route path="/founder-connect" element={<FounderConnectPage />} />
        <Route path="/founder-psychology" element={<FounderPsychologyPage />} />
        <Route
          path="/psyche/questionnaire"
          element={
            <ProtectedRoute>
              <PsycheQuestionnairePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/frameworks"
          element={
            <Suspense fallback={<LoadingIndicator simple={true} message="Loading frameworks..." />}>
              <WorkspaceFrameworksPage />
            </Suspense>
          }
        />
        <Route
          path="/account"
          element={
            <Suspense fallback={<LoadingIndicator simple={true} message="Loading account..." />}>
              <AccountPage />
            </Suspense>
          }
        />
        <Route
          path="/how-advisor-thinks"
          element={
            <ProtectedRoute>
              <HowAdvisorThinksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help/validate-idea"
          element={
            <ProtectedRoute>
              <ValidateIdeaHelp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help/discover"
          element={
            <ProtectedRoute>
              <DiscoverHelp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help/founder-network"
          element={
            <ProtectedRoute>
              <FounderNetworkHelp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help/workspace"
          element={
            <ProtectedRoute>
              <WorkspaceHelp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help/frameworks"
          element={
            <ProtectedRoute>
              <FrameworksHelp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help/account"
          element={
            <ProtectedRoute>
              <AccountHelp />
            </ProtectedRoute>
          }
        />
</Route>
</Route>
 <Route
 path="/psyche/complete"
 element={
 <ProtectedRoute>
 <PsycheCompletePage />
 </ProtectedRoute>
 }
 />
 <Route
 path="/psyche/profile"
 element={
 <ProtectedRoute>
 <PsycheProfilePage />
 </ProtectedRoute>
 }
 />
 {/* Admin routes - completely separate, no navigation links visible to regular users */}
 <Route 
 path="/admin" 
 element={
 <AdminRouteWrapper>
 <Suspense fallback={<LoadingIndicator simple={true} message="Loading admin panel..." />}>
 <AdminPage />
 </Suspense>
 </AdminRouteWrapper>
 } 
 />
 <Route 
 path="/admin/forgot-password" 
 element={
 <AdminRouteWrapper>
 <Suspense fallback={<LoadingIndicator simple={true} message="Loading..." />}>
 <AdminForgotPasswordPage />
 </Suspense>
 </AdminRouteWrapper>
 } 
 />
 <Route 
 path="/admin/reset-password" 
 element={
 <AdminRouteWrapper>
 <Suspense fallback={<LoadingIndicator simple={true} message="Loading..." />}>
 <AdminResetPasswordPage />
 </Suspense>
 </AdminRouteWrapper>
 } 
 />
 <Route path="/privacy" element={<PrivacyPage />} />
 <Route path="/terms" element={<TermsPage />} />
 <Route
 path="/results/profile"
 element={
 <SampleReportRoute>
 <ProfileReport />
 </SampleReportRoute>
 }
 />
 <Route
 path="/results/recommendations"
 element={
 <SampleReportRoute>
 <RecommendationsReport />
 </SampleReportRoute>
 }
 />
 <Route
 path="/results/recommendations/:ideaIndex"
 element={
 <SampleReportRoute>
 <RecommendationDetail />
 </SampleReportRoute>
 }
 />
 <Route path="*" element={<Navigate to="/" replace />} />
 </Routes>
 </ErrorBoundary>
 {loading && !isAdminRoute && <LoadingIndicator />}
 </div>
 );
}

function WorkspaceOutlet() {
 return <Outlet />;
}

function SampleReportRoute({ children }) {
 const { search, pathname } = useLocation();
 const query = new URLSearchParams(search);
 const isSample = query.get("sample") === "true";
 
 // If it's a sample report, allow access without authentication
 if (isSample) {
 return <>{children}</>;
 }
 
 // For recommendation reports, allow access without authentication
 // They can load from localStorage cache or show appropriate message
 if (pathname.startsWith("/results/recommendations")) {
 return <>{children}</>;
 }
 
 // Otherwise, require authentication
 return (
 <ProtectedRoute>
 {children}
 </ProtectedRoute>
 );
}

function AdminRouteWrapper({ children }) {
 // Admin routes are completely isolated - no navigation, no header/footer
 // This wrapper ensures admin pages are separate from the main app
 return (
 <div className="min-h-screen bg-surface">
 {children}
 </div>
 );
}

function ProtectedRoute({ children }) {
 const { isAuthenticated, isSubscriptionActive, subscription, loading } = useAuth();
 const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);

 useEffect(() => {
 if (!loading && !isAuthenticated) {
 // Will redirect via Navigate
 } else if (!loading && isAuthenticated && subscription !== null && !isSubscriptionActive) {
 setShowPaymentPrompt(true);
 }
 }, [loading, isAuthenticated, isSubscriptionActive, subscription]);

 if (loading) {
 return <LoadingIndicator simple={true} message="Checking authentication..." />;
 }

 if (!isAuthenticated) {
 return <Navigate to="/login" state={{ from: { pathname: window.location.pathname } }} replace />;
 }

 // Only show subscription screen if subscription has been checked (not null) and is inactive
 // This prevents the flash when subscription is still loading
 if (subscription !== null && !isSubscriptionActive) {
 return (
 <div className="mx-auto max-w-4xl px-6 py-12">
 <div className="rounded-3xl border-2 border-default bg-surface p-8 text-center shadow-soft">
 <h2 className="mb-4 text-2xl font-bold text-accent">Subscription Expired</h2>
 <p className="mb-2 text-accent">
 Your subscription has expired.
 </p>
 <p className="mb-6 text-sm text-accent">
 Subscribe now to continue accessing all features and get personalized startup recommendations.
 </p>
 <Link
 to="/pricing"
 className="ui-btn ui-btn-primary"
 >
 View Pricing & Subscribe
 </Link>
 </div>
 </div>
 );
 }

 // If subscription is still loading (null), show loading indicator instead of subscription screen
 if (subscription === null) {
 return <LoadingIndicator simple={true} message="Loading subscription status..." />;
 }

 return <>{children}</>;
}
