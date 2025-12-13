import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReports } from "../../context/ReportsContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import Seo from "../../components/common/Seo.jsx";
import DiscoveryLoadingIndicator from "../../components/discovery/DiscoveryLoadingIndicator.jsx";
import IntakeScreen from "./IntakeScreen.jsx";
import ReviewScreen from "../../components/discovery/ReviewScreen.jsx";

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
      return <ReviewScreen inputs={localInputs} />;
    }
  };

  // Conversational headers per step
  const conversationalHeaders = [
    {
      title: "Let's start with the basics.",
      description: "These answers reflect your current situation. You can change them anytime and re-run."
    },
    {
      title: "Review what you've shared.",
      description: "Take a moment to review, then I'll work on ideas for you."
    }
  ];

  const screenTitles = [
    "Share your current situation",
    "Review what you've shared"
  ];

  const screenDescriptions = [
    "Help me understand your availability, preferences, skills, and interests",
    "Review your responses before we explore ideas together"
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
        <div className="relative rounded-[calc(1rem-1px)] bg-white px-6 py-6 sm:px-8">
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="mb-4 inline-block px-5 py-2.5 rounded-lg font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all shadow-sm hover:shadow-md"
            >
              ← Back to Dashboard
            </Link>
          )}
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-700 shadow-sm border border-indigo-200">
              AI co-pilot for side hustles & founders
            </span>
            <p className="text-[15px] text-gray-700 leading-relaxed">
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
        className="grid gap-4 rounded-xl border border-gray-200 shadow-sm bg-white p-6 md:p-7"
      >
        {/* Persistent conversational header */}
        <div className="mb-6 rounded-xl border border-gray-200 shadow-sm bg-white p-5 md:p-6">
          <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {conversationalHeaders[screen].title}
          </p>
          <p className="mt-1 text-[15px] text-gray-700 leading-relaxed">
            {conversationalHeaders[screen].description}
          </p>
        </div>

        <header className="space-y-3 relative">
          <div className="absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-indigo-300 opacity-[0.09] blur-2xl pointer-events-none"></div>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
              {screenTitles[screen]}
            </h1>
            <p className="text-[15px] text-gray-700 leading-relaxed mb-8">
              {screenDescriptions[screen]}
            </p>
          </div>
        </header>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            <span>Step {screen + 1} of 2</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {renderScreenContent()}

        {/* End-of-step conversational transition */}
        {screen === 0 && (
          <div className="mt-6 rounded-xl border border-gray-200 shadow-sm bg-white p-5 md:p-6">
            <p className="text-[15px] text-gray-700 leading-relaxed">
              One more step and I'll start exploring ideas for you.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          {screen > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 rounded-lg font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
            >
              Back
            </button>
          )}
          {screen < 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
            >
              Continue
            </button>
          )}
          {screen === 1 && (
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? "Exploring ideas..." : "Explore ideas"}
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
              Share your Founder Profile
            </Link>
          </p>
        )}
      </form>

      {reports && (
        <section className="rounded-xl border border-gray-200 shadow-sm bg-white p-6 md:p-7">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">Latest report saved</h2>
          <p className="mt-1 text-[15px] text-gray-700 leading-relaxed">
            Visit the dashboard or the tabs above to review your profile summary and recommendations anytime.
          </p>
        </section>
      )}
    </div>
  );
}
