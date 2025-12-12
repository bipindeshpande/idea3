/**
 * Startup Category Configuration
 * Defines which interest areas, subcategories, and skills are TECH vs NON-TECH
 */

// TECH skills (software, AI, digital products, online platforms)
export const TECH_SKILLS = [
  "Coding",
  "AI & Automation",
  "AI Tools",
  "Web Building",
  "Automation",
  "Data Analysis",
  "Low-code / No-code",
  "SEO / Blogging", // Digital marketing
];

// NON-TECH skills (physical, service-based, offline)
export const NON_TECH_SKILLS = [
  "Cooking / Food Prep",
  "Crafting / Handmade",
  "Beauty Services",
  "Fitness Coaching",
  "Customer Interaction",
  "Community Building",
  "Budgeting",
  "Inventory Management",
  "Logistics",
  "Teaching / Coaching",
];

// MIXED skills (can be used in both tech and non-tech)
export const MIXED_SKILLS = [
  "Photography / Videography",
  "Writing / Content",
  "Graphic Design",
  "Social Media",
  "Marketing / Advertising",
  "Time Management",
  "Project Management",
];

// NEUTRAL skills (apply to both tech and non-tech)
export const NEUTRAL_SKILLS = [
  "Empathy",
  "Leadership",
  "Problem Solving",
  "Team Building",
  "Persuasion",
];

// TECH interest areas (software, AI, digital products, online platforms)
export const TECH_INTEREST_AREAS = [
  "AI & Automation",
  "Software / SaaS",
  "Education", // EdTech is tech
];

// NON-TECH interest areas (physical, service-based, offline businesses)
export const NON_TECH_INTEREST_AREAS = [
  "Food & Beverage",
  "Retail & E-commerce", // Physical retail, not pure e-commerce platforms
  "Fitness & Sports", // Physical training, equipment
  "Kids & Parenting", // Physical products, services
  "Beauty & Wellness", // Physical products, spa services
  "Home Services", // Physical services
  "Travel & Tourism", // Physical travel services
  "Manufacturing / Crafts", // Physical products
  "Finance / Accounting", // Service-based (accounting, tax prep)
  "Freelancing / Consulting", // Service-based
  "Agriculture / Gardening", // Physical farming
  "Social Impact", // Physical/non-profit services
  "Local Services", // Physical local services
];

// MIXED interest areas (can be either tech or non-tech depending on subcategory)
export const MIXED_INTEREST_AREAS = [
  "Other", // User-defined, can be either
];

// Subcategories that are TECH (even if parent is mixed)
export const TECH_SUBCATEGORIES = [
  // Education tech
  "Online Courses",
  "Coaching Platforms",
  "Skill Assessment",
  "Gamified Learning",
  "AI Learning",
  "Tutoring Marketplaces",
  
  // Retail tech
  "Marketplace", // Digital marketplace platform
  
  // Fitness tech
  "Fitness App",
  
  // Kids tech
  "Parenting Apps",
  
  // Beauty tech
  "Wellness App",
  "Beauty Tech",
  
  // Home tech
  "Home Automation",
  
  // Travel tech
  "Travel Tech",
  
  // Finance tech
  "Investment Tools",
  "Personal Finance", // Digital tools
  
  // Consulting tech
  "Freelance Marketplace",
  "Expert Network",
  
  // Agriculture tech
  "Agricultural Tech",
  
  // Social impact tech
  "Charity Tech",
  
  // Food tech
  "Food Tech",
];

// Subcategories that are NON-TECH (even if parent is mixed)
export const NON_TECH_SUBCATEGORIES = [
  // Food & Beverage
  "Restaurant/Cafe",
  "Food Delivery", // Physical delivery service
  "Meal Prep", // Physical meal prep
  "Beverage Brand",
  "Catering",
  
  // Retail & E-commerce (physical)
  "D2C Brand", // Physical product brand
  "Dropshipping", // Physical products
  "Print-on-Demand", // Physical products
  "Subscription Box", // Physical products
  "B2B Wholesale", // Physical products
  
  // Education (non-tech)
  "Tutoring", // In-person tutoring
  "Coaching Platforms", // Wait, this might be tech - let me check
  // Actually, "Coaching Platforms" could be tech, so I'll keep it in TECH
  
  // Fitness & Sports (non-tech)
  "Personal Training",
  "Sports Equipment",
  "Wellness Coaching",
  "Nutrition Planning",
  
  // Kids & Parenting (non-tech)
  "Educational Toys",
  "Childcare Services",
  "Kids Activities",
  "Family Products",
  
  // Beauty & Wellness (non-tech)
  "Skincare Brand",
  "Beauty Services",
  "Spa Services",
  
  // Home Services (non-tech)
  "Cleaning",
  "Handyman",
  "Landscaping",
  "Interior Design",
  "Maintenance",
  
  // Travel & Tourism (non-tech)
  "Travel Planning", // Service-based planning
  "Local Experiences",
  "Accommodation",
  "Tourism Services",
  
  // Manufacturing / Crafts (non-tech)
  "Custom Products",
  "Handmade Goods",
  "Craft Supplies",
  "Artisan Marketplace", // Physical marketplace
  
  // Finance / Accounting (non-tech)
  "Small Business Finance", // Service-based
  "Tax Services",
  "Financial Planning", // Service-based
  
  // Freelancing / Consulting (non-tech)
  "Consulting Services",
  "Business Advisory",
  "Professional Services",
  
  // Agriculture / Gardening (non-tech)
  "Urban Farming",
  "Garden Services",
  "Plant Care",
  "Sustainable Farming",
  
  // Social Impact (non-tech)
  "Non-profit",
  "Social Enterprise",
  "Community Services",
  "Environmental Solutions",
  
  // Local Services (non-tech)
  "Local Marketplace", // Physical local marketplace
  "Community Services",
  "Neighborhood Services",
  "Local Delivery",
  "Community Events",
];

/**
 * Check if an interest area is TECH
 */
export function isTechInterestArea(interestArea) {
  if (TECH_INTEREST_AREAS.includes(interestArea)) {
    return true;
  }
  if (NON_TECH_INTEREST_AREAS.includes(interestArea)) {
    return false;
  }
  // MIXED or unknown - check subcategory
  return null;
}

/**
 * Check if a subcategory is TECH
 */
export function isTechSubcategory(subcategory) {
  if (TECH_SUBCATEGORIES.includes(subcategory)) {
    return true;
  }
  if (NON_TECH_SUBCATEGORIES.includes(subcategory)) {
    return false;
  }
  // Unknown subcategory - default to non-tech for safety
  return false;
}

/**
 * Check if an idea (interest area + subcategory) is TECH
 */
export function isTechIdea(interestArea, subcategory) {
  const areaType = isTechInterestArea(interestArea);
  
  // If interest area is clearly tech or non-tech, return that
  if (areaType === true) return true;
  if (areaType === false) return false;
  
  // If mixed, check subcategory
  if (subcategory) {
    return isTechSubcategory(subcategory);
  }
  
  // Default to non-tech if unclear
  return false;
}

/**
 * Filter interest areas based on startup_category
 */
export function filterInterestAreas(interestAreas, startupCategory) {
  if (!startupCategory || startupCategory === "both") {
    return interestAreas;
  }
  
  if (startupCategory === "tech") {
    return interestAreas.filter(area => 
      TECH_INTEREST_AREAS.includes(area) || 
      MIXED_INTEREST_AREAS.includes(area)
    );
  }
  
  if (startupCategory === "non_tech") {
    return interestAreas.filter(area => 
      NON_TECH_INTEREST_AREAS.includes(area) || 
      MIXED_INTEREST_AREAS.includes(area)
    );
  }
  
  return interestAreas;
}

/**
 * Filter subcategories based on startup_category and interest area
 */
export function filterSubcategories(subcategories, interestArea, startupCategory) {
  if (!startupCategory || startupCategory === "both") {
    return subcategories;
  }
  
  if (startupCategory === "tech") {
    return subcategories.filter(sub => {
      // If parent is clearly tech, include all
      if (TECH_INTEREST_AREAS.includes(interestArea)) {
        return true;
      }
      // If parent is mixed, only include tech subcategories
      if (MIXED_INTEREST_AREAS.includes(interestArea)) {
        return isTechSubcategory(sub);
      }
      // If parent is non-tech but has tech subcategories, include them
      return isTechSubcategory(sub);
    });
  }
  
  if (startupCategory === "non_tech") {
    return subcategories.filter(sub => {
      // If parent is clearly non-tech, include all
      if (NON_TECH_INTEREST_AREAS.includes(interestArea)) {
        return true;
      }
      // If parent is mixed, only include non-tech subcategories
      if (MIXED_INTEREST_AREAS.includes(interestArea)) {
        return !isTechSubcategory(sub);
      }
      // If parent is tech but has non-tech subcategories, include them
      return !isTechSubcategory(sub);
    });
  }
  
  return subcategories;
}

/**
 * Filter skills based on startup_category
 */
export function filterSkills(skills, startupCategory) {
  if (!startupCategory || startupCategory === "both") {
    return skills; // Show all skills if no category or "both"
  }
  
  if (startupCategory === "tech") {
    // Show tech skills + mixed skills + neutral skills
    return skills.filter(skill => 
      TECH_SKILLS.includes(skill) || 
      MIXED_SKILLS.includes(skill) || 
      NEUTRAL_SKILLS.includes(skill)
    );
  }
  
  if (startupCategory === "non_tech") {
    // Show non-tech skills + mixed skills + neutral skills
    return skills.filter(skill => 
      NON_TECH_SKILLS.includes(skill) || 
      MIXED_SKILLS.includes(skill) || 
      NEUTRAL_SKILLS.includes(skill)
    );
  }
  
  return skills;
}

/**
 * Filter skill categories based on startup_category
 * Returns an object with filtered skill categories
 */
export function filterSkillCategories(skillCategories, startupCategory) {
  if (!startupCategory || startupCategory === "both") {
    return skillCategories; // Show all categories if no category or "both"
  }
  
  const filtered = {};
  
  for (const [category, skills] of Object.entries(skillCategories)) {
    const filteredSkills = filterSkills(skills, startupCategory);
    if (filteredSkills.length > 0) {
      filtered[category] = filteredSkills;
    }
  }
  
  return filtered;
}

