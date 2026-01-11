/**
 * Conflict validation for validation form inputs
 * Detects conflicting or inconsistent selections across form fields
 */

// Industry to Solution Type compatibility mapping
const INDUSTRY_SOLUTION_COMPATIBILITY = {
  "Food & Beverage": [
    "Food Service / Restaurant",
    "Physical Service / Local Business",
    "E-commerce Platform", // For food delivery
    "Marketplace / Platform", // For food marketplace
  ],
  "Retail / E-commerce": [
    "E-commerce Platform",
    "Marketplace / Platform",
    "Physical Product / Manufacturing",
    "Retail / Brick & Mortar",
    "On-demand Service",
  ],
  "SaaS / Software": [
    "SaaS / Online Platform",
    "AI Automation",
    "Marketplace / Platform",
    "Other",
  ],
  "Local Services": [
    "Physical Service / Local Business",
    "On-demand Service",
    "Marketplace / Platform",
    "Other",
  ],
  "Healthcare / Wellness": [
    "SaaS / Online Platform",
    "Physical Service / Local Business",
    "AI Automation",
    "Other",
  ],
  "Education": [
    "SaaS / Online Platform",
    "Content / Education / Creator",
    "Marketplace / Platform",
    "Other",
  ],
  "Real Estate": [
    "SaaS / Online Platform",
    "Marketplace / Platform",
    "Physical Service / Local Business",
    "Other",
  ],
  "Entertainment / Media": [
    "Content / Education / Creator",
    "SaaS / Online Platform",
    "Marketplace / Platform",
    "Other",
  ],
  "Transportation / Logistics": [
    "Marketplace / Platform",
    "On-demand Service",
    "SaaS / Online Platform",
    "Other",
  ],
  "Manufacturing / Physical Products": [
    "Physical Product / Manufacturing",
    "E-commerce Platform",
    "Other",
  ],
  "Consulting / Professional Services": [
    "Consulting / Professional Service",
    "SaaS / Online Platform",
    "Marketplace / Platform",
    "Other",
  ],
  "Fintech": [
    "SaaS / Online Platform",
    "AI Automation",
    "Marketplace / Platform",
    "Other",
  ],
  "Healthtech": [
    "SaaS / Online Platform",
    "AI Automation",
    "Other",
  ],
  "Other": ["Other"], // Allow all for "Other"
};

// Solution Type to Business Archetype compatibility
const SOLUTION_BUSINESS_COMPATIBILITY = {
  "SaaS / Online Platform": [
    "Online software / AI product (SaaS / app / tool)",
    "Marketplace / platform",
  ],
  "Food Service / Restaurant": [
    "Food & beverage / restaurant / stall / catering",
    "Local service business",
  ],
  "Retail / Brick & Mortar": [
    "Retail / physical shop",
    "Physical product brand",
    "Local service business",
  ],
  "Physical Service / Local Business": [
    "Local service business",
    "Retail / physical shop",
  ],
  "Physical Product / Manufacturing": [
    "Physical product brand",
    "E-commerce Platform",
    "Retail / physical shop",
  ],
  "E-commerce Platform": [
    "Online software / AI product (SaaS / app / tool)",
    "Physical product brand",
    "Retail / physical shop",
  ],
  "Marketplace / Platform": [
    "Marketplace / platform",
    "Online software / AI product (SaaS / app / tool)",
  ],
  "Consulting / Professional Service": [
    "Content / creator / education",
    "Local service business",
  ],
  "Content / Education / Creator": [
    "Content / creator / education",
    "Online software / AI product (SaaS / app / tool)",
  ],
  "On-demand Service": [
    "Marketplace / platform",
    "Local service business",
    "Online software / AI product (SaaS / app / tool)",
  ],
  "AI Automation": [
    "Online software / AI product (SaaS / app / tool)",
    "Marketplace / platform",
  ],
  "Aggregator / Comparison": [
    "Marketplace / platform",
    "Online software / AI product (SaaS / app / tool)",
  ],
  "Other": [
    "Online software / AI product (SaaS / app / tool)",
    "Local service business",
    "Food & beverage / restaurant / stall / catering",
    "Retail / physical shop",
    "Physical product brand",
    "Content / creator / education",
    "Marketplace / platform",
  ],
};

// Business Archetype to Delivery Channel compatibility
const BUSINESS_DELIVERY_COMPATIBILITY = {
  "Online software / AI product (SaaS / app / tool)": [
    "Online only",
    "Mostly online",
  ],
  "Local service business": [
    "Mostly offline / in-person",
    "Mixed online & offline",
    "Mostly online", // Some local services can be mostly online
  ],
  "Food & beverage / restaurant / stall / catering": [
    "Mostly offline / in-person",
    "Mixed online & offline",
    "Mostly online", // For delivery-focused
  ],
  "Retail / physical shop": [
    "Mostly offline / in-person",
    "Mixed online & offline",
  ],
  "Physical product brand": [
    "Mixed online & offline",
    "Mostly online",
    "Online only", // For digital-only brands
  ],
  "Content / creator / education": [
    "Online only",
    "Mostly online",
  ],
  "Marketplace / platform": [
    "Online only",
    "Mostly online",
  ],
};

/**
 * Validates if selected values are consistent with each other
 * @param {Object} screen1Answers - Screen 1 answers (industry, geography, stage, commitment)
 * @param {Object} screen2Answers - Screen 2 answers (problem, solution_type, user_type, revenue_model, unique_moat, business_archetype)
 * @param {Object} optionalAnswers - Optional answers (initial_budget, delivery_channel, constraints)
 * @param {string} structuredDescription - The detailed description text
 * @returns {Object} { isValid: boolean, conflicts: Array<{field: string, message: string, severity: 'error'|'warning'>} }
 */
export function validateInputConflicts(screen1Answers, screen2Answers, optionalAnswers = {}, structuredDescription = "") {
  const conflicts = [];

  // 1. Industry vs Solution Type conflict
  const industry = screen1Answers.industry;
  const solutionType = screen2Answers.solution_type;
  if (industry && solutionType) {
    const compatibleSolutions = INDUSTRY_SOLUTION_COMPATIBILITY[industry] || [];
    if (!compatibleSolutions.includes(solutionType) && industry !== "Other") {
      conflicts.push({
        field: "solution_type",
        relatedField: "industry",
        message: `"${solutionType}" doesn't typically match the "${industry}" industry. Consider selecting a solution type that aligns with this industry, or review your industry selection.`,
        severity: "error",
        suggestion: compatibleSolutions.length > 0 
          ? `Suggested: ${compatibleSolutions.slice(0, 3).join(", ")}`
          : null,
      });
    }
  }

  // 2. Solution Type vs Business Archetype conflict
  const businessArchetype = screen2Answers.business_archetype;
  if (solutionType && businessArchetype) {
    const compatibleBusinesses = SOLUTION_BUSINESS_COMPATIBILITY[solutionType] || [];
    if (!compatibleBusinesses.includes(businessArchetype) && solutionType !== "Other") {
      conflicts.push({
        field: "business_archetype",
        relatedField: "solution_type",
        message: `"${businessArchetype}" doesn't align with "${solutionType}". Please select a business type that matches your solution.`,
        severity: "error",
        suggestion: compatibleBusinesses.length > 0
          ? `Suggested: ${compatibleBusinesses.slice(0, 2).join(" or ")}`
          : null,
      });
    }
  }

  // 3. Business Archetype vs Delivery Channel conflict
  const deliveryChannel = optionalAnswers.delivery_channel;
  if (businessArchetype && deliveryChannel) {
    const compatibleChannels = BUSINESS_DELIVERY_COMPATIBILITY[businessArchetype] || [];
    if (!compatibleChannels.includes(deliveryChannel)) {
      conflicts.push({
        field: "delivery_channel",
        relatedField: "business_archetype",
        message: `"${deliveryChannel}" doesn't match "${businessArchetype}". Review your delivery channel selection.`,
        severity: "error",
        suggestion: compatibleChannels.length > 0
          ? `Suggested: ${compatibleChannels.join(" or ")}`
          : null,
      });
    }
  }

  // 4. Industry vs Structured Description analysis (check if description mentions different industry)
  if (industry && structuredDescription && industry !== "Other") {
    const descriptionLower = structuredDescription.toLowerCase();
    const industryKeywords = {
      "Food & Beverage": ["food", "restaurant", "catering", "beverage", "kitchen", "meal", "cafe"],
      "SaaS / Software": ["software", "platform", "saas", "app", "application", "crm", "tool", "system"],
      "Retail / E-commerce": ["retail", "e-commerce", "ecommerce", "store", "shop", "product", "brand"],
      "Local Services": ["local", "service", "on-demand", "delivery"],
      "Healthcare / Wellness": ["health", "medical", "wellness", "patient", "care"],
      "Education": ["education", "learning", "course", "student", "teach"],
    };

    const keywords = industryKeywords[industry] || [];
    const hasIndustryKeywords = keywords.some(keyword => descriptionLower.includes(keyword));

    // Check for conflicting industry mentions
    const conflictingIndustries = Object.entries(industryKeywords)
      .filter(([ind]) => ind !== industry)
      .filter(([_, kws]) => kws.some(kw => descriptionLower.includes(kw)));

    if (conflictingIndustries.length > 0 && !hasIndustryKeywords) {
      conflicts.push({
        field: "industry",
        relatedField: "structuredDescription",
        message: `Your description mentions "${conflictingIndustries[0][0]}" concepts, but you selected "${industry}" as the industry. Please align your industry selection with your actual idea.`,
        severity: "warning",
        suggestion: `Consider changing industry to "${conflictingIndustries[0][0]}" if that's what your idea is about.`,
      });
    }
  }

  // 5. Solution Type vs Structured Description (check if SaaS keywords in description but not SaaS solution type)
  if (solutionType && structuredDescription) {
    const saasKeywords = ["software", "platform", "saas", "app", "application", "crm", "tool", "system", "api", "dashboard", "interface"];
    const hasSaaSKeywords = saasKeywords.some(keyword => structuredDescription.toLowerCase().includes(keyword));
    
    if (hasSaaSKeywords && !solutionType.includes("SaaS") && !solutionType.includes("Platform") && !solutionType.includes("AI Automation")) {
      conflicts.push({
        field: "solution_type",
        relatedField: "structuredDescription",
        message: `Your description mentions software/platform features, but you selected "${solutionType}". If your idea is a software product, consider selecting "SaaS / Online Platform".`,
        severity: "warning",
        suggestion: "Consider: SaaS / Online Platform or AI Automation",
      });
    }
  }

  // 6. Business Archetype vs Structured Description (physical vs digital)
  if (businessArchetype && structuredDescription) {
    const physicalKeywords = ["physical", "store", "shop", "retail", "location", "brick", "mortar", "restaurant", "cafe"];
    const digitalKeywords = ["online", "digital", "software", "app", "platform", "web", "cloud"];
    
    const hasPhysical = physicalKeywords.some(kw => structuredDescription.toLowerCase().includes(kw));
    const hasDigital = digitalKeywords.some(kw => structuredDescription.toLowerCase().includes(kw));
    
    const isPhysicalBusiness = businessArchetype.includes("physical") || 
                               businessArchetype.includes("retail") || 
                               businessArchetype.includes("Food & beverage");
    const isDigitalBusiness = businessArchetype.includes("Online software") || 
                              businessArchetype.includes("Content") || 
                              businessArchetype.includes("Marketplace");

    if (hasPhysical && isDigitalBusiness) {
      conflicts.push({
        field: "business_archetype",
        relatedField: "structuredDescription",
        message: `Your description mentions physical locations, but you selected a digital business type. Review your selection.`,
        severity: "error",
      });
    }
    
    if (hasDigital && isPhysicalBusiness && !businessArchetype.includes("Mixed")) {
      conflicts.push({
        field: "business_archetype",
        relatedField: "structuredDescription",
        message: `Your description mentions digital/online features, but you selected a physical business type. Consider if your business is actually online-focused.`,
        severity: "warning",
      });
    }
  }

  return {
    isValid: conflicts.filter(c => c.severity === "error").length === 0,
    conflicts,
  };
}

/**
 * Gets filtered options for a field based on current answers
 * @param {string} fieldId - The field ID (e.g., "solution_type", "business_archetype")
 * @param {Array} allOptions - All available options for this field
 * @param {Object} currentAnswers - Current form answers
 * @returns {Array} Array of {value: string, enabled: boolean, reason?: string}
 */
export function getFilteredOptions(fieldId, allOptions, currentAnswers) {
  if (!allOptions || allOptions.length === 0) {
    return allOptions.map(opt => ({ value: opt, enabled: true }));
  }

  switch (fieldId) {
    case "solution_type":
      return getFilteredSolutionTypes(allOptions, currentAnswers);
    
    case "business_archetype":
      return getFilteredBusinessArchetypes(allOptions, currentAnswers);
    
    case "delivery_channel":
      return getFilteredDeliveryChannels(allOptions, currentAnswers);
    
    default:
      // No filtering for other fields
      return allOptions.map(opt => ({ value: opt, enabled: true }));
  }
}

function getFilteredSolutionTypes(allOptions, currentAnswers) {
  const industry = currentAnswers.industry;
  if (!industry || industry === "Other") {
    // No filtering if no industry selected or "Other" is selected
    return allOptions.map(opt => ({ value: opt, enabled: true }));
  }

  const compatibleSolutions = INDUSTRY_SOLUTION_COMPATIBILITY[industry] || [];
  
  return allOptions.map(option => {
    const isCompatible = compatibleSolutions.includes(option);
    return {
      value: option,
      enabled: isCompatible,
      reason: !isCompatible 
        ? `Not typically compatible with "${industry}" industry. Select only if your idea is an exception.`
        : null,
    };
  });
}

function getFilteredBusinessArchetypes(allOptions, currentAnswers) {
  const solutionType = currentAnswers.solution_type;
  if (!solutionType || solutionType === "Other") {
    return allOptions.map(opt => ({ value: opt, enabled: true }));
  }

  const compatibleBusinesses = SOLUTION_BUSINESS_COMPATIBILITY[solutionType] || [];
  
  return allOptions.map(option => {
    const isCompatible = compatibleBusinesses.includes(option);
    return {
      value: option,
      enabled: isCompatible,
      reason: !isCompatible
        ? `Doesn't align with "${solutionType}". Select only if your business model is an exception.`
        : null,
    };
  });
}

function getFilteredDeliveryChannels(allOptions, currentAnswers) {
  const businessArchetype = currentAnswers.business_archetype;
  if (!businessArchetype) {
    return allOptions.map(opt => ({ value: opt, enabled: true }));
  }

  const compatibleChannels = BUSINESS_DELIVERY_COMPATIBILITY[businessArchetype] || [];
  
  return allOptions.map(option => {
    const isCompatible = compatibleChannels.includes(option);
    return {
      value: option,
      enabled: isCompatible,
      reason: !isCompatible
        ? `Doesn't match "${businessArchetype}". Review if this is correct for your business.`
        : null,
    };
  });
}

/**
 * Gets suggestions for a field based on other field selections
 */
export function getFieldSuggestions(fieldId, currentAnswers) {
  // Implementation can be added to provide proactive suggestions
  return [];
}

