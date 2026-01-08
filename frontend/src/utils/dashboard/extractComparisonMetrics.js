import { parseStructuredIdeas } from "../parsers/index.js";
import {
  buildFinancialSnapshots,
  parseRiskRows,
  splitFullReportSections,
  splitIdeaSections
} from "../formatters/recommendationFormatters.js";

/**
 * Extracts comparison metrics from a run and idea index
 * Used for comparing ideas side-by-side
 */
export function extractComparisonMetrics(run, ideaIndex) {
  if (!run || !ideaIndex) {
    return {
      startupCost: "N/A",
      monthlyRevenue: "N/A",
      marketSize: "N/A",
      competitionLevel: "N/A",
      riskLevel: "N/A",
      timeToMarket: "N/A",
      customerSegment: "N/A",
      keyStrengths: "N/A",
      validationScore: "N/A",
      scalability: "N/A"
    };
  }

  const reports = run.reports || run.outputs || {};
  const recs = reports.personalized_recommendations || "";
  
  // Parse ideas from recommendations
  const ideas = parseStructuredIdeas(recs, 3);
  const idea = ideas.find(i => String(i.index) === String(ideaIndex));
  
  if (!idea) {
    return {
      startupCost: "N/A",
      monthlyRevenue: "N/A",
      marketSize: "N/A",
      competitionLevel: "N/A",
      riskLevel: "N/A",
      timeToMarket: "N/A",
      customerSegment: "N/A",
      keyStrengths: idea?.summary?.substring(0, 80) || "N/A",
      validationScore: "N/A",
      scalability: "N/A"
    };
  }

  // Extract the full idea block from recommendations text
  let ideaBody = idea.body || idea.fullText || "";
  
  if (!ideaBody && recs) {
    const ideaBlockRegex = new RegExp(`###\\s*IDEA_${ideaIndex}[\\s\\S]*?(?=###\\s*IDEA_\\d+|$)`, 'i');
    const match = recs.match(ideaBlockRegex);
    if (match) {
      ideaBody = match[0];
    }
  }
  
  if (!ideaBody && idea.fullText) {
    ideaBody = idea.fullText;
  }
  
  // Parse idea body into sections
  const sections = splitIdeaSections(ideaBody);
  
  if (Object.keys(sections).length === 0 && recs) {
    const allSections = splitFullReportSections(recs);
    Object.assign(sections, allSections);
  }
  
  // Extract financial metrics
  const financialSection = sections.financial_snapshot || "";
  const financialSnapshots = buildFinancialSnapshots(
    financialSection,
    idea.title || "",
    run.inputs?.budget_range || ""
  );
  
  let startupCost = "N/A";
  let monthlyRevenue = "N/A";
  
  if (financialSnapshots && financialSnapshots.length > 0) {
    const startupCostEntry = financialSnapshots.find(e => 
      e.label?.toLowerCase().includes("startup") || 
      e.label?.toLowerCase().includes("initial")
    );
    if (startupCostEntry?.metric) {
      startupCost = startupCostEntry.metric;
    }
    
    const revenueEntry = financialSnapshots.find(e => 
      e.label?.toLowerCase().includes("revenue") || 
      e.label?.toLowerCase().includes("monthly")
    );
    if (revenueEntry?.metric) {
      monthlyRevenue = revenueEntry.metric;
    }
  }
  
  // Fallback: try regex extraction
  if (startupCost === "N/A" && financialSection) {
    const costMatch = financialSection.match(/startup\s+costs?[:\-]?\s*\$?([\d,]+(?:\s*(?:K|thousand))?)/i);
    if (costMatch) {
      startupCost = `$${costMatch[1]}`;
    }
  }
  
  if (monthlyRevenue === "N/A" && financialSection) {
    const revenueMatch = financialSection.match(/monthly\s+revenue[:\-]?\s*\$?([\d,]+(?:\s*(?:K|thousand))?)/i);
    if (revenueMatch) {
      monthlyRevenue = `$${revenueMatch[1]}/month`;
    }
  }

  // Extract risk level
  const riskSection = sections.key_risks || "";
  const riskRows = parseRiskRows(riskSection);
  let riskLevel = "N/A";
  if (riskRows && riskRows.length > 0) {
    const riskText = riskSection.toLowerCase();
    if (riskText.includes("high risk") || riskText.includes("high-risk")) {
      riskLevel = "High";
    } else if (riskText.includes("medium risk") || riskText.includes("moderate")) {
      riskLevel = "Medium";
    } else if (riskText.includes("low risk")) {
      riskLevel = "Low";
    }
  }

  // Extract market opportunity metrics
  const marketSection = sections.market_opportunity || "";
  let marketSize = "N/A";
  let competitionLevel = "N/A";
  
  if (marketSection) {
    const marketText = marketSection.toLowerCase();
    if (marketText.includes("large market") || marketText.includes("billion")) {
      marketSize = "Large";
    } else if (marketText.includes("medium market") || marketText.includes("million")) {
      marketSize = "Medium";
    } else if (marketText.includes("niche") || marketText.includes("small market")) {
      marketSize = "Small";
    }
    
    if (marketText.includes("high competition") || marketText.includes("saturated")) {
      competitionLevel = "High";
    } else if (marketText.includes("moderate competition") || marketText.includes("some competition")) {
      competitionLevel = "Medium";
    } else if (marketText.includes("low competition") || marketText.includes("underserved")) {
      competitionLevel = "Low";
    }
  }

  // Extract customer segment
  const customerSection = sections.customer_persona || "";
  let customerSegment = "N/A";
  if (customerSection) {
    const segmentMatch = customerSection.match(/(?:target|primary|main)\s+(?:customer|audience|segment)[:\-]?\s*([^\n]+)/i);
    if (segmentMatch) {
      customerSegment = segmentMatch[1].trim().substring(0, 100);
    } else {
      const firstLine = customerSection.split('\n')[0]?.trim();
      if (firstLine && firstLine.length > 0) {
        customerSegment = firstLine.substring(0, 100);
      }
    }
  }

  // Extract time to market
  const timelineSection = sections.timeline_effort || sections.execution_path || "";
  let timeToMarket = "N/A";
  if (timelineSection) {
    const timelineMatch = timelineSection.match(/(?:time\s+to\s+market|launch\s+time|timeline)[:\-]?\s*([^\n]+)/i);
    if (timelineMatch) {
      timeToMarket = timelineMatch[1].trim().substring(0, 50);
    } else if (timelineSection.includes("30 days") || timelineSection.includes("1 month")) {
      timeToMarket = "1 month";
    } else if (timelineSection.includes("60 days") || timelineSection.includes("2 months")) {
      timeToMarket = "2 months";
    } else if (timelineSection.includes("90 days") || timelineSection.includes("3 months")) {
      timeToMarket = "3 months";
    }
  }

  // Extract key strengths
  const whyFitsSection = sections.why_fits || sections.intro || "";
  let keyStrengths = idea.summary?.substring(0, 80) || "N/A";
  if (whyFitsSection) {
    const firstBullet = whyFitsSection.match(/^[-*+]\s*(.+)/m);
    if (firstBullet) {
      keyStrengths = firstBullet[1].trim().substring(0, 80);
    } else {
      const firstSentence = whyFitsSection.split('.')[0]?.trim();
      if (firstSentence && firstSentence.length > 0) {
        keyStrengths = firstSentence.substring(0, 80);
      }
    }
  }

  // Extract scalability
  const insightsSection = sections.additional_insights || marketSection || "";
  let scalability = "N/A";
  if (insightsSection) {
    const scaleText = insightsSection.toLowerCase();
    if (scaleText.includes("high scalability") || scaleText.includes("highly scalable") || scaleText.includes("scales well")) {
      scalability = "High";
    } else if (scaleText.includes("moderate scalability") || scaleText.includes("moderate scale")) {
      scalability = "Medium";
    } else if (scaleText.includes("limited scalability") || scaleText.includes("low scalability")) {
      scalability = "Low";
    }
  }

  // Fallbacks from idea object
  if (marketSize === "N/A" && idea.target_market) {
    marketSize = idea.target_market.substring(0, 100);
  }
  
  if (timeToMarket === "N/A" && idea.timeline) {
    timeToMarket = idea.timeline.substring(0, 50);
  }
  
  if (customerSegment === "N/A" && idea.target_market) {
    customerSegment = idea.target_market.substring(0, 100);
  }
  
  if (monthlyRevenue === "N/A" && idea.revenue_model) {
    const revenueMatch = idea.revenue_model.match(/\$?([\d,]+(?:\s*(?:K|thousand))?)/i);
    if (revenueMatch) {
      monthlyRevenue = `$${revenueMatch[1]}/month`;
    } else {
      monthlyRevenue = idea.revenue_model.substring(0, 50);
    }
  }
  
  if (keyStrengths === "N/A" && idea.why_this_fits) {
    keyStrengths = idea.why_this_fits.substring(0, 80);
  } else if (keyStrengths === "N/A" && idea.summary) {
    keyStrengths = idea.summary.substring(0, 80);
  }

  // Additional fallback from idea body
  if (startupCost === "N/A" && ideaBody) {
    const costMatches = [
      ideaBody.match(/startup\s+costs?[:\-]?\s*\$?([\d,]+(?:\s*(?:K|thousand))?)/i),
      ideaBody.match(/initial\s+investment[:\-]?\s*\$?([\d,]+(?:\s*(?:K|thousand))?)/i),
      ideaBody.match(/\$([\d,]+(?:\s*(?:K|thousand))?)\s*(?:startup|initial|investment)/i)
    ];
    for (const match of costMatches) {
      if (match) {
        startupCost = `$${match[1]}`;
        break;
      }
    }
  }
  
  if (monthlyRevenue === "N/A" && ideaBody) {
    const revenueMatches = [
      ideaBody.match(/monthly\s+revenue[:\-]?\s*\$?([\d,]+(?:\s*(?:K|thousand))?)/i),
      ideaBody.match(/revenue[:\-]?\s*\$?([\d,]+(?:\s*(?:K|thousand))?)\s*\/?\s*month/i),
      ideaBody.match(/\$([\d,]+(?:\s*(?:K|thousand))?)\s*(?:per\s+month|monthly)/i)
    ];
    for (const match of revenueMatches) {
      if (match) {
        monthlyRevenue = `$${match[1]}/month`;
        break;
      }
    }
  }

  return {
    startupCost,
    monthlyRevenue,
    marketSize,
    competitionLevel,
    riskLevel,
    timeToMarket,
    customerSegment,
    keyStrengths,
    validationScore: "N/A",
    scalability
  };
}

