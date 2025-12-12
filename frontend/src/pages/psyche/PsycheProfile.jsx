import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function PsycheProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const { getAuthHeaders, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Only show details if explicitly requested via query param
    const details = searchParams.get("details");
    setShowDetails(details === "true");

    if (!isAuthenticated) {
      navigate("/login?redirect=/psyche/profile");
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await fetch("/api/psyche/profile", {
          headers: {
            ...getAuthHeaders(),
          },
        });

        const data = await response.json();

        if (data.success && data.profile) {
          setProfile(data.profile);
        } else {
          setError(data.message || "No profile found");
        }
      } catch (err) {
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated, navigate, getAuthHeaders, searchParams]);

  const formatScore = (value) => {
    return typeof value === "number" ? (value * 100).toFixed(0) : value;
  };

  const getScoreLabel = (value) => {
    const num = typeof value === "number" ? value : parseFloat(value);
    if (num < 0.33) return "Low";
    if (num < 0.67) return "Moderate";
    return "High";
  };

  const getScoreColor = (value) => {
    const num = typeof value === "number" ? value : parseFloat(value);
    if (num < 0.33) return "bg-red-500";
    if (num < 0.67) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {error || "No assessment found"}
          </p>
          <Link
            to="/psyche/questionnaire"
            className="inline-block px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
          >
            Complete Assessment
          </Link>
        </div>
      </div>
    );
  }

  // If details not requested, show simple confirmation
  if (!showDetails) {
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

  // Detailed view (only shown when ?details=true)
  return (
    <>
      <Seo
        title="Decision & Work Style Details"
        description="Detailed view of your preferences"
      />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                Decision & Work Style Details
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Advanced view of how you prefer to work
              </p>
            </div>
            <Link
              to="/psyche/questionnaire"
              className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 text-sm"
            >
              Retake Assessment
            </Link>
          </div>

          {/* Work Preferences */}
          <div className="mb-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
              How You Like to Work
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(profile.personality || {}).map(([trait, value]) => (
                <div key={trait} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {trait === "O" ? "Openness to new ideas" : trait === "C" ? "Organization & planning" : trait === "E" ? "Social energy" : trait === "A" ? "Collaboration style" : "Stress response"}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {getScoreLabel(value)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`${getScoreColor(value)} h-2 rounded-full`}
                      style={{ width: `${formatScore(value)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Preferences */}
          <div className="mb-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
              Decision Preferences
            </h2>
            <div className="space-y-4">
              {Object.entries(profile.decision_style || {}).map(([style, value]) => (
                <div key={style} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {style === "risk" ? "Risk preference" : style === "speed_vs_certainty" ? "Speed vs thoroughness" : "Decision approach"}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {getScoreLabel(value)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`${getScoreColor(value)} h-2 rounded-full`}
                      style={{ width: `${formatScore(value)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What Drives You */}
          <div className="mb-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
              What Drives You
            </h2>
            <div className="space-y-4">
              {Object.entries(profile.motivation || {}).map(([motivation, value]) => (
                <div key={motivation} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                      {motivation}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {formatScore(value)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`${getScoreColor(value)} h-2 rounded-full`}
                      style={{ width: `${formatScore(value)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> This detailed view is for advanced users. Your preferences are used by the system to personalize your startup idea recommendations. 
              You can retake the assessment at any time to update your preferences.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

