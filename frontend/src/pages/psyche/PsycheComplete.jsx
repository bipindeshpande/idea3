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

