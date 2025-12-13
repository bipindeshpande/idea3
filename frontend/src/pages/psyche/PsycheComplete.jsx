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
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6 md:p-7 relative">
            <div className="absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-indigo-300 opacity-[0.09] blur-2xl pointer-events-none"></div>
            <div className="relative z-10">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Decision & Work Style Saved
              </h1>
              <p className="text-[15px] text-gray-700 leading-relaxed mb-8">
                We'll use this to personalize and explain your startup idea recommendations.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/advisor#intake-form"
                className="px-5 py-2.5 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
              >
                Continue to Ideas
              </Link>
              <Link
                to="/psyche/questionnaire"
                className="text-sm text-gray-600 hover:text-gray-700 transition"
              >
                Retake Assessment
              </Link>
            </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

