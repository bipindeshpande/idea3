import { useState, useEffect } from "react";
import Seo from "../../components/common/Seo.jsx";
import AdminLogin from "../../components/admin/AdminLogin.jsx";
import AdminHeader from "../../components/admin/AdminHeader.jsx";
import AdminTabs from "../../components/admin/AdminTabs.jsx";
import AdminDashboard from "../../components/admin/AdminDashboard.jsx";
import AdminReports from "../../components/admin/AdminReports.jsx";
import AdminStats from "../../components/admin/AdminStats.jsx";
import UsersManagement from "../../components/admin/UsersManagement.jsx";
import PaymentsManagement from "../../components/admin/PaymentsManagement.jsx";
import ValidationQuestionsEditor from "../../components/admin/ValidationQuestionsEditor.jsx";
import IntakeFieldsEditor from "../../components/admin/IntakeFieldsEditor.jsx";
import { ADMIN_STORAGE_KEY, verifyAdminSession, clearAdminAuth } from "../../utils/admin.js";

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("validation");
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Always require fresh authentication - always show login screen first
  useEffect(() => {
    // Always start with login screen - don't auto-authenticate
    // This ensures admin must authenticate every time they visit /admin
    setCheckingAuth(false);
    setAuthenticated(false);
    // Clear any stale authentication to force fresh login
    clearAdminAuth();
  }, []);

  // Verify authentication on mount and when authenticated state changes
  useEffect(() => {
    if (authenticated) {
      // Periodically verify session is still valid
      const interval = setInterval(() => {
        verifyAdminSession().then((isValid) => {
          if (!isValid) {
            setAuthenticated(false);
          }
        });
      }, 5 * 60 * 1000); // Check every 5 minutes

      return () => clearInterval(interval);
    }
  }, [authenticated]);

  const handleAuthenticated = () => {
    setAuthenticated(true);
  };

  const handleLogout = () => {
    setAuthenticated(false);
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <section className="mx-auto max-w-md px-6 py-12">
        <Seo title="Admin Login | Startup Idea Advisor" description="Admin access" path="/admin" />
        <div className="ui-card rounded-[16px] p-6 shadow-card">
          <div className="flex items-center justify-center py-8">
            <div className="text-secondary">Checking authentication...</div>
          </div>
        </div>
      </section>
    );
  }

  // Always show login screen first - require authentication
  if (!authenticated) {
    return <AdminLogin onAuthenticated={handleAuthenticated} />;
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <Seo title="Admin Panel | Startup Idea Advisor" description="Content management" path="/admin" />
      
      <AdminHeader onLogout={handleLogout} />

      <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content Management */}
      {activeTab === "dashboard" && <AdminDashboard />}
      {activeTab === "reports" && <AdminReports />}
      {activeTab === "stats" && <AdminStats />}
      {activeTab === "users" && <UsersManagement />}
      {activeTab === "payments" && <PaymentsManagement />}
      {activeTab === "validation" && <ValidationQuestionsEditor />}
      {activeTab === "intake" && <IntakeFieldsEditor />}
    </section>
  );
}
