import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import Card from "../../components/ui/Card.jsx";
import UIButton from "../../components/ui/ui-button.jsx";
import FormInput from "../../components/ui/FormInput.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";

export default function Register() {
 const navigate = useNavigate();
 const { register } = useAuth();
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
 e.preventDefault();
 setError("");

 if (!email || !password || !confirmPassword) {
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
 const result = await register(email, password);
 setLoading(false);

 if (result.success) {
 navigate("/dashboard");
 } else {
 setError(result.error || "Registration failed");
 }
 };

 return (
 <MarketingLayout>
      <PageContainer maxWidth="md" className="min-h-screen flex items-center justify-center py-12">
        <Seo
          title="Create Account | Startup Idea Advisor"
          description="Create your account to get 3 days free access to startup idea recommendations and validation."
          path="/register"
        />

      <Card className="relative max-w-sm mx-auto w-full" padding="sm">
        <div className="absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-surface opacity-[0.09] blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-primary mb-2">Create Account</h1>
          <p className="text-sm text-secondary">Get 3 days free access to all features</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
 <FormInput
 type="email"
 id="email"
 label="Email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 autoComplete="username"
 placeholder="your@email.com"
 />

 <FormInput
 type="password"
 id="password"
 label="Password"
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
 {loading ? "Creating Account..." : "Create Account"}
 </UIButton>
 </form>

        <div className="mt-4 text-center text-sm text-secondary">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-accent hover:text-accent transition-colors">
            Sign in
          </Link>
        </div>

        <Card className="mt-4 text-center">
 <p className="font-semibold text-primary">✨ 3 Days Free Trial</p>
 <p className="mt-1.5 text-primary text-primary leading-relaxed">Access all features for free. No credit card required.</p>
 </Card>
 </div>
 </Card>
 </PageContainer>
 </MarketingLayout>
 );
}

