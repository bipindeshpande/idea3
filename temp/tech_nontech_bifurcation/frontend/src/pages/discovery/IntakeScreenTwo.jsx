import { useState, useEffect } from "react";
import { filterInterestAreas, filterSubcategories } from "../../utils/startupCategoryConfig.js";

const fieldClasses =
  "w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-4 py-3 text-slate-800 dark:text-slate-200 shadow-sm transition focus:border-brand-400 dark:focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900 text-sm";

const STORAGE_KEY = "dev_intake_form_screen_two";

// Sample data for development auto-fill
const SAMPLE_INPUTS = {
  industry_interest: "AI & Automation",
  sub_interest_area: "Chatbots",
  business_type: "Digital product",
  earnings_timeline: "90 days",
  founder_ambition: "Full-time business",
  experience_summary: "10 years in software development, experience with AI/ML projects, strong background in building SaaS products and managing technical teams."
};

// Sub-interest mapping (expanded from existing)
const SUB_INTEREST_MAPPING = {
  "Food & Beverage": [
    "Restaurant/Cafe", "Food Delivery", "Meal Prep", "Beverage Brand", "Catering", "Food Tech"
  ],
  "Retail & E-commerce": [
    "D2C Brand", "Dropshipping", "Print-on-Demand", "Marketplace", "Subscription Box", "B2B Wholesale"
  ],
  "Education": [
    "Online Courses", "Coaching Platforms", "Tutoring", "Skill Assessment", "Gamified Learning", "AI Learning"
  ],
  "Fitness & Sports": [
    "Fitness App", "Personal Training", "Sports Equipment", "Wellness Coaching", "Nutrition Planning"
  ],
  "Kids & Parenting": [
    "Educational Toys", "Parenting Apps", "Childcare Services", "Kids Activities", "Family Products"
  ],
  "Beauty & Wellness": [
    "Skincare Brand", "Beauty Services", "Wellness App", "Spa Services", "Beauty Tech"
  ],
  "Home Services": [
    "Cleaning", "Handyman", "Landscaping", "Home Automation", "Interior Design", "Maintenance"
  ],
  "Travel & Tourism": [
    "Travel Planning", "Local Experiences", "Accommodation", "Travel Tech", "Tourism Services"
  ],
  "Manufacturing / Crafts": [
    "Custom Products", "Handmade Goods", "3D Printing", "Craft Supplies", "Artisan Marketplace"
  ],
  "Finance / Accounting": [
    "Personal Finance", "Small Business Finance", "Tax Services", "Investment Tools", "Financial Planning"
  ],
  "AI & Automation": [
    "Chatbots", "Workflow Automation", "Predictive Analytics", "AI Tools", "Process Automation"
  ],
  "Software / SaaS": [
    "B2B SaaS", "Productivity Tools", "Developer Tools", "Business Software", "Platform Services"
  ],
  "Freelancing / Consulting": [
    "Consulting Services", "Freelance Marketplace", "Expert Network", "Business Advisory", "Professional Services"
  ],
  "Agriculture / Gardening": [
    "Urban Farming", "Garden Services", "Agricultural Tech", "Plant Care", "Sustainable Farming"
  ],
  "Social Impact": [
    "Non-profit", "Social Enterprise", "Community Services", "Environmental Solutions", "Charity Tech"
  ],
  "Local Services": [
    "Local Marketplace", "Community Services", "Neighborhood Services", "Local Delivery", "Community Events"
  ],
  "Other": ["Custom Sub-Area Text Field"]
};

export default function IntakeScreenTwo({ inputs, onChange, errors = {} }) {
  const [localInputs, setLocalInputs] = useState(inputs || {});

  // Load from localStorage on mount (dev only) - only if inputs are empty
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && (!inputs || Object.keys(inputs).length === 0)) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setLocalInputs(parsed);
          onChange(parsed);
        }
      } catch (e) {
        console.warn("Failed to load intake form from localStorage:", e);
      }
    }
  }, []); // Only run on mount

  // Sync with parent inputs
  useEffect(() => {
    if (inputs && Object.keys(inputs).length > 0) {
      setLocalInputs(inputs);
    }
  }, [inputs]);

  // Save to localStorage on change (dev only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && localInputs && Object.keys(localInputs).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localInputs));
      } catch (e) {
        console.warn("Failed to save intake form to localStorage:", e);
      }
    }
  }, [localInputs]);

  const handleChange = (field, value) => {
    const updated = { ...localInputs, [field]: value };
    
    // Handle startup_category change - clear industry/sub if they become invalid
    if (field === "startup_category") {
      const currentIndustry = updated.industry_interest;
      if (currentIndustry) {
        const allIndustries = Object.keys(SUB_INTEREST_MAPPING);
        const filteredIndustries = filterInterestAreas(allIndustries, value);
        if (!filteredIndustries.includes(currentIndustry)) {
          updated.industry_interest = "";
          updated.sub_interest_area = "";
        } else {
          // Industry is still valid, but check subcategory
          const currentSub = updated.sub_interest_area;
          if (currentSub) {
            const allSubs = SUB_INTEREST_MAPPING[currentIndustry] || [];
            const filteredSubs = filterSubcategories(allSubs, currentIndustry, value);
            if (!filteredSubs.includes(currentSub)) {
              updated.sub_interest_area = "";
            }
          }
        }
      }
    }
    
    // Handle sub_interest_area based on industry_interest
    if (field === "industry_interest") {
      const subOptions = SUB_INTEREST_MAPPING[value] || [];
      const startupCategory = updated.startup_category || localInputs.startup_category;
      const filteredSubs = filterSubcategories(subOptions, value, startupCategory);
      
      if (filteredSubs.length === 1 && filteredSubs[0] === "Custom Sub-Area Text Field") {
        updated.sub_interest_area = "";
      } else {
        updated.sub_interest_area = filteredSubs[0] || "";
      }
    }
    
    setLocalInputs(updated);
    onChange(updated);
  };

  const startupCategory = localInputs.startup_category || "";
  const industryInterest = localInputs.industry_interest || "";
  
  // Get ALL interest areas (static, hardcoded - no API calls)
  const allInterestAreas = Object.keys(SUB_INTEREST_MAPPING);
  
  // Filter interest areas based on startup_category (only if category is selected)
  // If no category selected, show all areas
  const filteredInterestAreas = startupCategory 
    ? filterInterestAreas(allInterestAreas, startupCategory)
    : allInterestAreas;
  
  // Get ALL subcategories for selected industry (static, hardcoded - no API calls)
  const allSubOptions = SUB_INTEREST_MAPPING[industryInterest] || [];
  
  // Filter subcategories based on startup_category (only if category is selected)
  // If no category selected, show all subcategories
  const subOptions = startupCategory && industryInterest
    ? filterSubcategories(allSubOptions, industryInterest, startupCategory)
    : allSubOptions;
  const isCustomSubInterest = subOptions.length === 1 && subOptions[0] === "Custom Sub-Area Text Field";

  return (
    <div className="grid gap-4 sm:gap-5">
      {/* Startup Category - FIRST FIELD */}
      <div className="grid gap-1.5">
        <label htmlFor="startup_category" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
          Startup Category <span className="text-brand-500">*</span>
        </label>
        <select
          id="startup_category"
          className={fieldClasses}
          value={startupCategory}
          onChange={(e) => handleChange("startup_category", e.target.value)}
        >
          <option value="">Select...</option>
          <option value="tech">Tech (Software, AI, Digital Products)</option>
          <option value="non_tech">Non-Tech (Physical, Service-Based, Offline)</option>
          <option value="both">Both (Open to Any Type)</option>
        </select>
        {errors.startup_category && (
          <p className="text-xs text-red-500">{errors.startup_category}</p>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400">
          This helps us show you relevant startup ideas. Select "Both" if you're open to any type.
        </p>
      </div>

      {/* Industry Interest - Full width */}
      <div className="grid gap-1.5">
        <label htmlFor="industry_interest" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
          Industry Interest <span className="text-brand-500">*</span>
        </label>
        <select
          id="industry_interest"
          className={fieldClasses}
          value={industryInterest}
          onChange={(e) => handleChange("industry_interest", e.target.value)}
        >
          <option value="">Select...</option>
          {filteredInterestAreas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
        {errors.industry_interest && (
          <p className="text-xs text-red-500">{errors.industry_interest}</p>
        )}
      </div>

      {/* Sub-Interest Area - Full width */}
      {industryInterest && (
        <div className="grid gap-1.5">
          <label htmlFor="sub_interest_area" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            Sub-Interest Area {!isCustomSubInterest && <span className="text-brand-500">*</span>}
          </label>
          {isCustomSubInterest ? (
            <input
              id="sub_interest_area"
              type="text"
              className={fieldClasses}
              value={localInputs.sub_interest_area || ""}
              onChange={(e) => handleChange("sub_interest_area", e.target.value)}
              placeholder="Describe your specific focus area"
            />
          ) : (
            <select
              id="sub_interest_area"
              className={fieldClasses}
              value={localInputs.sub_interest_area || ""}
              onChange={(e) => handleChange("sub_interest_area", e.target.value)}
            >
              <option value="">Select...</option>
              {subOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
          {errors.sub_interest_area && (
            <p className="text-xs text-red-500">{errors.sub_interest_area}</p>
          )}
        </div>
      )}

      {/* Business Type and Earnings Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <label htmlFor="business_type" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            Business Type <span className="text-brand-500">*</span>
          </label>
          <select
            id="business_type"
            className={fieldClasses}
            value={localInputs.business_type || ""}
            onChange={(e) => handleChange("business_type", e.target.value)}
          >
            <option value="">Select...</option>
            <option value="Product">Product</option>
            <option value="Service">Service</option>
            <option value="Digital product">Digital product</option>
            <option value="Subscription">Subscription</option>
            <option value="Marketplace">Marketplace</option>
            <option value="Consulting">Consulting</option>
            <option value="No preference">No preference</option>
          </select>
          {errors.business_type && (
            <p className="text-xs text-red-500">{errors.business_type}</p>
          )}
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="earnings_timeline" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            Earnings Timeline <span className="text-brand-500">*</span>
          </label>
          <select
            id="earnings_timeline"
            className={fieldClasses}
            value={localInputs.earnings_timeline || ""}
            onChange={(e) => handleChange("earnings_timeline", e.target.value)}
          >
            <option value="">Select...</option>
            <option value="30 days">30 days</option>
            <option value="60 days">60 days</option>
            <option value="90 days">90 days</option>
            <option value="6+ months">6+ months</option>
          </select>
          {errors.earnings_timeline && (
            <p className="text-xs text-red-500">{errors.earnings_timeline}</p>
          )}
        </div>
      </div>

      {/* Founder Ambition - Full width */}
      <div className="grid gap-1.5">
        <label htmlFor="founder_ambition" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
          Founder Ambition <span className="text-brand-500">*</span>
        </label>
        <select
          id="founder_ambition"
          className={fieldClasses}
          value={localInputs.founder_ambition || ""}
          onChange={(e) => handleChange("founder_ambition", e.target.value)}
        >
          <option value="">Select...</option>
          <option value="Side income">Side income</option>
          <option value="Part-time business">Part-time business</option>
          <option value="Full-time business">Full-time business</option>
          <option value="Scalable venture">Scalable venture</option>
          <option value="Turn hobby into business">Turn hobby into business</option>
        </select>
        {errors.founder_ambition && (
          <p className="text-xs text-red-500">{errors.founder_ambition}</p>
        )}
      </div>

      {/* Experience Summary - Full width */}
      <div className="grid gap-1.5">
        <label htmlFor="experience_summary" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
          Experience Summary
        </label>
        <textarea
          id="experience_summary"
          className={fieldClasses}
          rows="3"
          value={localInputs.experience_summary || ""}
          onChange={(e) => handleChange("experience_summary", e.target.value)}
          placeholder="e.g., 15 yrs project management in IT, experience with SaaS products, strong in team leadership"
          maxLength={500}
        />
        <p className="text-xs text-slate-500">
          {(localInputs.experience_summary || "").length}/500 characters
        </p>
        {errors.experience_summary && (
          <p className="text-xs text-red-500">{errors.experience_summary}</p>
        )}
      </div>

      {/* Dev-only Auto-Fill Button */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => {
              const updated = { ...SAMPLE_INPUTS };
              // Handle sub_interest_area based on industry_interest
              const subOptions = SUB_INTEREST_MAPPING[updated.industry_interest] || [];
              if (subOptions.length === 1 && subOptions[0] === "Custom Sub-Area Text Field") {
                updated.sub_interest_area = "";
              } else {
                updated.sub_interest_area = subOptions[0] || "";
              }
              setLocalInputs(updated);
              onChange(updated);
            }}
            className="w-full rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 text-sm font-semibold transition-colors shadow-sm"
          >
            🔧 Auto-Fill Sample Inputs (Dev Only)
          </button>
        </div>
      )}
    </div>
  );
}

