import { useState } from "react";

const fieldClasses =
  "w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-4 py-3 text-slate-800 dark:text-slate-200 shadow-sm transition focus:border-brand-400 dark:focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900 text-sm";

export default function IntakeScreenOne({ inputs, onChange, onNext, errors = {} }) {
  const [localInputs, setLocalInputs] = useState(inputs || {});

  const handleChange = (field, value) => {
    const updated = { ...localInputs, [field]: value };
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

  const skillCategories = {
    technical: ["Coding", "AI/Data", "Automation", "Web development", "Data Analysis"],
    creative: ["Writing", "Design", "Video/Photo", "Art/Music", "Content Creation"],
    physical: ["Cooking", "Fitness", "Crafts", "Beauty services", "Repairs"],
    business: ["Strategy", "Management", "Finance", "Teaching", "Coaching"],
    soft: ["Communication", "Leadership", "Empathy", "Problem Solving", "Team Building"],
  };

  const skillCategoryLabels = {
    technical: "Technical",
    creative: "Creative",
    physical: "Physical",
    business: "Business",
    soft: "Soft Skills",
  };

  return (
    <div className="grid gap-4 sm:gap-5">
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
            Skills <span className="text-brand-500">*</span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Select all that apply</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(skillCategories).map(([category, skills]) => (
            <div 
              key={category} 
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-3 space-y-2.5"
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
                          : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-brand-300 dark:hover:border-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20"
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

      {/* Preferred Work Style and Startup Style - After Skills */}
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
            <option value="Solo">Solo</option>
            <option value="Small team">Small team</option>
            <option value="Remote only">Remote only</option>
            <option value="On-site OK">On-site OK</option>
            <option value="No preference">No preference</option>
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
            <option value="Online only">Online only</option>
            <option value="Offline only">Offline only</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Home-based">Home-based</option>
            <option value="Community-based">Community-based</option>
            <option value="Travel-based">Travel-based</option>
          </select>
          {errors.startup_style && (
            <p className="text-xs text-red-500">{errors.startup_style}</p>
          )}
        </div>
      </div>

      {/* Third row: Customer Interaction, Location Context */}
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
    </div>
  );
}

