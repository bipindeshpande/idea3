import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";

export default function AdminResetPassword() {
 const navigate = useNavigate();
 const [searchParams] = useSearchParams();
 const token = searchParams.get("token");
 
 const [password, setPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const [success, setSuccess] = useState(false);

 useEffect(() => {
 if (!token) {
 setError("Invalid reset token. Please request a new password reset.");
 }
 }, [token]);

 const handleSubmit = async (e) => {
 e.preventDefault();
 setError("");
 setSuccess(false);

 if (password !== confirmPassword) {
 setError("Passwords do not match");
 return;
 }

 if (password.length < 8) {
 setError("Password must be at least 8 characters");
 return;
 }

 setLoading(true);

 try {
 const response = await fetch("/api/admin/reset-password", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 },
 body: JSON.stringify({ token, password }),
 });

 const data = await response.json();
 if (data.success) {
 setSuccess(true);
 setTimeout(() => {
 navigate("/admin");
 }, 3000);
 } else {
 setError(data.error || "Failed to reset password");
 }
 } catch (err) {
 setError("Network error. Please try again.");
 } finally {
 setLoading(false);
 }
 };

 if (!token) {
 return (
 <section className="mx-auto max-w-md px-6 py-12">
 <Seo title="Admin Reset Password | Startup Idea Advisor" description="Admin password reset" path="/admin/reset-password" />
 <div className="ui-card rounded-[16px] p-6 shadow-card">
 <div className="badge-danger rounded-xl p-4">
 <p className="text-sm">
 Invalid reset token. Please request a new password reset.
 </p>
 </div>
 <Link
 to="/admin/forgot-password"
 className="ui-btn ui-btn-primary mt-4 w-full text-center focus-visible:outline-accent"
 >
 Request New Reset Link
 </Link>
 </div>
 </section>
 );
 }

 return (
 <section className="mx-auto max-w-md px-6 py-12">
 <Seo title="Admin Reset Password | Startup Idea Advisor" description="Admin password reset" path="/admin/reset-password" />
 <div className="ui-card rounded-[16px] p-6 shadow-card">
 <h1 className="mb-6 text-2xl font-bold text-primary">Reset Admin Password</h1>
 
 {success ? (
 <div className="space-y-4">
 <div className="badge-success rounded-xl p-4">
 <p className="text-sm">
 Password reset successfully! Redirecting to login page...
 </p>
 </div>
 <Link
 to="/admin"
 className="ui-btn ui-btn-primary w-full text-center focus-visible:outline-accent"
 >
 Go to Login
 </Link>
 </div>
 ) : (
 <form onSubmit={handleSubmit}>
 <div className="mb-4">
 <label htmlFor="password" className="mb-2 block text-sm font-semibold text-primary">
 New Password
 </label>
 <input
 type="password"
 id="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 autoComplete="new-password"
 className="ui-input focus-visible:outline-accent"
 placeholder="Enter new password (min 8 characters)"
 required
 minLength={8}
 autoFocus
 />
 </div>
 <div className="mb-4">
 <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-primary">
 Confirm Password
 </label>
 <input
 type="password"
 id="confirmPassword"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 autoComplete="new-password"
 className="ui-input focus-visible:outline-accent"
 placeholder="Confirm new password"
 required
 minLength={8}
 />
 </div>
 {error && (
 <div className="badge-danger mb-4 rounded-xl p-3 text-sm">
 {error}
 </div>
 )}
 <button
 type="submit"
 disabled={loading}
 className="ui-btn ui-btn-primary w-full focus-visible:outline-accent disabled:opacity-50"
 >
 {loading ? "Resetting..." : "Reset Password"}
 </button>
 <div className="mt-4 text-center">
 <Link
 to="/admin"
 className="text-sm text-accent hover:text-accent-hover"
 >
 Back to Login
 </Link>
 </div>
 </form>
 )}
 </div>
 </section>
 );
}

