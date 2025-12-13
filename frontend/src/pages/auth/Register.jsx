import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import PageHeader from "../../components/layout/PageHeader.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import FormInput from "../../components/ui/FormInput.jsx";

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
    <PageContainer maxWidth="md">
      <Seo
        title="Create Account | Startup Idea Advisor"
        description="Create your account to get 3 days free access to startup idea recommendations and validation."
        path="/register"
      />

      <Card className="relative">
        <div className="absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-indigo-300 opacity-[0.09] blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
        <PageHeader
          title="Create Account"
          description="Get 3 days free access to all features"
        />

        <form onSubmit={handleSubmit} className="space-y-5">
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
            <Card className="border-red-200 bg-red-50">
              <p className="text-[15px] text-red-800 leading-relaxed font-semibold">{error}</p>
            </Card>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
            Sign in
          </Link>
        </div>

        <Card className="mt-6 text-center">
          <p className="font-semibold text-gray-900">✨ 3 Days Free Trial</p>
          <p className="mt-1.5 text-[15px] text-gray-700 leading-relaxed">Access all features for free. No credit card required.</p>
        </Card>
        </div>
      </Card>
    </PageContainer>
  );
}

