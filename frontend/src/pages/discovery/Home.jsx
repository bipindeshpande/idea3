import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReports } from "../../context/ReportsContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import Seo from "../../components/common/Seo.jsx";
import DiscoveryLoadingIndicator from "../../components/discovery/DiscoveryLoadingIndicator.jsx";
import IntakeScreen from "./IntakeScreen.jsx";

export default function HomePage() {
  const navigate = useNavigate();
  const { inputs, setInputs, loading, error, runCrew, reports, streamingOutput, isCached, requestStartTime, requestDuration } = useReports();
  const { isAuthenticated } = useAuth();
  const [localInputs, setLocalInputs] = useState(inputs || {});
  const [screen, setScreen] = useState(0); // 0 = Form, 1 = Review
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setLocalInputs(inputs || {});
    setScreen(0);
    setTouched(false);
    setErrors({});
  }, [inputs]);

  // Handle scroll to form when navigating from Dashboard (Edit button)
  useEffect(() => {
    const scrollToForm = () => {
      const formElement = document.getElementById("intake-form");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    const hash = window.location.hash;
    if (hash === "#intake-form") {
      setTimeout(scrollToForm, 300);
      window.history.replaceState(null, "", window.location.pathname);
    } else if (inputs && Object.keys(inputs).length > 0 && Object.values(inputs).some(v => v && v !== "")) {
      setTimeout(scrollToForm, 300);
    }
  }, [inputs]);

  const handleInputChange = (updatedInputs) => {
    setLocalInputs(updatedInputs);
    // Clear errors for fields that are being updated
    const updatedErrors = { ...errors };
    Object.keys(updatedInputs).forEach(key => {
      if (updatedErrors[key]) {
        delete updatedErrors[key];
      }
    });
    setErrors(updatedErrors);
  };

  const validateForm = () => {
    const newErrors = {};
    const required = [
      "startup_category",
      "time_commitment",
      "budget_range",
      "risk_tolerance",
      "preferred_work_style",
      "startup_style",
      "customer_interaction",
      "location_context",
      "business_region",
      "industry_interest",
      "business_type",
      "earnings_timeline",
      "founder_ambition"
    ];

    required.forEach(field => {
      if (!localInputs[field] || (typeof localInputs[field] === "string" && !localInputs[field].trim())) {
        newErrors[field] = "This field is required";
      }
    });

    // Validate skills - at least one category must have skills selected
    const skills = localInputs.skills || {};
    const hasSkills = Object.keys(skills).some(category => {
      if (category === "other") return skills[category] && skills[category].trim();
      return Array.isArray(skills[category]) && skills[category].length > 0;
    });
    if (!hasSkills) {
      newErrors.skills = "Please select at least one skill";
    }

    // Validate sub_interest_area if not custom
    if (localInputs.industry_interest && localInputs.industry_interest !== "Other") {
      const SUB_INTEREST_MAPPING = {
        "Food & Beverage": ["Restaurant/Cafe", "Food Delivery", "Meal Prep", "Beverage Brand", "Catering", "Food Tech"],
        "Retail & E-commerce": ["D2C Brand", "Dropshipping", "Print-on-Demand", "Marketplace", "Subscription Box", "B2B Wholesale"],
        "Education": ["Online Courses", "Coaching Platforms", "Tutoring", "Skill Assessment", "Gamified Learning", "AI Learning"],
        "Fitness & Sports": ["Fitness App", "Personal Training", "Sports Equipment", "Wellness Coaching", "Nutrition Planning"],
        "Kids & Parenting": ["Educational Toys", "Parenting Apps", "Childcare Services", "Kids Activities", "Family Products"],
        "Beauty & Wellness": ["Skincare Brand", "Beauty Services", "Wellness App", "Spa Services", "Beauty Tech"],
        "Home Services": ["Cleaning", "Handyman", "Landscaping", "Home Automation", "Interior Design", "Maintenance"],
        "Travel & Tourism": ["Travel Planning", "Local Experiences", "Accommodation", "Travel Tech", "Tourism Services"],
        "Manufacturing / Crafts": ["Custom Products", "Handmade Goods", "3D Printing", "Craft Supplies", "Artisan Marketplace"],
        "Finance / Accounting": ["Personal Finance", "Small Business Finance", "Tax Services", "Investment Tools", "Financial Planning"],
        "AI & Automation": ["Chatbots", "Workflow Automation", "Predictive Analytics", "AI Tools", "Process Automation"],
        "Software / SaaS": ["B2B SaaS", "Productivity Tools", "Developer Tools", "Business Software", "Platform Services"],
        "Freelancing / Consulting": ["Consulting Services", "Freelance Marketplace", "Expert Network", "Business Advisory", "Professional Services"],
        "Agriculture / Gardening": ["Urban Farming", "Garden Services", "Agricultural Tech", "Plant Care", "Sustainable Farming"],
        "Social Impact": ["Non-profit", "Social Enterprise", "Community Services", "Environmental Solutions", "Charity Tech"],
        "Local Services": ["Local Marketplace", "Community Services", "Neighborhood Services", "Local Delivery", "Community Events"],
        "Other": ["Custom Sub-Area Text Field"]
      };
      const subOptions = SUB_INTEREST_MAPPING[localInputs.industry_interest] || [];
      const isCustom = subOptions.length === 1 && subOptions[0] === "Custom Sub-Area Text Field";
      if (!isCustom && (!localInputs.sub_interest_area || !localInputs.sub_interest_area.trim())) {
        newErrors.sub_interest_area = "Please select a sub-interest area";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (screen === 0) {
      if (validateForm()) {
        setTouched(false);
        setErrors({});
        setScreen(1); // Review screen
      } else {
        setTouched(true);
      }
    }
  };

  const handleBack = () => {
    setTouched(false);
    setErrors({});
    setScreen((prev) => Math.max(prev - 1, 0));
  };

  // Dev-only auto-fill handler
  const handleAutoFill = () => {
    const SUB_INTEREST_MAPPING = {
      "Food & Beverage": ["Restaurant/Cafe", "Food Delivery", "Meal Prep", "Beverage Brand", "Catering", "Food Tech"],
      "Retail & E-commerce": ["D2C Brand", "Dropshipping", "Print-on-Demand", "Marketplace", "Subscription Box", "B2B Wholesale"],
      "Education": ["Online Courses", "Coaching Platforms", "Tutoring", "Skill Assessment", "Gamified Learning", "AI Learning"],
      "Fitness & Sports": ["Fitness App", "Personal Training", "Sports Equipment", "Wellness Coaching", "Nutrition Planning"],
      "Kids & Parenting": ["Educational Toys", "Parenting Apps", "Childcare Services", "Kids Activities", "Family Products"],
      "Beauty & Wellness": ["Skincare Brand", "Beauty Services", "Wellness App", "Spa Services", "Beauty Tech"],
      "Home Services": ["Cleaning", "Handyman", "Landscaping", "Home Automation", "Interior Design", "Maintenance"],
      "Travel & Tourism": ["Travel Planning", "Local Experiences", "Accommodation", "Travel Tech", "Tourism Services"],
      "Manufacturing / Crafts": ["Custom Products", "Handmade Goods", "3D Printing", "Craft Supplies", "Artisan Marketplace"],
      "Finance / Accounting": ["Personal Finance", "Small Business Finance", "Tax Services", "Investment Tools", "Financial Planning"],
      "AI & Automation": ["Chatbots", "Workflow Automation", "Predictive Analytics", "AI Tools", "Process Automation"],
      "Software / SaaS": ["B2B SaaS", "Productivity Tools", "Developer Tools", "Business Software", "Platform Services"],
      "Freelancing / Consulting": ["Consulting Services", "Freelance Marketplace", "Expert Network", "Business Advisory", "Professional Services"],
      "Agriculture / Gardening": ["Urban Farming", "Garden Services", "Agricultural Tech", "Plant Care", "Sustainable Farming"],
      "Social Impact": ["Non-profit", "Social Enterprise", "Community Services", "Environmental Solutions", "Charity Tech"],
      "Local Services": ["Local Marketplace", "Community Services", "Neighborhood Services", "Local Delivery", "Community Events"],
      "Other": ["Custom Sub-Area Text Field"]
    };

    const SAMPLE_INPUTS = {
      startup_category: "tech",
      time_commitment: "10–20 hrs/week",
      budget_range: "$1,000–5,000",
      risk_tolerance: "Moderate",
      preferred_work_style: "Remote-friendly",
      startup_style: "Online-only business",
      customer_interaction: "Somewhat comfortable",
      location_context: "Urban",
      business_region: "United States / Canada",
      skills: {
        product_creation: ["Coding", "AI & Automation"],
        sales_marketing: ["Social Media", "Marketing / Advertising"],
        operational: ["Project Management", "Time Management"],
        digital: ["AI Tools", "Web Building"],
        personality: ["Problem Solving", "Leadership"],
        other: ""
      },
      industry_interest: "AI & Automation",
      sub_interest_area: "Chatbots",
      business_type: "Digital product",
      earnings_timeline: "90 days",
      founder_ambition: "Full-time business",
      experience_summary: "10 years in software development, experience with AI/ML projects, strong background in building SaaS products and managing technical teams."
    };

    const updated = { ...SAMPLE_INPUTS };
    // Handle sub_interest_area based on industry_interest
    const subOptions = SUB_INTEREST_MAPPING[updated.industry_interest] || [];
    if (subOptions.length === 1 && subOptions[0] === "Custom Sub-Area Text Field") {
      updated.sub_interest_area = "";
    } else {
      updated.sub_interest_area = subOptions[0] || "";
    }
    setLocalInputs(updated);
    handleInputChange(updated);
    
    // Scroll to form after auto-fill
    setTimeout(() => {
      const formElement = document.getElementById("intake-form");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (screen === 1) {
      setInputs(localInputs);
      const { success, runId } = await runCrew(localInputs);
      if (success) {
        navigate(runId ? `/results/profile?id=${runId}` : "/results/profile");
      }
    }
  };

  const renderScreenContent = () => {
    if (screen === 0) {
      return (
        <IntakeScreen
          inputs={localInputs}
          onChange={handleInputChange}
          errors={touched ? errors : {}}
        />
      );
    } else {
      // Review screen
      return (
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Review Your Information</h3>
          <div className="grid gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
            <div className="grid gap-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">About You</h4>
              <div className="grid gap-1 text-sm text-slate-600 dark:text-slate-400">
                <p><strong>Time Commitment:</strong> {localInputs.time_commitment || "Not set"}</p>
                <p><strong>Budget Range:</strong> {localInputs.budget_range || "Not set"}</p>
                <p><strong>Risk Tolerance:</strong> {localInputs.risk_tolerance || "Not set"}</p>
                <p><strong>Work Style:</strong> {localInputs.preferred_work_style || "Not set"}</p>
                <p><strong>Startup Style:</strong> {localInputs.startup_style || "Not set"}</p>
                <p><strong>Customer Interaction:</strong> {localInputs.customer_interaction || "Not set"}</p>
                <p><strong>Location:</strong> {localInputs.location_context || "Not set"}</p>
                <p><strong>Business Region:</strong> {localInputs.business_region || "Not set"}</p>
                <p><strong>Skills:</strong> {
                  localInputs.skills ? Object.entries(localInputs.skills)
                    .filter(([cat, val]) => cat !== "other" && Array.isArray(val) && val.length > 0)
                    .map(([cat, val]) => `${cat}: ${val.join(", ")}`)
                    .join("; ") || "None selected"
                    : "Not set"
                }</p>
                {localInputs.skills?.other && (
                  <p><strong>Other Skills:</strong> {localInputs.skills.other}</p>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Interests & Goals</h4>
              <div className="grid gap-1 text-sm text-slate-600 dark:text-slate-400">
                <p><strong>Industry Interest:</strong> {localInputs.industry_interest || "Not set"}</p>
                <p><strong>Sub-Interest:</strong> {localInputs.sub_interest_area || "Not set"}</p>
                <p><strong>Business Type:</strong> {localInputs.business_type || "Not set"}</p>
                <p><strong>Earnings Timeline:</strong> {localInputs.earnings_timeline || "Not set"}</p>
                <p><strong>Founder Ambition:</strong> {localInputs.founder_ambition || "Not set"}</p>
                {localInputs.experience_summary && (
                  <p><strong>Experience:</strong> {localInputs.experience_summary}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  const screenTitles = [
    "Intake Form",
    "Review"
  ];

  const screenDescriptions = [
    "Tell us about your availability, preferences, skills, and interests",
    "Review your information before generating recommendations"
  ];

  const progressPercent = Math.round(((screen + 1) / 2) * 100);

  return (
    <div className="grid gap-12">
      {loading && <DiscoveryLoadingIndicator 
        streamingOutput={streamingOutput} 
        isCached={isCached}
        startTime={requestStartTime}
        duration={requestDuration}
      />}
      <Seo
        title="AI Startup Idea Generator | Startup Idea Advisor"
        description="Provide your goals, availability, and expertise—our AI advisor researches markets and delivers personalized startup recommendations."
        path="/"
        keywords="ai startup idea generator, business idea advisor, personalized startup recommendations"
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Startup Idea Advisor",
            url: "https://startupideaadvisor.com",
            logo: "https://startupideaadvisor.com/logo.png",
            sameAs: [
              "https://www.linkedin.com/company/startup-idea-advisor",
              "https://twitter.com/startupideaAI",
            ],
            contactPoint: {
              "@type": "ContactPoint",
              email: "hello@startupideaadvisor.com",
              contactType: "customer support",
            },
          })}
        </script>
      </Seo>

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500/90 via-brand-600 to-brand-800 p-[1px] shadow-xl shadow-brand-500/25">
        <div className="relative rounded-[calc(1rem-1px)] bg-white/95 dark:bg-slate-800/95 px-6 py-6 sm:px-8">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-900/40 dark:to-brand-800/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300 shadow-sm border border-brand-200/50 dark:border-brand-700/30">
              AI co-pilot for side hustles & founders
            </span>
            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              Share your goals, time, and strengths. Our AI advisor researches markets, evaluates risks, and hands you advisor-grade recommendations within minutes.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 text-sm font-semibold transition-colors shadow-sm"
                >
                  🔧 Auto-Fill Form (Dev Only)
                </button>
                {screen === 0 && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-brand-600 hover:to-brand-700"
                  >
                    Continue to Review (Dev Only)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <form
        id="intake-form"
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-800/95 p-6 shadow-lg backdrop-blur"
      >
        <header className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {screenTitles[screen]}
          </h2>
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {screenDescriptions[screen]}
          </p>
        </header>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            <span>Screen {screen + 1} of 2</span>
            <span>{progressPercent}% complete</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {renderScreenContent()}

        <div className="flex flex-wrap items-center gap-4">
          {screen > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-xl border border-slate-300 dark:border-slate-600 px-5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:border-brand-300 dark:hover:border-brand-500 whitespace-nowrap"
            >
              Back
            </button>
          )}
          {screen < 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-2 text-sm font-medium text-white shadow-md transition hover:from-brand-600 hover:to-brand-700 whitespace-nowrap"
            >
              Continue
            </button>
          )}
          {screen === 1 && (
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-white shadow-md transition hover:from-brand-600 hover:to-brand-700 disabled:cursor-not-allowed disabled:from-brand-300 disabled:to-brand-300 whitespace-nowrap"
            >
              {loading ? "Generating recommendations..." : "Generate recommendations"}
            </button>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <p className="text-xs text-slate-500">
          We never store your inputs. <Link to="/privacy" className="text-brand-600 underline">Read our privacy promises.</Link>
        </p>
        {isAuthenticated && (
          <p className="text-xs text-slate-500 mt-2">
            Want more personalized recommendations?{" "}
            <Link to="/founder-psychology" className="text-brand-600 underline hover:text-brand-700">
              Complete your Founder Psychology profile
            </Link>
          </p>
        )}
      </form>

      <section className="grid gap-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-800/95 p-6 shadow-lg">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Why founders use Startup Idea Advisor</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Personalized insight",
              body: "Ideas are tailored to your skills, budget, time, and appetite for risk—no generic lists.",
            },
            {
              title: "Advisor-grade analysis",
              body: "Each report includes market research, financial outlook, and risk mitigation steps.",
            },
            {
              title: "Faster validation",
              body: "Iterate quickly with saved runs, PDF exports, and 30/60/90 day roadmaps.",
            },
          ].map((item) => (
            <div key={item.title} className="group relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 p-5 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-slate-900">Trusted by builders at</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              quote: "It distilled my 12-year finance career into side-hustle ideas I can test on weekends.",
              name: "Priya S.",
              title: "VP Strategy, FinTech",
            },
            {
              quote: "The platform nailed ideas that fit my budget and network—without me spending weeks researching.",
              name: "Daniel M.",
              title: "Product Lead, HealthTech",
            },
            {
              quote: "Finally an advisor-grade ideation process I can rerun whenever my focus shifts.",
              name: "Lina R.",
              title: "Solo Founder",
            },
          ].map((item) => (
            <blockquote
              key={item.name}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 text-sm text-slate-600 dark:text-slate-300 shadow-sm"
            >
              <p className="italic">"{item.quote}"</p>
              <p className="mt-3 font-semibold text-slate-800 dark:text-slate-200">{item.name}</p>
              <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">{item.title}</p>
            </blockquote>
          ))}
        </div>
      </section>

      {reports && (
        <section className="rounded-3xl border border-brand-200 dark:border-brand-700 bg-brand-50/80 dark:bg-brand-900/30 p-6 text-brand-900 dark:text-brand-300 shadow-inner">
          <h2 className="text-lg font-semibold">Latest report saved</h2>
          <p className="mt-1 text-sm text-brand-700 dark:text-brand-400">
            Visit the dashboard or the tabs above to review your profile summary and recommendations anytime.
          </p>
        </section>
      )}
    </div>
  );
}
