import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReports } from "../../context/ReportsContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import Seo from "../../components/common/Seo.jsx";
import DiscoveryLoadingIndicator from "../../components/discovery/DiscoveryLoadingIndicator.jsx";
import DiscoveryCard from "../../components/discovery/DiscoveryCard.jsx";
import DiscoveryHeader from "../../components/discovery/DiscoveryHeader.jsx";
import { DISCOVERY_SPACING, DISCOVERY_TYPOGRAPHY } from "../../components/discovery/DiscoveryTheme.js";
import IntakeScreen from "./IntakeScreen.jsx";
import ReviewScreen from "../../components/discovery/ReviewScreen.jsx";
import FocusLayout from "../../layouts/FocusLayout.jsx";

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
 <FocusLayout
 steps={[{ label: "Intake" }, { label: "Review" }]}
 currentStep={screen}
 >
 <div className={DISCOVERY_SPACING.sectionGapLarge.replace('gap-', 'space-y-')}>
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

 <DiscoveryCard>
 <div className="flex items-start justify-between gap-4">
 <DiscoveryHeader
 step={screen + 1}
 totalSteps={2}
 title={screenTitles[screen]}
 description={screenDescriptions[screen]}
 />
 {process.env.NODE_ENV === "development" ? (
 <button type="button" onClick={handleAutoFill} className="ui-btn ui-btn-secondary focus-visible:outline-accent">
 Auto-Fill (Dev)
 </button>
 ) : null}
 </div>
 </DiscoveryCard>

 <form id="intake-form" onSubmit={handleSubmit}>
 <DiscoveryCard>
 {/* Persistent conversational header */}
 <div className="mb-6">
 <h2 className={DISCOVERY_TYPOGRAPHY.h3}>{conversationalHeaders[screen].title}</h2>
 <p className={`mt-1 ${DISCOVERY_TYPOGRAPHY.subtitle}`}>{conversationalHeaders[screen].description}</p>
 </div>

 <div className="space-y-3">
 <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
 <div
  className="h-full bg-accent transition-all"
 style={{ width: `${progressPercent}%` }}
 />
 </div>
 </div>

 {renderScreenContent()}

 {/* End-of-step conversational transition */}
 {screen === 0 && (
 <div className="mt-6">
 <p className="text-primary text-primary leading-relaxed">
 One more step and I'll start exploring ideas for you.
 </p>
 </div>
 )}

 <footer className="mt-8 flex items-center justify-between border-t border-default pt-6">
 <button type="button" className="ui-btn ui-btn-secondary focus-visible:outline-accent" disabled>
 Save Draft
 </button>
 <div className="flex items-center gap-3">
 {screen > 0 ? (
 <button type="button" onClick={handleBack} className="ui-btn ui-btn-secondary focus-visible:outline-accent" disabled={loading}>
 Back
 </button>
 ) : null}
 {screen < 1 ? (
 <button type="button" onClick={handleNext} className="ui-btn ui-btn-primary focus-visible:outline-accent" disabled={loading}>
 Continue
 </button>
 ) : (
 <button type="submit" disabled={loading} className="ui-btn ui-btn-primary focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed">
 {loading ? "Exploring ideas..." : "Explore ideas"}
 </button>
 )}
 </div>
 </footer>
 {error && <p className={`mt-3 ${DISCOVERY_TYPOGRAPHY.bodySmall} text-accent`}>{error}</p>}
 <p className={DISCOVERY_TYPOGRAPHY.caption}>
 We never store your inputs. <Link to="/privacy" className="text-accent underline">Read our privacy promises.</Link>
 </p>
 {isAuthenticated && (
 <p className={`${DISCOVERY_TYPOGRAPHY.caption} mt-2`}>
 Want more personalized recommendations?{" "}
 <Link to="/founder-psychology" className="text-accent underline hover:text-accent">
 Share your Founder Profile
 </Link>
 </p>
 )}
 </DiscoveryCard>
 </form>

 {reports && (
 <DiscoveryCard>
 <h2 className={`${DISCOVERY_TYPOGRAPHY.h3} flex items-center gap-2`}>Latest report saved</h2>
 <p className={`mt-1 ${DISCOVERY_TYPOGRAPHY.bodySmall}`}>
 Visit the dashboard or the tabs above to review your profile summary and recommendations anytime.
 </p>
 </DiscoveryCard>
 )}
 </div>
 </FocusLayout>
 );
}
