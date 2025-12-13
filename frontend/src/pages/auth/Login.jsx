import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import PageHeader from "../../components/layout/PageHeader.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import FormInput from "../../components/ui/FormInput.jsx";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Always redirect to dashboard after login, unless coming from a specific protected route
  // This ensures direct sign-ins go to dashboard, not profile analysis
  const from = location.state?.from?.pathname;
  // Only allow redirect to these specific routes, otherwise always go to dashboard
  const allowedRedirectRoutes = ["/advisor", "/validate-idea", "/founder-connect", "/founder-psychology"];
  const redirectTo = from && allowedRedirectRoutes.includes(from) ? from : "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Always go to dashboard for direct sign-ins
      navigate(redirectTo);
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <PageContainer maxWidth="md">
      <Seo
        title="Sign In | Startup Idea Advisor"
        description="Sign in to your account to access startup idea recommendations and validation."
        path="/login"
      />

      <Card className="relative">
        <div className="absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-indigo-300 opacity-[0.09] blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
        <PageHeader
          title="Sign In"
          description="Welcome back! Sign in to continue."
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
            autoComplete="current-password"
            placeholder="Enter your password"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>
            <Link to="/forgot-password" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              Forgot password?
            </Link>
          </div>

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
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
            Create one
          </Link>
        </div>
        </div>
      </Card>
    </PageContainer>
  );
}

