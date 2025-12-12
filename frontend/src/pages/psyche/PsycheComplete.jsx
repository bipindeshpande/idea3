import { Link, useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function PsycheComplete() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate("/login?redirect=/psyche/complete");
    return null;
  }

  return (
    <>
      <Seo
        title="Decision & Work Style Saved"
        description="Your preferences have been saved"
      />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
              Decision & Work Style Saved
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              We'll use this to personalize and explain your startup idea recommendations.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/advisor#intake-form"
              className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all duration-200 hover:from-brand-600 hover:to-brand-700 hover:shadow-xl hover:shadow-brand-500/30"
            >
              Continue to Ideas
            </Link>
            <Link
              to="/psyche/questionnaire"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition"
            >
              Retake Assessment
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

