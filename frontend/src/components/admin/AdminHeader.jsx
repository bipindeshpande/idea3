import { useNavigate } from "react-router-dom";
import { clearAdminAuth } from "../../utils/admin.js";

export default function AdminHeader({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAdminAuth();
    onLogout();
    navigate("/admin");
  };

  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-3xl font-bold text-primary">Admin Panel</h1>
      <button
        onClick={handleLogout}
        className="ui-btn ui-btn-secondary focus-visible:outline-accent"
      >
        Logout
      </button>
    </div>
  );
}

