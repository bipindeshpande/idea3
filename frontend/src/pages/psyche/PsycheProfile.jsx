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
 if (num < 0.33) return "bg-surface-muted";
 if (num < 0.67) return "bg-warning";
 return "bg-success";
};

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-default mx-auto mb-4"></div>
 <p className="text-secondary">Loading profile...</p>
 </div>
 </div>
 );
 }

 if (error || !profile) {
 return (
 <div className="min-h-screen flex items-center justify-center px-6">
 <div className="max-w-md w-full text-center">
 <p className="text-secondary mb-4">
 {error || "No assessment found"}
 </p>
 <Link
 to="/psyche/questionnaire"
 className="inline-block px-5 py-2.5 rounded-lg font-medium text-on-accent bg-accent hover:bg-accent-hover transition-all shadow-sm hover:shadow-md"
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
 <div className="min-h-screen flex items-center justify-center px-6">
 <div className="max-w-md w-full text-center">
 <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 relative">
 <div className="absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-surface opacity-[0.09] blur-2xl pointer-events-none"></div>
 <div className="relative z-10">
 <div className="mb-6">
<div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--badge-success-bg)" }}>
<svg className="w-8 h-8" style={{ color: "var(--badge-success-text)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
 </svg>
 </div>
 <h1 className="text-2xl font-semibold text-primary mb-2">
 Decision & Work Style Saved
 </h1>
 <p className="text-primary text-primary leading-relaxed mb-8">
 We'll use this to personalize and explain your startup idea recommendations.
 </p>
 </div>

 <div className="flex flex-col gap-3">
 <Link
 to="/advisor#intake-form"
 className="px-5 py-2.5 rounded-lg font-medium text-on-accent bg-accent hover:bg-accent-hover transition-all shadow-sm hover:shadow-md"
 >
 Continue to Ideas
 </Link>
 <Link
 to="/psyche/questionnaire"
 className="text-sm text-secondary hover:text-primary transition"
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

 // Detailed view (only shown when ?details=true)
 return (
 <>
 <Seo
 title="Decision & Work Style Details"
 description="Detailed view of your preferences"
 />
 <div className="min-h-screen py-12 px-6">
 <div className="max-w-4xl mx-auto">
 {/* Header */}
 <div className="mb-8 flex justify-between items-center relative">
 <div className="absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-surface opacity-[0.09] blur-2xl pointer-events-none"></div>
 <div className="relative z-10 flex-1">
 <h1 className="text-3xl md:text-4xl font-semibold text-primary mb-2">
 Decision & Work Style Details
 </h1>
 <p className="text-primary text-primary leading-relaxed mb-8">
 Advanced view of how you prefer to work
 </p>
 </div>
 <Link
 to="/psyche/questionnaire"
 className="px-5 py-2.5 rounded-lg font-medium text-accent bg-surface hover:bg-surface transition-all shadow-sm hover:shadow-md text-sm"
 >
 Retake Assessment
 </Link>
 </div>

 {/* Work Preferences */}
 <div className="mb-8 rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
 <h2 className="text-lg font-semibold text-primary flex items-center gap-2 mb-4">
 How You Like to Work
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {Object.entries(profile.personality || {}).map(([trait, value]) => (
 <div key={trait} className="space-y-2">
 <div className="flex justify-between items-center">
 <span className="text-sm text-secondary">
 {trait === "O" ? "Openness to new ideas" : trait === "C" ? "Organization & planning" : trait === "E" ? "Social energy" : trait === "A" ? "Collaboration style" : "Stress response"}
 </span>
 <span className="text-sm text-secondary">
 {getScoreLabel(value)}
 </span>
 </div>
 <div className="w-full bg-surface rounded-full h-2">
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
 <div className="mb-8 rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
 <h2 className="text-lg font-semibold text-primary flex items-center gap-2 mb-4">
 Decision Preferences
 </h2>
 <div className="space-y-4">
 {Object.entries(profile.decision_style || {}).map(([style, value]) => (
 <div key={style} className="space-y-2">
 <div className="flex justify-between items-center">
 <span className="text-sm text-secondary">
 {style === "risk" ? "Risk preference" : style === "speed_vs_certainty" ? "Speed vs thoroughness" : "Decision approach"}
 </span>
 <span className="text-sm text-secondary">
 {getScoreLabel(value)}
 </span>
 </div>
 <div className="w-full bg-surface rounded-full h-2">
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
 <div className="mb-8 rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
 <h2 className="text-lg font-semibold text-primary flex items-center gap-2 mb-4">
 What Drives You
 </h2>
 <div className="space-y-4">
 {Object.entries(profile.motivation || {}).map(([motivation, value]) => (
 <div key={motivation} className="space-y-2">
 <div className="flex justify-between items-center">
 <span className="text-sm text-secondary capitalize">
 {motivation}
 </span>
 <span className="text-sm text-secondary">
 {formatScore(value)}%
 </span>
 </div>
 <div className="w-full bg-surface rounded-full h-2">
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
 <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
 <p className="text-sm text-primary leading-relaxed">
 <strong>Note:</strong> This detailed view is for advanced users. Your preferences are used by the system to personalize your startup idea recommendations. 
 You can retake the assessment at any time to update your preferences.
 </p>
 </div>
 </div>
 </div>
 </>
 );
}

