import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import { ADMIN_PASSWORD, ADMIN_STORAGE_KEY } from "../../utils/admin.js";

export default function AdminLogin({ onAuthenticated }) {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [showMfa, setShowMfa] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!showMfa) {
      // First step: verify password via API
      try {
        const response = await fetch("/api/admin/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setShowMfa(true);
            setPassword("");
          } else {
            setError(data.error || "Incorrect password");
            setPassword("");
          }
        } else {
          // Response not ok, try to parse error or use fallback
          try {
            const errorData = await response.json();
            setError(errorData.error || "Incorrect password");
          } catch {
            setError("Incorrect password");
          }
          setPassword("");
        }
      } catch (err) {
        // Fallback to local check for backward compatibility
        if (password === ADMIN_PASSWORD) {
          setShowMfa(true);
          setPassword("");
        } else {
          setError("Incorrect password");
          setPassword("");
        }
      }
    } else {
      // Second step: verify MFA code
      // Development mode: Accept hardcoded code "2538"
      // Production: Will use proper TOTP validation
      if (mfaCode === "2538") {
        localStorage.setItem(ADMIN_STORAGE_KEY, "true");
        setError("");
        setMfaCode("");
        setShowMfa(false);
        onAuthenticated();
      } else {
        setError("Invalid MFA code. Please enter the correct code.");
        setMfaCode("");
      }
    }
  };

  return (
    <section className="mx-auto max-w-md px-6 py-12">
      <Seo title="Admin Login | Startup Idea Advisor" description="Admin access" path="/admin" />
      <div className="ui-card rounded-[16px] p-6 shadow-card">
        <h1 className="mb-6 text-2xl font-bold text-primary">Admin Login</h1>
        <form onSubmit={handleLogin}>
          {!showMfa ? (
            <>
              <div className="mb-4">
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-primary">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="ui-input focus-visible:outline-accent"
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>
              {error && (
                <div className="badge-danger mb-4 rounded-xl p-3 text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="ui-btn ui-btn-primary w-full focus-visible:outline-accent"
              >
                Continue
              </button>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => navigate("/admin/forgot-password")}
                  className="text-sm text-accent hover:text-accent-hover"
                >
                  Forgot Password?
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label htmlFor="mfaCode" className="mb-2 block text-sm font-semibold text-primary">
                  Two-Factor Authentication Code
                </label>
                <input
                  type="text"
                  id="mfaCode"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="ui-input text-center text-2xl tracking-widest font-mono focus-visible:outline-accent"
                  placeholder="Enter MFA code"
                  autoFocus
                />
                <p className="mt-2 text-xs text-secondary text-center">
                  Development mode: Enter MFA code
                </p>
              </div>
              {error && (
                <div className="badge-danger mb-4 rounded-xl p-3 text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowMfa(false);
                    setMfaCode("");
                    setError("");
                  }}
                  className="ui-btn ui-btn-secondary flex-1 focus-visible:outline-accent"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="ui-btn ui-btn-primary flex-1 focus-visible:outline-accent"
                >
                  Verify & Login
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </section>
  );
}

