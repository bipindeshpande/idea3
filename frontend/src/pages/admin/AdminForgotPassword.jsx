import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";

export default function AdminForgotPassword() {
 const navigate = useNavigate();
 const [email, setEmail] = useState("");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const [success, setSuccess] = useState(false);

 const handleSubmit = async (e) => {
 e.preventDefault();
 setError("");
 setSuccess(false);
 setLoading(true);

 try {
 const response = await fetch("/api/admin/forgot-password", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 },
 body: JSON.stringify({ email }),
 });

 const data = await response.json();
 if (data.success) {
 setSuccess(true);
 } else {
 setError(data.error || "Failed to send reset email");
 }
 } catch (err) {
 setError("Network error. Please try again.");
 } finally {
 setLoading(false);
 }
 };

 return (
 <section className="mx-auto max-w-md px-6 py-12">
 <Seo title="Admin Forgot Password | Startup Idea Advisor" description="Admin password reset" path="/admin/forgot-password" />
 <div className="ui-card rounded-[16px] p-6 shadow-card">
 <h1 className="mb-6 text-2xl font-bold text-primary">Reset Admin Password</h1>
 
 {success ? (
 <div className="space-y-4">
 <div className="badge-success rounded-xl p-4">
 <p className="text-sm">
 If the email address exists in our system, we've sent a password reset link to <strong>{email}</strong>.
 </p>
 <p className="mt-2 text-xs text-secondary">
 Please check your email and click the link to reset your password. The link will expire in 1 hour.
 </p>
 </div>
 <Link
 to="/admin"
 className="ui-btn ui-btn-primary w-full text-center focus-visible:outline-accent"
 >
 Back to Login
 </Link>
 </div>
 ) : (
 <form onSubmit={handleSubmit}>
 <div className="mb-4">
 <label htmlFor="email" className="mb-2 block text-sm font-semibold text-primary">
 Admin Email
 </label>
 <input
 type="email"
 id="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="ui-input focus-visible:outline-accent"
 placeholder="Enter your admin email"
 required
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
 disabled={loading}
 className="ui-btn ui-btn-primary w-full focus-visible:outline-accent disabled:opacity-50"
 >
 {loading ? "Sending..." : "Send Reset Link"}
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

