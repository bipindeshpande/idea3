import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import PageHeader from "../../components/layout/PageHeader.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import Card from "../../components/ui/Card.jsx";
import UIButton from "../../components/ui/ui-button.jsx";
import FormInput from "../../components/ui/FormInput.jsx";
import SectionHeader from "../../components/layout/SectionHeader.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";

export default function ResetPassword() {
 const navigate = useNavigate();
 const [searchParams] = useSearchParams();
 const { resetPassword } = useAuth();
 const token = searchParams.get("token");
 const [password, setPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [error, setError] = useState("");
 const [success, setSuccess] = useState(false);
 const [loading, setLoading] = useState(false);

 useEffect(() => {
 if (!token) {
 setError("Invalid reset link. Please request a new one.");
 }
 }, [token]);

 const handleSubmit = async (e) => {
 e.preventDefault();
 setError("");

 if (!token) {
 setError("Invalid reset link");
 return;
 }

 if (!password || !confirmPassword) {
 setError("All fields are required");
 return;
 }

 if (password.length < 8) {
 setError("Password must be at least 8 characters");
 return;
 }

 if (password !== confirmPassword) {
 setError("Passwords do not match");
 return;
 }

 setLoading(true);
 const result = await resetPassword(token, password);
 setLoading(false);

 if (result.success) {
 setSuccess(true);
 setTimeout(() => {
 navigate("/login");
 }, 2000);
 } else {
 setError(result.error || "Password reset failed");
 }
 };

 if (!token) {
 return (
 <PageContainer maxWidth="md">
 <Seo
 title="Reset Password | Startup Idea Advisor"
 description="Reset your password."
 path="/reset-password"
 />
 <Card className="relative">
 <div className="absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-surface opacity-[0.09] blur-2xl pointer-events-none"></div>
 <div className="relative z-10">
 <SectionHeader title="Invalid Reset Link" />
 <p className="mt-2 text-primary text-primary leading-relaxed">Please request a new password reset link.</p>
 <UIButton as={Link} to="/forgot-password" variant="secondary" className="mt-4">
 Request New Link
 </UIButton>
 </div>
 </Card>
 </PageContainer>
 );
 }

 return (
 <MarketingLayout>
 <PageContainer maxWidth="md">
 <Seo
 title="Reset Password | Startup Idea Advisor"
 description="Reset your password to regain access to your account."
 path="/reset-password"
 />

 <Card className="relative">
 <div className="absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-surface opacity-[0.09] blur-2xl pointer-events-none"></div>
 <div className="relative z-10">
 <PageHeader
 title="Reset Password"
 description="Enter your new password below."
 />

 {success ? (
 <Card className="border-default bg-surface">
 <p className="text-primary text-accent leading-relaxed font-semibold">Password reset successful!</p>
 <p className="mt-2 text-primary text-accent leading-relaxed">Redirecting to sign in...</p>
 </Card>
 ) : (
 <form onSubmit={handleSubmit} className="space-y-4">
 <FormInput
 type="password"
 id="password"
 label="New Password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 required
 minLength={8}
 autoComplete="new-password"
 placeholder="At least 8 characters"
 />

 <FormInput
 type="password"
 id="confirmPassword"
 label="Confirm Password"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 required
 minLength={8}
 autoComplete="new-password"
 placeholder="Confirm your password"
 />

 {error && (
 <Card className="border-default bg-surface">
 <p className="text-primary text-accent leading-relaxed font-semibold">{error}</p>
 </Card>
 )}

 <UIButton
 type="submit"
 variant="primary"
 disabled={loading}
 className="w-full"
 >
 {loading ? "Resetting..." : "Reset Password"}
 </UIButton>
 </form>
 )}

 <div className="mt-6 text-center text-sm text-secondary">
 <Link to="/login" className="font-semibold text-accent hover:text-accent">
 Back to Sign In
 </Link>
 </div>
 </div>
 </Card>
 </PageContainer>
 </MarketingLayout>
 );
}

