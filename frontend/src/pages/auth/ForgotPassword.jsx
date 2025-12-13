import { useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import PageHeader from "../../components/layout/PageHeader.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import FormInput from "../../components/ui/FormInput.jsx";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      if (result.reset_link) {
        setResetLink(result.reset_link);
      }
    } else {
      setError(result.error || "Failed to send reset link");
    }
  };

  return (
    <PageContainer maxWidth="md">
      <Seo
        title="Forgot Password | Startup Idea Advisor"
        description="Reset your password to regain access to your account."
        path="/forgot-password"
      />

      <Card className="relative">
        <div className="absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-indigo-300 opacity-[0.09] blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
        <PageHeader
          title="Forgot Password"
          description="Enter your email and we'll send you a reset link."
        />

        {success ? (
          <div className="space-y-4">
            <Card className="border-emerald-200 bg-emerald-50">
              <p className="text-[15px] text-emerald-800 leading-relaxed font-semibold">Reset link sent!</p>
              <p className="mt-2 text-[15px] text-emerald-700 leading-relaxed">
                If an account exists with that email, we've sent a password reset link. Check your inbox.
              </p>
              {resetLink && (
                <div className="mt-4 rounded-lg border border-emerald-300 bg-white p-3">
                  <p className="mb-2 text-xs font-semibold">Development Mode - Reset Link:</p>
                  <a
                    href={resetLink}
                    className="break-all text-xs text-emerald-700 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resetLink}
                  </a>
                </div>
              )}
            </Card>
            <Button as={Link} to="/login" className="w-full">
              Back to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              type="email"
              id="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
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
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </div>
        </div>
      </Card>
    </PageContainer>
  );
}

