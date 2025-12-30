import { personalizeCopy } from "./textFormatters.js";
import { extractListFromText } from "./textFormatters.js";
import { truncateText } from "./textFormatters.js";

const EXECUTION_TEMPLATES = [
  "Define the success metrics you will track for {{idea}} so progress maps cleanly to your goal of {{goalType}}.",
  "Map the end-to-end customer journey for {{idea}}, highlighting where your {{skillStrength}} strengths create outsized value.",
  "Break work into weekly sprints that respect your availability of {{timeCommitment}}, and assign a focus theme to each sprint.",
  "Line up at least five discovery conversations with {{focus}} prospects to validate demand before you build further.",
  "Prototype the core experience for {{idea}} and gather feedback using lightweight tools that fit your {{budgetRange}} budget.",
  "Run two pricing experiments that reflect how {{idea}} monetizes, keeping each test under {{budgetRange}} per month.",
  "Design a launch playbook that matches your preferred {{workStyle}} work style and existing distribution channels.",
  "Outline tooling, partners, or contractors required for {{idea}}, then secure one quick-win collaboration this month.",
  "Schedule bi-weekly reviews to check traction, cost, and energy levels so {{idea}} stays aligned with your goal of {{goalType}}.",
  "Identify the first collaborator who complements your {{skillStrength}} strengths and draft how they would accelerate {{idea}}.",
  "Document a fallback scenario that keeps {{idea}} moving even if key assumptions fail, protecting your {{budgetRange}} commitment.",
];

/**
 * Helper: Get focus-specific plan text
 */
function focusSpecificPlan(focus = "") {
  const topic = focus.toLowerCase();
  if (topic.includes("ai") || topic.includes("automation")) {
    return "Launch a proof-of-concept demo using low/no-code AI tooling and publish a before/after case study";
  }
  if (topic.includes("consulting")) {
    return "Create a signature diagnostic workshop and map outreach to three warm prospects";
  }
  if (topic.includes("education") || topic.includes("edtech")) {
    return "Design a pilot curriculum outline and recruit five beta learners for feedback";
  }
  if (topic.includes("health") || topic.includes("wellness")) {
    return "Validate compliance needs, partner with a domain expert, and schedule initial practitioner interviews";
  }
  if (topic.includes("finance")) {
    return "Prepare a lightweight financial model and test trust signals with two target customer segments";
  }
  if (topic.includes("e-commerce") || topic.includes("retail")) {
    return "Source initial inventory partners, build a landing page with top three SKUs, and set up retargeting audiences";
  }
  if (topic.includes("content") || topic.includes("media")) {
    return "Draft a content calendar, produce a flagship piece, and run hooks across two distribution channels";
  }
  if (topic.includes("sustainability") || topic.includes("green")) {
    return "Document measurable impact metrics and align them with potential partners or certification bodies";
  }
  if (topic.includes("lifestyle") || topic.includes("travel") || topic.includes("food")) {
    return "Curate packages with local partners and run a concierge-style pilot to collect testimonials";
  }
  return "Document the most critical milestone for your niche and map how it ladders to revenue or traction goals";
}

/**
 * Build execution steps from section text
 */
export function buildExecutionSteps(
  sectionText = "",
  ideaTitle = "",
  {
    goalType = "your goal",
    timeCommitment = "10–15 hrs/week",
    budgetRange = "a lean launch budget",
    workStyle = "your preferred work style",
    skillStrength = "core strengths",
    focus = "target customers",
  } = {}
) {
  const items = extractListFromText(sectionText);
  const normalizedTitle = ideaTitle || "this idea";
  const steps = [];

  const seen = new Set();
  items.forEach((item) => {
    const cleaned = personalizeCopy(item);
    const fingerprint = cleaned.toLowerCase();
    if (!seen.has(fingerprint)) {
      seen.add(fingerprint);
      steps.push(cleaned);
    }
  });

  // Create idea-specific variations by using idea title to seed template selection
  // This ensures different ideas get different step orders and variations
  const ideaHash = normalizedTitle.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const shuffledTemplates = [...EXECUTION_TEMPLATES];
  
  // Shuffle templates based on idea title to vary the order
  for (let i = shuffledTemplates.length - 1; i > 0; i--) {
    const j = (ideaHash + i) % (i + 1);
    [shuffledTemplates[i], shuffledTemplates[j]] = [shuffledTemplates[j], shuffledTemplates[i]];
  }

  let templateIndex = 0;
  while (steps.length < 10 && templateIndex < shuffledTemplates.length) {
    const template = shuffledTemplates[templateIndex];
    
    // Add idea-specific variations to make steps more unique
    const ideaVariations = {
      "ai": "Leverage AI tools and APIs",
      "platform": "Set up your platform infrastructure",
      "marketplace": "Build your marketplace foundation",
      "service": "Design your service delivery model",
      "app": "Develop your app architecture",
      "saas": "Build your SaaS infrastructure",
    };
    
    let ideaSpecificPrefix = "";
    for (const [keyword, prefix] of Object.entries(ideaVariations)) {
      if (normalizedTitle.toLowerCase().includes(keyword)) {
        ideaSpecificPrefix = prefix;
        break;
      }
    }
    
    const filled = template
      .replace(/{{idea}}/g, normalizedTitle)
      .replace(/{{goalType}}/g, goalType)
      .replace(/{{timeCommitment}}/g, timeCommitment)
      .replace(/{{budgetRange}}/g, budgetRange)
      .replace(/{{workStyle}}/g, workStyle)
      .replace(/{{skillStrength}}/g, skillStrength)
      .replace(/{{focus}}/g, focus)
      .replace(/{{categoryPlan}}/g, focusSpecificPlan(focus));
    
    // Add idea-specific context to make steps more unique (only for first step to avoid duplication)
    let enhancedStep = filled;
    // Only add prefix if it's the first template AND the filled template doesn't already contain the prefix text
    const prefixFirstWord = ideaSpecificPrefix ? ideaSpecificPrefix.toLowerCase().split(' ')[0] : '';
    const filledLower = filled.toLowerCase();
    const alreadyHasPrefix = prefixFirstWord && filledLower.includes(prefixFirstWord) && filledLower.includes('service delivery');
    
    if (ideaSpecificPrefix && templateIndex === 0 && !alreadyHasPrefix) {
      enhancedStep = `${ideaSpecificPrefix} for ${normalizedTitle}. ${filled}`;
    }
    
    const cleaned = personalizeCopy(enhancedStep);
    const fingerprint = cleaned.toLowerCase();
    
    // Check for duplicates - both full text and core content (without prefix)
    const coreContent = cleaned.replace(/^[^.]*\.\s*/i, '').toLowerCase().trim();
    const isDuplicate = seen.has(fingerprint) || seen.has(coreContent);
    
    if (!isDuplicate) {
      seen.add(fingerprint);
      seen.add(coreContent);
      steps.push(cleaned);
    }
    templateIndex += 1;
  }
  
  // Add more idea-specific fallbacks
  while (steps.length < 10) {
    const ideaSpecificFallbacks = [
      `Research competitors in the ${normalizedTitle} space and identify your unique positioning.`,
      `Create a minimum viable version of ${normalizedTitle} that you can test with real users.`,
      `Set up analytics and tracking to measure how ${normalizedTitle} performs.`,
      `Build a waitlist or early access program for ${normalizedTitle}.`,
      `Develop a go-to-market strategy specifically for ${normalizedTitle}.`,
    ];
    const fallbackIndex = (ideaHash + steps.length) % ideaSpecificFallbacks.length;
    const fallback = ideaSpecificFallbacks[fallbackIndex]
      .replace(/{{idea}}/g, normalizedTitle)
      .replace(/{{goalType}}/g, goalType);
    const fingerprint = fallback.toLowerCase();
    if (!seen.has(fingerprint)) {
      seen.add(fingerprint);
      steps.push(fallback);
    } else {
      break;
    }
  }
  return steps.slice(0, Math.max(10, steps.length));
}

/**
 * Extract timeline slice for a specific segment index
 */
export function extractTimelineSlice(markdown = "", segmentIndex = 0) {
  if (!markdown) return "Define clear milestones for this period.";
  
  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development' && segmentIndex === 0) {
    console.log('[extractTimelineSlice] Markdown preview:', markdown.substring(0, 200));
  }
  
  // FIX: First, try to parse as simple bullet list (- prefix)
  // This handles enrichment markdown that uses simple bullets like:
  // - MVP Development: 4–6 weeks...
  // - Launch: Aim for 3 months...
  const lines = markdown.split(/\r?\n/);
  const bulletLines = lines
    .map(line => line.trim())
    .filter(line => {
      // Match lines starting with - or * (bullet points)
      return /^[-*]\s+/.test(line);
    })
    .map(line => {
      // Remove bullet prefix and clean up
      return line.replace(/^[-*]\s+/, "").trim();
    })
    .filter(line => line.length > 0);
  
  if (bulletLines.length > 0) {
    console.log(`[extractTimelineSlice] Found ${bulletLines.length} bullet points`);
    // Return the requested segment if it exists, otherwise return all bullets as fallback
    if (bulletLines[segmentIndex]) {
      console.log(`[extractTimelineSlice] Returning bullet segment ${segmentIndex}:`, bulletLines[segmentIndex].substring(0, 80));
      return bulletLines[segmentIndex];
    }
    // If segmentIndex is out of range, return first bullet or all bullets joined
    if (segmentIndex === 0) {
      return bulletLines[0];
    }
    // For other indices, return the first bullet as fallback
    return bulletLines[0];
  }
  
  // First, try to parse as markdown table
  const rows = markdown.match(/\|.*\|/g);
  if (rows && rows.length >= 3) {
    const dataRows = rows.slice(2); // skip header and separator
    const target = dataRows[segmentIndex];
    if (target) {
      const cells = target.split("|").map((cell) => cell.trim()).filter(cell => cell);
      if (cells.length >= 2) {
        // Usually the content is in the last cell
        const content = cells[cells.length - 1] || cells[1];
        if (content && content !== "Define clear milestones for this period." && content.length > 10) {
          return content;
        }
      }
    }
  }
  
  // Split by lines for more reliable parsing
  const segments = [];
  let currentSegment = [];
  let currentSegmentIndex = -1;
  
  // Day range patterns - handle various formats
  // Note: Handle em dash (–, \u2013), en dash (–, \u2014), and regular dash (-)
  // The dash can be directly attached to numbers or have spaces
  // Also handle cases where "Days" might be singular or plural
  const dayPatterns = [
    { index: 0, patterns: [
      /\*\*Days?\s*0\s*[–\-\u2013\u2014]\s*30\s*\*\*:?/i, // **Days 0 – 30**: (with spaces)
      /\*\*Days?\s*0[–\-\u2013\u2014]30\s*\*\*:?/i, // **Days 0–30**: (no spaces, em dash)
      /\*\*Days?\s*0-30\s*\*\*:?/i, // **Days 0-30**: (no spaces, regular dash)
      /\*\*Days?\s*0\s*to\s*30\s*\*\*:?/i, // **Days 0 to 30**:
      /\*\*30\s*Days?:\*\*/i,
      /\*\*Days?\s*0\s*[-–]\s*30\s*Days?:\*\*/i
    ]},
    { index: 1, patterns: [
      /\*\*Days?\s*30\s*[–\-\u2013\u2014]\s*60\s*\*\*:?/i, // **Days 30 – 60**: (with spaces)
      /\*\*Days?\s*30[–\-\u2013\u2014]60\s*\*\*:?/i, // **Days 30–60**: (no spaces, em dash)
      /\*\*Days?\s*30-60\s*\*\*:?/i, // **Days 30-60**: (no spaces, regular dash)
      /\*\*Days?\s*30\s*to\s*60\s*\*\*:?/i, // **Days 30 to 60**:
      /\*\*60\s*Days?:\*\*/i,
      /\*\*Days?\s*30\s*[-–]\s*60\s*Days?:\*\*/i
    ]},
    { index: 2, patterns: [
      /\*\*Days?\s*60\s*[–\-\u2013\u2014]\s*90\s*\*\*:?/i, // **Days 60 – 90**: (with spaces)
      /\*\*Days?\s*60[–\-\u2013\u2014]90\s*\*\*:?/i, // **Days 60–90**: (no spaces, em dash)
      /\*\*Days?\s*60-90\s*\*\*:?/i, // **Days 60-90**: (no spaces, regular dash)
      /\*\*Days?\s*60\s*to\s*90\s*\*\*:?/i, // **Days 60 to 90**:
      /\*\*90\s*Days?:\*\*/i,
      /\*\*Days?\s*60\s*[-–]\s*90\s*Days?:\*\*/i
    ]}
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let lineProcessed = false;
    
    // Check if this line starts a new segment
    for (const dayPattern of dayPatterns) {
      for (const pattern of dayPattern.patterns) {
        if (pattern.test(line)) {
          // Save previous segment if exists
          if (currentSegmentIndex >= 0 && currentSegment.length > 0) {
            segments[currentSegmentIndex] = currentSegment.join("\n").trim();
          }
          
          // Start new segment
          currentSegmentIndex = dayPattern.index;
          currentSegment = [];
          
          // Remove the day marker and add the rest of the line
          const cleanedLine = line.replace(pattern, "").trim().replace(/^[:–\-\s]+/, "").trim();
          if (cleanedLine) {
            currentSegment.push(cleanedLine);
          }
          lineProcessed = true;
          
          // Debug logging
          if (process.env.NODE_ENV === 'development') {
            console.log(`[extractTimelineSlice] Found pattern for segment ${dayPattern.index} in line:`, line.substring(0, 80));
          }
          break;
        }
      }
      if (lineProcessed) break;
    }
    
    // If we're in a segment and line wasn't processed as a day marker, add it to current segment
    if (currentSegmentIndex >= 0 && !lineProcessed) {
      currentSegment.push(line);
    }
  }
  
  // Save the last segment
  if (currentSegmentIndex >= 0 && currentSegment.length > 0) {
    segments[currentSegmentIndex] = currentSegment.join("\n").trim();
  }
  
  // Return the requested segment
  if (segments[segmentIndex] && segments[segmentIndex].length > 10) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[extractTimelineSlice] Returning segment ${segmentIndex}, length:`, segments[segmentIndex].length);
    }
    return segments[segmentIndex];
  }
  
  // Debug: log what we found
  if (process.env.NODE_ENV === 'development') {
    console.log(`[extractTimelineSlice] No segment found for index ${segmentIndex}. Found segments:`, segments.map((s, i) => ({ index: i, length: s?.length || 0 })));
    console.log(`[extractTimelineSlice] Markdown lines count:`, lines.length);
    console.log(`[extractTimelineSlice] First 10 lines:`, lines.slice(0, 10));
  }
  
  // FIX: Fallback - if no segments found, return the whole timeline_effort text
  // This prevents UI from breaking when timeline parsing fails
  const trimmedMarkdown = markdown.trim();
  if (trimmedMarkdown.length > 0) {
    console.log(`[extractTimelineSlice] No segments found, returning full markdown as fallback (length: ${trimmedMarkdown.length})`);
    return trimmedMarkdown;
  }
  
  return "Define clear milestones for this period.";
}

/**
 * Generates a final conclusion with decision and rationale based on top ideas and matrix data
 */
export function buildFinalConclusion(topIdeas = [], matrixRows = [], inputs = {}) {
  if (!topIdeas || topIdeas.length === 0) {
    return null;
  }

  // Score each idea based on matrix data
  const ideaScores = topIdeas.map((idea, index) => {
    const matrixRow = matrixRows.find((row) => row.order === index + 1 || row.idea.toLowerCase().includes(idea.title.toLowerCase().substring(0, 20)));
    if (!matrixRow) return { idea, score: 0, reasons: [] };

    let score = 0;
    const reasons = [];

    // Goal alignment (weight: 3)
    const goalLower = (matrixRow.goal || "").toLowerCase();
    if (goalLower.includes("high") || goalLower.includes("strong")) {
      score += 3;
      reasons.push("strong goal alignment");
    } else if (goalLower.includes("medium") || goalLower.includes("moderate")) {
      score += 1.5;
      reasons.push("moderate goal alignment");
    }

    // Skill fit (weight: 2)
    const skillLower = (matrixRow.skill || "").toLowerCase();
    if (skillLower.includes("high") || skillLower.includes("strong")) {
      score += 2;
      reasons.push("excellent skill match");
    } else if (skillLower.includes("medium")) {
      score += 1;
      reasons.push("good skill match");
    }

    // Work style (weight: 1.5)
    const workStyleLower = (matrixRow.workStyle || "").toLowerCase();
    if (workStyleLower.includes("strongly") || workStyleLower.includes("perfect")) {
      score += 1.5;
      reasons.push("ideal work style fit");
    } else if (workStyleLower.includes("aligned") || workStyleLower.includes("matches")) {
      score += 0.75;
      reasons.push("compatible work style");
    }

    // Budget fit (weight: 1)
    const budgetLower = (matrixRow.budget || "").toLowerCase();
    if (budgetLower.includes("within") || budgetLower.includes("fits")) {
      score += 1;
      reasons.push("budget-friendly");
    }

    // Time fit (weight: 1)
    const timeLower = (matrixRow.time || "").toLowerCase();
    if (timeLower.includes("aligned") || timeLower.includes("fits")) {
      score += 1;
      reasons.push("time-appropriate");
    }

    return { idea, score, reasons, matrixRow };
  });

  // Sort by score
  ideaScores.sort((a, b) => b.score - a.score);
  const topRecommendation = ideaScores[0];
  const secondChoice = ideaScores[1];
  const thirdChoice = ideaScores[2];

  // Build conclusion text
  const goalType = inputs.goal_type || "your goals";
  const timeCommitment = inputs.time_commitment || "your available time";
  const budgetRange = inputs.budget_range || "your budget";

  // Build concise, one-page conclusion
  const topReasons = topRecommendation.reasons.slice(0, 3).join(", ");
  const isClearWinner = topRecommendation.score > (secondChoice?.score || 0) + 1;
  
  let conclusion = `## Final Recommendation & Decision Rationale\n\n`;
  
  conclusion += `**Top Recommendation: ${topRecommendation.idea.title}**\n\n`;
  conclusion += `This idea scores highest for your profile (${goalType}, ${timeCommitment}, ${budgetRange}) because: ${topReasons}. `;
  
  if (isClearWinner) {
    conclusion += `It clearly stands out from alternatives, aligning strongly with your ${goalType} goal while leveraging your strengths.\n\n`;
  } else {
    conclusion += `While it's the top choice, ${secondChoice?.idea.title || "the second option"} is close—consider your personal interest and risk tolerance.\n\n`;
  }

  if (secondChoice && secondChoice.score > 0) {
    const altReasons = secondChoice.reasons.slice(0, 2).join(", ");
    conclusion += `**Alternative: ${secondChoice.idea.title}** — Consider if: ${altReasons}. `;
    conclusion += `A solid backup if priorities shift.\n\n`;
  }

  conclusion += `**Decision Guide:** Choose ${topRecommendation.idea.title} for highest goal alignment and ${timeCommitment} fit. `;
  conclusion += `Consider ${secondChoice?.idea.title || "the alternative"} if you have stronger interest in that domain or want to diversify.\n\n`;
  
  conclusion += `**Next Steps:** (1) Validate using the questions provided, (2) Review financial outlook for ${budgetRange} fit, (3) Check risk radar, (4) Follow the 30/60/90 roadmap, (5) Revisit after 30 days.\n\n`;
  
  conclusion += `*Remember: The best idea is one you'll execute. If you're more excited about ${secondChoice?.idea.title || "another option"}, that enthusiasm often outweighs perfect alignment scores.*`;

  return personalizeCopy(conclusion);
}
