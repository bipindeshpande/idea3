import { personalizeCopy } from "./textFormatters.js";

/**
 * Extract numeric value from text (e.g., "$25K" -> 25000, "$120,000" -> 120000)
 */
function extractCurrency(text) {
  const match = text.match(/\$[\d,]+(?:\.\d+)?[KMB]?/i);
  if (!match) return null;
  let value = match[0].replace(/[$,]/g, "");
  if (/K/i.test(value)) {
    value = parseFloat(value) * 1000;
  } else if (/M/i.test(value)) {
    value = parseFloat(value) * 1000000;
  } else if (/B/i.test(value)) {
    value = parseFloat(value) * 1000000000;
  }
  return Math.round(parseFloat(value));
}

/**
 * Extract time period (e.g., "Year 1", "month 6", "within 12 months")
 */
function extractTimeframe(text) {
  const yearMatch = text.match(/(?:within\s+)?(?:year|yr)\s*(\d+)/i);
  if (yearMatch) return `Year ${yearMatch[1]}`;
  const monthMatch = text.match(/(?:within\s+)?(?:month|mo)\s*(\d+)/i);
  if (monthMatch) return `Month ${monthMatch[1]}`;
  const monthsMatch = text.match(/(\d+)\s*(?:months?|mos?)/i);
  if (monthsMatch) return `${monthsMatch[1]} months`;
  return null;
}

/**
 * Parse budget range to get max budget value
 */
function parseBudgetRange(budgetRange = "") {
  if (!budgetRange) return null;
  
  // Extract numbers from budget range strings like "Up to $5 K", "$20 K and Above", etc.
  const match = budgetRange.match(/\$?\s*(\d+(?:,\d+)?)\s*K/i);
  if (match) {
    return parseInt(match[1].replace(/,/g, "")) * 1000;
  }
  
  // Handle "Free" or "$0"
  if (/free|sweat|0/i.test(budgetRange)) {
    return 0;
  }
  
  // Handle ranges like "$1 K" to "$5 K"
  const rangeMatch = budgetRange.match(/\$?\s*(\d+(?:,\d+)?)\s*K\s*(?:to|-)\s*\$?\s*(\d+(?:,\d+)?)\s*K/i);
  if (rangeMatch) {
    return parseInt(rangeMatch[2].replace(/,/g, "")) * 1000;
  }
  
  // Handle "$20 K and Above"
  if (/and\s+above/i.test(budgetRange)) {
    const aboveMatch = budgetRange.match(/\$?\s*(\d+(?:,\d+)?)\s*K/i);
    if (aboveMatch) {
      return parseInt(aboveMatch[1].replace(/,/g, "")) * 1000;
    }
  }
  
  return null;
}

/**
 * Format currency amount as string
 */
function formatCurrency(amount) {
  return `$${amount.toLocaleString()}`;
}

/**
 * Build financial snapshots from section text
 */
export function buildFinancialSnapshots(sectionText = "", ideaTitle = "", budgetRange = "") {
  const normalizedTitle = ideaTitle || "this idea";
  const entries = [];
  const seen = new Set();

  // Parse actual financial data from agent output
  const text = sectionText.toLowerCase();
  
  // Extract startup costs - try multiple patterns to catch all variations
  let startupCostValue = null;
  let startupCostText = null;
  
  // Pattern 1: "Startup costs: $25,000"
  const startupCostMatch1 = sectionText.match(/startup\s+costs?[:\-]?\s*(.+?)(?:\n|$)/i);
  if (startupCostMatch1) {
    const costText = startupCostMatch1[1];
    const costValue = extractCurrency(costText);
    if (costValue) {
      startupCostValue = costValue;
      startupCostText = costText.trim();
    }
  }
  
  // Pattern 2: "Estimated Startup Costs: $25,000" or "Startup investment: $25,000"
  if (!startupCostValue) {
    const startupCostMatch2 = sectionText.match(/(?:estimated\s+)?(?:startup\s+)?(?:costs?|investment)[:\-]?\s*(.+?)(?:\n|$)/i);
    if (startupCostMatch2) {
      const costText = startupCostMatch2[1];
      const costValue = extractCurrency(costText);
      if (costValue) {
        startupCostValue = costValue;
        startupCostText = costText.trim();
      }
    }
  }
  
  // Pattern 3: Look for any currency amount near "startup" keyword
  if (!startupCostValue) {
    const startupContextMatch = sectionText.match(/startup[^:]*?(\$[\d,]+(?:\s*(?:K|thousand))?)/i);
    if (startupContextMatch) {
      const costValue = extractCurrency(startupContextMatch[1]);
      if (costValue) {
        startupCostValue = costValue;
        startupCostText = startupContextMatch[1];
      }
    }
  }
  
  // Pattern 4: Look for "$25,000" or "$25K" in the first few lines (common format)
  if (!startupCostValue) {
    const firstLines = sectionText.split('\n').slice(0, 5).join('\n');
    const currencyMatch = firstLines.match(/\$[\d,]+(?:\s*(?:K|thousand))?/i);
    if (currencyMatch) {
      const costValue = extractCurrency(currencyMatch[0]);
      if (costValue && costValue >= 1000) { // Only if it's a reasonable startup cost
        startupCostValue = costValue;
        startupCostText = currencyMatch[0];
      }
    }
  }
  
  if (startupCostValue) {
    entries.push({
      focus: "Estimated startup investment",
      estimate: startupCostText ? personalizeCopy(startupCostText) : `Initial setup costs for ${normalizedTitle}`,
      metric: formatCurrency(startupCostValue),
    });
    seen.add("startup costs");
  }

  // Extract revenue projections
  const revenueMatch = sectionText.match(/revenue\s+projections?[:\-]?\s*(.+?)(?:\n|$)/i);
  if (revenueMatch) {
    const revenueText = revenueMatch[1];
    const revenueValue = extractCurrency(revenueText);
    const timeframe = extractTimeframe(revenueText);
    if (revenueValue) {
      entries.push({
        focus: "Revenue potential",
        estimate: personalizeCopy(revenueMatch[1].trim()),
        metric: timeframe ? `${formatCurrency(revenueValue)} (${timeframe})` : formatCurrency(revenueValue),
      });
      seen.add("revenue");
    }
  }

  // Extract breakeven
  const breakevenMatch = sectionText.match(/breakeven[:\-]?\s*(.+?)(?:\n|$)/i);
  if (breakevenMatch) {
    const breakevenText = breakevenMatch[1];
    const timeframe = extractTimeframe(breakevenText);
    entries.push({
      focus: "Breakeven timeline",
      estimate: personalizeCopy(breakevenMatch[1].trim()),
      metric: timeframe || "TBD",
    });
    seen.add("breakeven");
  }

  // Extract monthly burn/operating costs
  const burnMatch = sectionText.match(/(?:monthly\s+)?(?:burn|operating\s+costs?|monthly\s+costs?)[:\-]?\s*(.+?)(?:\n|$)/i);
  if (burnMatch) {
    const burnValue = extractCurrency(burnMatch[1]);
    if (burnValue) {
      entries.push({
        focus: "Monthly operating costs",
        estimate: personalizeCopy(burnMatch[1].trim()),
        metric: formatCurrency(burnValue) + "/month",
      });
      seen.add("burn");
    }
  }

  // Extract profit margins or unit economics if mentioned
  const marginMatch = sectionText.match(/(?:profit\s+)?margin[:\-]?\s*(.+?)(?:\n|$)/i);
  if (marginMatch && !seen.has("margin")) {
    entries.push({
      focus: "Profit margin",
      estimate: personalizeCopy(marginMatch[1].trim()),
      metric: marginMatch[1].match(/\d+%/) ? marginMatch[1].match(/\d+%/)[0] : "TBD",
    });
    seen.add("margin");
  }

  // If we have real data, return it. Otherwise, use minimal fallbacks only
  if (entries.length >= 3) {
    return entries;
  }

  // Only add fallbacks if agent didn't provide enough data
  // Use realistic estimates based on user's actual budget, not arbitrary caps
  const ideaType = normalizedTitle.toLowerCase();
  const userMaxBudget = parseBudgetRange(budgetRange);
  
  // Only add fallbacks if we have less than 3 entries (agent didn't provide enough)
  // And make them realistic based on the user's actual budget range
  if (entries.length < 3) {
    // Determine realistic estimates based on budget range, not idea type
    let estimatedStartupCost = null;
    let estimatedMonthlyRevenue = null;
    
    if (userMaxBudget !== null) {
      // Use realistic percentages of the budget based on typical startup cost breakdowns
      if (userMaxBudget <= 1000) {
        // Very lean budget - focus on minimal viable setup
        estimatedStartupCost = Math.floor(userMaxBudget * 0.8); // Use 80% for tools/setup
        estimatedMonthlyRevenue = 500; // Conservative for lean startups
      } else if (userMaxBudget <= 5000) {
        // Small budget - can cover basic tools, some marketing
        estimatedStartupCost = Math.floor(userMaxBudget * 0.7); // 70% for setup, 30% buffer
        estimatedMonthlyRevenue = 1000; // Realistic for small budget ideas
      } else if (userMaxBudget <= 10000) {
        // Medium budget - more room for tools, development, marketing
        estimatedStartupCost = Math.floor(userMaxBudget * 0.6); // 60% for setup
        estimatedMonthlyRevenue = 2000;
      } else if (userMaxBudget <= 20000) {
        // Larger budget - can support more development
        estimatedStartupCost = Math.floor(userMaxBudget * 0.5); // 50% for initial setup
        estimatedMonthlyRevenue = 3000;
      } else {
        // Large budget - significant investment possible
        estimatedStartupCost = Math.floor(userMaxBudget * 0.4); // 40% for setup, rest for runway
        estimatedMonthlyRevenue = 5000;
      }
    } else {
      // No budget specified - use conservative defaults
      estimatedStartupCost = 3000;
      estimatedMonthlyRevenue = 1000;
    }

    // Add startup cost estimate only if agent didn't provide it
    if (!seen.has("startup costs") && estimatedStartupCost !== null) {
      entries.push({
        focus: "Estimated startup investment",
        estimate: `Based on your ${budgetRange || "budget"}, initial setup costs for ${normalizedTitle}`,
        metric: formatCurrency(estimatedStartupCost),
      });
    }
    
    // Add revenue estimate only if agent didn't provide it
    if (!seen.has("revenue") && estimatedMonthlyRevenue !== null) {
      entries.push({
        focus: "Revenue potential",
        estimate: `Conservative monthly revenue projection for ${normalizedTitle} based on typical early-stage performance`,
        metric: formatCurrency(estimatedMonthlyRevenue) + "/month",
      });
    }
  }

  return entries.slice(0, 5);
}
