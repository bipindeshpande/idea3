import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReports } from "../../context/ReportsContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import Seo from "../../components/common/Seo.jsx";
import DiscoveryLoadingIndicator from "../../components/discovery/DiscoveryLoadingIndicator.jsx";
import DiscoveryHeader from "../../components/discovery/DiscoveryHeader.jsx";
import { DISCOVERY_SPACING, DISCOVERY_TYPOGRAPHY } from "../../components/discovery/DiscoveryTheme.js";
import IntakeScreen from "./IntakeScreen.jsx";
import ReviewScreen from "../../components/discovery/ReviewScreen.jsx";
import Stepper from "../../components/Stepper.jsx";
import { CONTACT_EMAIL } from "../../constants/contact.js";
import { ToastContainer } from "../../components/common/Toast.jsx";
import { useToast } from "../../hooks/useToast.js";
import CacheIndicator from "../../components/common/CacheIndicator.jsx";

const DRAFT_STORAGE_KEY = "discovery_draft";

export default function HomePage() {
 const navigate = useNavigate();
 const { inputs, setInputs, loading, error, runCrew, reports, streamingOutput, isCached, requestStartTime, requestDuration, cancelRequest } = useReports();
 const { isAuthenticated } = useAuth();
 const { toasts, addToast, removeToast } = useToast();
 const [localInputs, setLocalInputs] = useState(inputs || {});
 const [screen, setScreen] = useState(0); // 0 = Form, 1 = Review
 const [errors, setErrors] = useState({});
 const [touched, setTouched] = useState(false);
 const [hasDraft, setHasDraft] = useState(false);

 useEffect(() => {
 setLocalInputs(inputs || {});
 setScreen(0);
 setTouched(false);
 setErrors({});
 }, [inputs]);

 // Check for existing draft on mount
 useEffect(() => {
 const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
 if (savedDraft) {
  try {
   const draftData = JSON.parse(savedDraft);
   // Remove metadata
   const { _savedAt, ...cleanDraft } = draftData;
   if (cleanDraft && Object.keys(cleanDraft).length > 0) {
    setHasDraft(true);
    // Only auto-load if no inputs are already set
    if (!inputs || Object.keys(inputs).length === 0) {
     setLocalInputs(cleanDraft);
    }
   } else {
    // Draft is empty, remove it
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasDraft(false);
   }
  } catch (e) {
   console.error("Error loading draft:", e);
   localStorage.removeItem(DRAFT_STORAGE_KEY);
   setHasDraft(false);
  }
 } else {
  setHasDraft(false);
 }
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
 if (screen > 0) {
 setTouched(false);
 setErrors({});
 setScreen((prev) => prev - 1);
 } else {
 navigate("/dashboard");
 }
 };

 // Dev-only auto-fill handler
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

 // 5 different preset profiles for auto-fill
 const PRESET_PROFILES = {
 "tech": {
 name: "Tech Entrepreneur",
 inputs: {
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
 }
 },
 "food": {
 name: "Food & Beverage Founder",
 inputs: {
 startup_category: "non_tech",
 time_commitment: "Full-time",
 budget_range: "$5,000–20,000",
 risk_tolerance: "Moderate",
 preferred_work_style: "People-facing / Service-oriented",
 startup_style: "Local service business",
 customer_interaction: "Very comfortable",
 location_context: "Urban",
 business_region: "United States / Canada",
 skills: {
 product_creation: ["Cooking / Food Prep"],
 sales_marketing: ["Social Media", "Customer Interaction", "Community Building"],
 operational: ["Inventory Management", "Time Management"],
 digital: ["Web Building"],
 personality: ["Empathy", "Problem Solving"],
 other: ""
 },
 industry_interest: "Food & Beverage",
 sub_interest_area: "Meal Prep",
 business_type: "Service",
 earnings_timeline: "6+ months",
 founder_ambition: "Full-time business",
 experience_summary: "5 years in food service industry, experience with meal planning and food preparation, passionate about healthy eating and nutrition."
 }
 },
 "creative": {
 name: "Creative/Handmade Business",
 inputs: {
 startup_category: "non_tech",
 time_commitment: "10–20 hrs/week",
 budget_range: "$1,000–5,000",
 risk_tolerance: "Low",
 preferred_work_style: "Creative / Maker work",
 startup_style: "Home-based business",
 customer_interaction: "Somewhat comfortable",
 location_context: "Suburban",
 business_region: "United States / Canada",
 skills: {
 product_creation: ["Crafting / Handmade", "Photography / Videography"],
 sales_marketing: ["Social Media", "SEO / Blogging"],
 operational: ["Budgeting", "Time Management"],
 digital: ["Web Building"],
 personality: ["Empathy", "Problem Solving"],
 other: ""
 },
 industry_interest: "Manufacturing / Crafts",
 sub_interest_area: "Handmade Goods",
 business_type: "Product",
 earnings_timeline: "90 days",
 founder_ambition: "Side income",
 experience_summary: "8 years of crafting experience, skilled in creating handmade products, strong social media presence with engaged community."
 }
 },
 "service": {
 name: "Service-Based Business",
 inputs: {
 startup_category: "non_tech",
 time_commitment: "Full-time",
 budget_range: "$0–100",
 risk_tolerance: "Low",
 preferred_work_style: "People-facing / Service-oriented",
 startup_style: "Local service business",
 customer_interaction: "Very comfortable",
 location_context: "Urban",
 business_region: "United States / Canada",
 skills: {
 product_creation: ["Beauty Services"],
 sales_marketing: ["Customer Interaction", "Community Building", "Marketing / Advertising"],
 operational: ["Time Management", "Project Management"],
 digital: ["Web Building"],
 personality: ["Empathy", "Leadership", "Persuasion"],
 other: ""
 },
 industry_interest: "Home Services",
 sub_interest_area: "Cleaning",
 business_type: "Service",
 earnings_timeline: "60 days",
 founder_ambition: "Full-time business",
 experience_summary: "12 years in customer service, experience managing teams, strong interpersonal skills and attention to detail."
 }
 },
 "ecommerce": {
 name: "E-commerce/D2C Brand",
 inputs: {
 startup_category: "non_tech",
 time_commitment: "10–20 hrs/week",
 budget_range: "$5,000–20,000",
 risk_tolerance: "Moderate",
 preferred_work_style: "Remote-friendly",
 startup_style: "Online-only business",
 customer_interaction: "Somewhat comfortable",
 location_context: "Urban",
 business_region: "United States / Canada",
 skills: {
 product_creation: ["Graphic Design", "Writing / Content"],
 sales_marketing: ["Social Media", "Marketing / Advertising", "SEO / Blogging"],
 operational: ["Inventory Management", "Budgeting", "Project Management"],
 digital: ["Web Building", "Low-code / No-code"],
 personality: ["Problem Solving", "Leadership"],
 other: ""
 },
 industry_interest: "Retail & E-commerce",
 sub_interest_area: "D2C Brand",
 business_type: "Product",
 earnings_timeline: "6+ months",
 founder_ambition: "Full-time business",
 experience_summary: "7 years in marketing and branding, experience with e-commerce platforms, strong understanding of digital marketing and customer acquisition."
 }
 }
 };

 const handleAutoFill = (presetKey = "tech") => {
 const preset = PRESET_PROFILES[presetKey];
 if (!preset) return;

 const updated = { ...preset.inputs };
 
 // Ensure sub_interest_area is set correctly based on industry_interest
 // If preset already has sub_interest_area, verify it's valid for the industry
 // Otherwise, set it to the first available option
 if (updated.industry_interest) {
 const subOptions = SUB_INTEREST_MAPPING[updated.industry_interest] || [];
 if (subOptions.length === 1 && subOptions[0] === "Custom Sub-Area Text Field") {
 updated.sub_interest_area = "";
 } else {
 // Use preset's sub_interest_area if it's valid, otherwise use first option
 const presetSub = updated.sub_interest_area;
 if (presetSub && subOptions.includes(presetSub)) {
 // Keep the preset value
 } else {
 updated.sub_interest_area = subOptions[0] || "";
 }
 }
 }
 
 // Ensure all required fields are present
 // Double-check that skills object has at least one skill selected
 const skills = updated.skills || {};
 const hasSkills = Object.keys(skills).some(category => {
 if (category === "other") return skills[category] && skills[category].trim();
 return Array.isArray(skills[category]) && skills[category].length > 0;
 });
 
 if (!hasSkills) {
 // This shouldn't happen with presets, but add a fallback
 console.warn(`Preset ${presetKey} has no skills selected`);
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

 const handleSaveDraft = () => {
 try {
  // Check if there's any meaningful data to save
  const hasData = Object.keys(localInputs).some(key => {
   const value = localInputs[key];
   if (!value) return false;
   if (typeof value === "string" && value.trim() === "") return false;
   if (typeof value === "object" && !Array.isArray(value)) {
    // Check if skills object has any selected skills
    if (key === "skills") {
     return Object.values(value).some(v => {
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === "string") return v.trim() !== "";
      return Boolean(v);
     });
    }
    return Object.keys(value).length > 0;
   }
   return true;
  });

  if (!hasData) {
   addToast("No data to save. Please fill in the form first.", "error");
   return;
  }

  // Save draft with timestamp
  const draftData = {
   ...localInputs,
   _savedAt: new Date().toISOString()
  };
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
  setHasDraft(true);
  addToast("Draft saved successfully!", "success");
 } catch (e) {
  console.error("Error saving draft:", e);
  addToast("Failed to save draft. Please try again.", "error");
 }
 };

 const handleLoadDraft = () => {
 try {
  const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
  if (!savedDraft) {
   addToast("No saved draft found.", "error");
   return;
  }

  const draftData = JSON.parse(savedDraft);
  // Remove metadata
  const { _savedAt, ...cleanDraft } = draftData;
  setLocalInputs(cleanDraft);
  setScreen(0); // Reset to first screen
  setTouched(false);
  setErrors({});
  addToast("Draft loaded successfully!", "success");

  // Scroll to form
  setTimeout(() => {
   const formElement = document.getElementById("intake-form");
   if (formElement) {
    formElement.scrollIntoView({ behavior: "smooth", block: "start" });
   }
  }, 100);
 } catch (e) {
  console.error("Error loading draft:", e);
  addToast("Failed to load draft. Please try again.", "error");
  localStorage.removeItem(DRAFT_STORAGE_KEY);
  setHasDraft(false);
 }
 };

 const handleClearDraft = () => {
 if (window.confirm("Are you sure you want to delete the saved draft?")) {
  localStorage.removeItem(DRAFT_STORAGE_KEY);
  setHasDraft(false);
  addToast("Draft deleted.", "success");
 }
 };

 const handleSubmit = async (event, discoveryMode = 'standard') => {
 event.preventDefault();
 if (screen === 1) {
 setInputs(localInputs);
 // Clear draft after successful submission
 localStorage.removeItem(DRAFT_STORAGE_KEY);
 setHasDraft(false);
 
 // Add discovery_mode to inputs
 const enrichedInputs = {
  ...localInputs,
  discovery_mode: discoveryMode
 };
 
 const { success, runId } = await runCrew(enrichedInputs);
 if (success) {
 navigate(runId ? `/dashboard/profile?id=${runId}` : "/dashboard/profile");
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
 description: ""
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
 const discoverySteps = [{ label: "Intake" }, { label: "Review" }];

 return (
 <>
 <Seo
 title="AI Startup Idea Generator | Startup Idea Advisor"
 description="Provide your goals, availability, and expertise—our AI advisor researches markets and delivers personalized startup recommendations."
 path="/advisor"
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
 email: CONTACT_EMAIL,
 contactType: "customer support",
 },
 })}
 </script>
 </Seo>

 {/* Stepper - shown at top of workspace content */}
 <div className="mb-6">
 <Stepper steps={discoverySteps} current={screen} />
 </div>

 <div className={DISCOVERY_SPACING.sectionGapLarge.replace('gap-', 'space-y-')}>
 {loading && <DiscoveryLoadingIndicator 
 streamingOutput={streamingOutput} 
 isCached={isCached}
 startTime={requestStartTime}
 duration={requestDuration}
 onCancel={cancelRequest}
 />}

 <form id="intake-form" onSubmit={handleSubmit}>
 <div className="flex items-start justify-between gap-4 mb-6">
 <DiscoveryHeader
 step={screen + 1}
 totalSteps={2}
 title={screenTitles[screen]}
 description={screenDescriptions[screen]}
 />
 <div className="flex items-center gap-2">
 <label htmlFor="preset-select" className="text-sm text-secondary whitespace-nowrap">
 Quick Fill:
 </label>
 <select
 id="preset-select"
 onChange={(e) => {
 if (e.target.value) {
 handleAutoFill(e.target.value);
 e.target.value = ""; // Reset dropdown after selection
 }
 }}
 className="ui-field text-sm focus-visible:outline-accent min-w-[200px]"
 defaultValue=""
 >
 <option value="">Select a profile...</option>
 <option value="tech">Tech Entrepreneur</option>
 <option value="food">Food & Beverage Founder</option>
 <option value="creative">Creative/Handmade Business</option>
 <option value="service">Service-Based Business</option>
 <option value="ecommerce">E-commerce/D2C Brand</option>
 </select>
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
 <div className="flex items-center gap-2">
  <button 
   type="button" 
   onClick={handleSaveDraft}
   className="ui-btn ui-btn-secondary focus-visible:outline-accent"
   disabled={loading}
  >
   Save Draft
  </button>
  {hasDraft && (
   <>
    <button 
     type="button" 
     onClick={handleLoadDraft}
     className="ui-btn ui-btn-secondary focus-visible:outline-accent text-sm"
     disabled={loading}
     title="Load saved draft"
    >
     Load Draft
    </button>
    <button 
     type="button" 
     onClick={handleClearDraft}
     className="ui-btn ui-btn-secondary focus-visible:outline-accent text-sm opacity-60 hover:opacity-100"
     disabled={loading}
     title="Delete saved draft"
     aria-label="Delete draft"
    >
     ×
    </button>
   </>
  )}
 </div>
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
 <>
 <button 
  type="button"
  onClick={(e) => handleSubmit(e, 'standard')}
  disabled={loading} 
  className="ui-btn ui-btn-secondary focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed"
  title="Fast recommendations using curated templates (~15-20s)"
 >
  {loading ? "Exploring..." : "⚡ Discover Fast"}
 </button>
 <button 
  type="button"
  onClick={(e) => handleSubmit(e, 'ai_first')}
  disabled={loading} 
  className="ui-btn ui-btn-primary focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed"
  title="AI-powered personalized recommendations (~30-40s)"
 >
  {loading ? "Generating..." : "✨ Discover with AI"}
 </button>
 </>
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
 </form>

 {reports && (
 <div>
 <h2 className={`${DISCOVERY_TYPOGRAPHY.h3} flex items-center gap-2`}>Latest report saved</h2>
 <p className={`mt-1 ${DISCOVERY_TYPOGRAPHY.bodySmall}`}>
 Visit the dashboard or the tabs above to review your profile summary and recommendations anytime.
 </p>
 </div>
 )}
 </div>

 <CacheIndicator isCached={isCached} />
 <ToastContainer toasts={toasts} onRemove={removeToast} />
 </>
 );
}
