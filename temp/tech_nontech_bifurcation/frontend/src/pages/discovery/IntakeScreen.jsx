import { useState, useEffect } from "react";
import { filterInterestAreas, filterSubcategories, filterSkillCategories } from "../../utils/startupCategoryConfig.js";

const fieldClasses =
  "w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-4 py-3 text-slate-800 dark:text-slate-200 shadow-sm transition focus:border-brand-400 dark:focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900 text-sm";

const STORAGE_KEY = "dev_intake_form";

// Sub-interest mapping
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

// Combined sample data for development auto-fill
const SAMPLE_INPUTS = {
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

export default function IntakeScreen({ inputs, onChange, errors = {} }) {
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

  // Sync with parent inputs when they change
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

  // All skills (static, hardcoded - no API calls) - defined here so it's accessible in handleChange
  const allSkillCategories = {
    product_creation: [
      "Cooking / Food Prep",
      "Crafting / Handmade",
      "Beauty Services",
      "Fitness Coaching",
      "Photography / Videography",
      "Writing / Content",
      "Graphic Design",
      "Coding",
      "AI & Automation"
    ],
    sales_marketing: [
      "Social Media",
      "Customer Interaction",
      "Community Building",
      "Marketing / Advertising",
      "SEO / Blogging"
    ],
    operational: [
      "Budgeting",
      "Inventory Management",
      "Logistics",
      "Teaching / Coaching",
      "Time Management",
      "Project Management"
    ],
    digital: [
      "AI Tools",
      "Low-code / No-code",
      "Web Building",
      "Automation",
      "Data Analysis"
    ],
    personality: [
      "Empathy",
      "Leadership",
      "Problem Solving",
      "Team Building",
      "Persuasion"
    ]
  };

  const handleChange = (field, value) => {
    const updated = { ...localInputs, [field]: value };
    
    // Handle startup_category change - clear industry/sub and invalid skills
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
      
      // Clear invalid skills based on new category
      const currentSkills = updated.skills || {};
      const filteredSkillCategories = filterSkillCategories(allSkillCategories, value);
      const cleanedSkills = {};
      
      for (const [category, skills] of Object.entries(currentSkills)) {
        if (category === "other") {
          cleanedSkills[category] = skills; // Keep "other" as is
        } else if (Array.isArray(skills)) {
          // Filter skills to only include those valid for the new category
          const validSkillsForCategory = filteredSkillCategories[category] || [];
          cleanedSkills[category] = skills.filter(skill => validSkillsForCategory.includes(skill));
        } else {
          cleanedSkills[category] = skills;
        }
      }
      
      updated.skills = cleanedSkills;
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

  const handleMultiSelect = (category, skill) => {
    const currentSkills = localInputs.skills || {};
    const categorySkills = currentSkills[category] || [];
    const updated = categorySkills.includes(skill)
      ? categorySkills.filter(s => s !== skill)
      : [...categorySkills, skill];
    
    const updatedSkills = { ...currentSkills, [category]: updated };
    const updatedInputs = { ...localInputs, skills: updatedSkills };
    setLocalInputs(updatedInputs);
    onChange(updatedInputs);
  };

  const skillCategoryLabels = {
    product_creation: "Product Creation Skills",
    sales_marketing: "Sales & Marketing Skills",
    operational: "Operational Skills",
    digital: "Digital Skills",
    personality: "Personality Strengths",
  };

  const startupCategory = localInputs.startup_category || "";
  const industryInterest = localInputs.industry_interest || "";
  
  // Filter skill categories based on startup_category
  // If no category selected, show all skills
  const skillCategories = startupCategory
    ? filterSkillCategories(allSkillCategories, startupCategory)
    : allSkillCategories;
  
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

      {/* First row: Time Commitment, Budget Range, Risk Tolerance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="grid gap-1.5">
          <label htmlFor="time_commitment" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            Time Commitment <span className="text-brand-500">*</span>
          </label>
          <select
            id="time_commitment"
            className={fieldClasses}
            value={localInputs.time_commitment || ""}
            onChange={(e) => handleChange("time_commitment", e.target.value)}
          >
            <option value="">Select...</option>
            <option value="< 5 hrs/week">&lt; 5 hrs/week</option>
            <option value="5–10 hrs/week">5–10 hrs/week</option>
            <option value="10–20 hrs/week">10–20 hrs/week</option>
            <option value="Full-time">Full-time</option>
          </select>
          {errors.time_commitment && (
            <p className="text-xs text-red-500">{errors.time_commitment}</p>
          )}
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="budget_range" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            Budget Range <span className="text-brand-500">*</span>
          </label>
          <select
            id="budget_range"
            className={fieldClasses}
            value={localInputs.budget_range || ""}
            onChange={(e) => handleChange("budget_range", e.target.value)}
          >
            <option value="">Select...</option>
            <option value="$0–100">$0–100</option>
            <option value="$100–1,000">$100–1,000</option>
            <option value="$1,000–5,000">$1,000–5,000</option>
            <option value="$5,000–20,000">$5,000–20,000</option>
            <option value="$20,000+">$20,000+</option>
          </select>
          {errors.budget_range && (
            <p className="text-xs text-red-500">{errors.budget_range}</p>
          )}
        </div>

        <div className="grid gap-1.5 sm:col-span-2 lg:col-span-1">
          <label htmlFor="risk_tolerance" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            Risk Tolerance <span className="text-brand-500">*</span>
          </label>
          <select
            id="risk_tolerance"
            className={fieldClasses}
            value={localInputs.risk_tolerance || ""}
            onChange={(e) => handleChange("risk_tolerance", e.target.value)}
          >
            <option value="">Select...</option>
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
          </select>
          {errors.risk_tolerance && (
            <p className="text-xs text-red-500">{errors.risk_tolerance}</p>
          )}
        </div>
      </div>

      {/* Skills Section */}
      <div className="grid gap-4">
        <div>
          <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Entrepreneurial Capabilities <span className="text-brand-500">*</span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            These skills help us tailor ideas to your capabilities. Select all that apply.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(skillCategories).map(([category, skills]) => (
            <div 
              key={category} 
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 space-y-3 shadow-sm"
            >
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {skillCategoryLabels[category]}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => {
                  const isSelected = (localInputs.skills?.[category] || []).includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleMultiSelect(category, skill)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                        isSelected
                          ? "bg-brand-500 text-white shadow-md shadow-brand-500/20 ring-2 ring-brand-200 dark:ring-brand-800"
                          : "bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-brand-300 dark:hover:border-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
          <label htmlFor="skills_other" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Additional Skills
          </label>
          <input
            id="skills_other"
            type="text"
            className={fieldClasses}
            value={localInputs.skills?.other || ""}
            onChange={(e) => {
              const updatedSkills = { ...localInputs.skills, other: e.target.value };
              handleChange("skills", updatedSkills);
            }}
            placeholder="e.g., Photography, Consulting"
          />
        </div>
        {errors.skills && (
          <p className="text-xs text-red-500 mt-1">{errors.skills}</p>
        )}
      </div>

      {/* Preferred Work Style and Startup Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <label htmlFor="preferred_work_style" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            Preferred Work Style <span className="text-brand-500">*</span>
          </label>
          <select
            id="preferred_work_style"
            className={fieldClasses}
            value={localInputs.preferred_work_style || ""}
            onChange={(e) => handleChange("preferred_work_style", e.target.value)}
          >
            <option value="">Select...</option>
            <option value="Independent / Solo">Independent / Solo</option>
            <option value="Small collaborative team">Small collaborative team</option>
            <option value="Hands-on / Active work">Hands-on / Active work</option>
            <option value="Creative / Maker work">Creative / Maker work</option>
            <option value="People-facing / Service-oriented">People-facing / Service-oriented</option>
            <option value="Remote-friendly">Remote-friendly</option>
            <option value="Flexible / No preference">Flexible / No preference</option>
          </select>
          {errors.preferred_work_style && (
            <p className="text-xs text-red-500">{errors.preferred_work_style}</p>
          )}
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="startup_style" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            Startup Style <span className="text-brand-500">*</span>
          </label>
          <select
            id="startup_style"
            className={fieldClasses}
            value={localInputs.startup_style || ""}
            onChange={(e) => handleChange("startup_style", e.target.value)}
          >
            <option value="">Select...</option>
            <option value="Home-based business">Home-based business</option>
            <option value="Local service business">Local service business</option>
            <option value="Online-only business">Online-only business</option>
            <option value="Content / creator-led business">Content / creator-led business</option>
            <option value="Low-cost / bootstrapped">Low-cost / bootstrapped</option>
            <option value="Tech-assisted but not tech-intensive">Tech-assisted but not tech-intensive</option>
            <option value="Community-driven / local engagement">Community-driven / local engagement</option>
          </select>
          {errors.startup_style && (
            <p className="text-xs text-red-500">{errors.startup_style}</p>
          )}
        </div>
      </div>

      {/* Customer Interaction and Location Context */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <label htmlFor="customer_interaction" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            Customer Interaction <span className="text-brand-500">*</span>
          </label>
          <select
            id="customer_interaction"
            className={fieldClasses}
            value={localInputs.customer_interaction || ""}
            onChange={(e) => handleChange("customer_interaction", e.target.value)}
          >
            <option value="">Select...</option>
            <option value="Very comfortable">Very comfortable</option>
            <option value="Somewhat comfortable">Somewhat comfortable</option>
            <option value="Prefer minimal interaction">Prefer minimal interaction</option>
            <option value="Prefer zero interaction">Prefer zero interaction</option>
          </select>
          {errors.customer_interaction && (
            <p className="text-xs text-red-500">{errors.customer_interaction}</p>
          )}
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="location_context" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            Location Context <span className="text-brand-500">*</span>
          </label>
          <select
            id="location_context"
            className={fieldClasses}
            value={localInputs.location_context || ""}
            onChange={(e) => handleChange("location_context", e.target.value)}
          >
            <option value="">Select...</option>
            <option value="Urban">Urban</option>
            <option value="Suburban">Suburban</option>
            <option value="Rural">Rural</option>
            <option value="Remote">Remote</option>
          </select>
          {errors.location_context && (
            <p className="text-xs text-red-500">{errors.location_context}</p>
          )}
        </div>
      </div>

      {/* Business Region */}
      <div className="grid gap-1.5">
        <label htmlFor="business_region" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
          Business Region <span className="text-brand-500">*</span>
        </label>
        <select
          id="business_region"
          className={fieldClasses}
          value={localInputs.business_region || ""}
          onChange={(e) => handleChange("business_region", e.target.value)}
        >
          <option value="">Select...</option>
          <option value="United States / Canada">United States / Canada</option>
          <option value="Europe">Europe</option>
          <option value="India">India</option>
          <option value="Middle East">Middle East</option>
          <option value="Southeast Asia">Southeast Asia</option>
          <option value="Africa">Africa</option>
          <option value="Latin America">Latin America</option>
          <option value="Global / Online">Global / Online</option>
        </select>
        {errors.business_region && (
          <p className="text-xs text-red-500">{errors.business_region}</p>
        )}
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

