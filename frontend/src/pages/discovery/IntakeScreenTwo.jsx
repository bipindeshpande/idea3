import { useState, useEffect } from "react";

const fieldClasses =
  "w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-4 py-3 text-slate-800 dark:text-slate-200 shadow-sm transition focus:border-brand-400 dark:focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900 text-sm";

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

  useEffect(() => {
    setLocalInputs(inputs || {});
  }, [inputs]);

  const handleChange = (field, value) => {
    const updated = { ...localInputs, [field]: value };
    
    // Handle sub_interest_area based on industry_interest
    if (field === "industry_interest") {
      const subOptions = SUB_INTEREST_MAPPING[value] || [];
      if (subOptions.length === 1 && subOptions[0] === "Custom Sub-Area Text Field") {
        updated.sub_interest_area = "";
      } else {
        updated.sub_interest_area = subOptions[0] || "";
      }
    }
    
    setLocalInputs(updated);
    onChange(updated);
  };

  const industryInterest = localInputs.industry_interest || "";
  const subOptions = SUB_INTEREST_MAPPING[industryInterest] || [];
  const isCustomSubInterest = subOptions.length === 1 && subOptions[0] === "Custom Sub-Area Text Field";

  return (
    <div className="grid gap-4 sm:gap-5">
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
          <option value="Food & Beverage">Food & Beverage</option>
          <option value="Retail & E-commerce">Retail & E-commerce</option>
          <option value="Education">Education</option>
          <option value="Fitness & Sports">Fitness & Sports</option>
          <option value="Kids & Parenting">Kids & Parenting</option>
          <option value="Beauty & Wellness">Beauty & Wellness</option>
          <option value="Home Services">Home Services</option>
          <option value="Travel & Tourism">Travel & Tourism</option>
          <option value="Manufacturing / Crafts">Manufacturing / Crafts</option>
          <option value="Finance / Accounting">Finance / Accounting</option>
          <option value="AI & Automation">AI & Automation</option>
          <option value="Software / SaaS">Software / SaaS</option>
          <option value="Freelancing / Consulting">Freelancing / Consulting</option>
          <option value="Agriculture / Gardening">Agriculture / Gardening</option>
          <option value="Social Impact">Social Impact</option>
          <option value="Local Services">Local Services</option>
          <option value="Other">Other</option>
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
    </div>
  );
}

