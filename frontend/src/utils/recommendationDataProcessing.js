import {
  extractWhyFit,
  buildExecutionSteps,
  buildFinancialSnapshots,
  parseRiskRows,
  buildValidationQuestions,
  extractValidationQuestions,
  personalizeCopy,
  dedupeStrings,
} from "./formatters/recommendationFormatters.js";

/**
 * Utility functions for processing recommendation data
 */

export function processRecommendationData(parsedSections, activeIdea, inputs) {
  const whyFit = extractWhyFit(parsedSections.intro || "");

  const executionSteps = buildExecutionSteps(
    parsedSections.execution_path || "",
    activeIdea?.title || "",
    {
      goalType: inputs?.founder_ambition || "",
      timeCommitment: inputs?.time_commitment || "",
      budgetRange: inputs?.budget_range || "",
      workStyle: inputs?.preferred_work_style || "",
      skillStrength: inputs?.skills
        ? Object.keys(inputs.skills)
            .filter((k) => k !== "other" && inputs.skills[k]?.length > 0)
            .join(", ")
        : "",
      focus: inputs?.sub_interest_area || inputs?.industry_interest || "",
    }
  );

  const financialSnapshot = buildFinancialSnapshots(
    parsedSections.financial_snapshot || "",
    activeIdea?.title || "",
    inputs?.budget_range || ""
  );

  const riskRows = parseRiskRows(parsedSections.key_risks || "");

  const validationQuestions = buildValidationQuestions(
    parsedSections.validation_questions || "",
    activeIdea?.title || "",
    inputs?.sub_interest_area || inputs?.industry_interest || "",
    inputs?.founder_ambition || ""
  );

  const heroStatement = (() => {
    let statement = "";
    if (whyFit.length > 0) {
      statement = whyFit[0];
    } else if (parsedSections.intro) {
      const introText = personalizeCopy(parsedSections.intro);
      const firstSentence = introText.split(/(?<=[.!?])\s+/)[0];
      if (firstSentence) {
        statement = firstSentence;
      }
    }

    // Clean statement
    if (statement) {
      statement = statement
        .replace(/^execution\s+path[:\s]*/i, "")
        .replace(/^[-*]\s*\*\*execution\s+path\*\*[:\s]*/i, "")
        .replace(/^[-*]\s*execution\s+path[:\s]*/i, "")
        .replace(/\*\*execution\s+path\*\*[:\s]*/gi, "")
        .replace(/^[-*]\s*/g, "")
        .trim();
    }

    return statement || "This idea aligns with your goals, strengths, and capacity.";
  })();

  const fitHighlights = (() => {
    if (!whyFit.length) return [];
    if (whyFit[0] === heroStatement) {
      return whyFit.slice(1);
    }
    return whyFit;
  })();

  const heroChips = (() => {
    if (!inputs) return [];
    return [
      inputs.founder_ambition && { label: "Goal Fit", value: inputs.founder_ambition },
      inputs.time_commitment && { label: "Time Fit", value: inputs.time_commitment },
      inputs.budget_range && { label: "Budget", value: inputs.budget_range },
      (inputs.sub_interest_area || inputs.industry_interest) && {
        label: "Focus",
        value: inputs.sub_interest_area || inputs.industry_interest,
      },
    ].filter(Boolean);
  })();

  const executionPhases = (() => {
    if (!executionSteps.length) return [];
    return [
      { title: "Validate", steps: executionSteps.slice(0, 3) },
      { title: "Build", steps: executionSteps.slice(3, 6) },
      { title: "Launch", steps: executionSteps.slice(6, 8) },
      { title: "Scale", steps: executionSteps.slice(8, 10) },
    ].filter((phase) => phase.steps.length > 0);
  })();

  const executionPhaseCards = (() => {
    let counter = 0;
    return executionPhases.map((phase) => ({
      title: phase.title,
      items: dedupeStrings(phase.steps).map((step) => {
        counter += 1;
        return { text: step, index: counter };
      }),
    }));
  })();

  const marketInsights = dedupeStrings(
    extractValidationQuestions(parsedSections.market_opportunity || "")
  );

  const personaMarkdown = parsedSections.customer_persona || "";

  const fitNarrativeMarkdown = (() => {
    const raw = parsedSections.intro || "";
    if (!raw) return "";

    let cleaned = raw
      .replace(/^why\s+it\s+fits\s+now[:\s]*/gi, "")
      .replace(/\*\*why\s+it\s+fits\s+now\*\*[:\s]*/gi, "")
      .replace(/why\s+it\s+fits\s+now[:\s]*/gi, "")
      .trim();

    return personalizeCopy(cleaned);
  })();

  const immediateExperimentsList = dedupeStrings(
    extractValidationQuestions(parsedSections.immediate_experiments || "")
  );

  const immediateNextSteps = dedupeStrings(
    extractValidationQuestions(parsedSections.immediate_next_steps || "")
  );

  const decisionChecklist = dedupeStrings(
    extractValidationQuestions(parsedSections.decision_checklist || "")
  );

  const roadmapMarkdown = parsedSections.timeline_effort || "";

  return {
    whyFit,
    executionSteps,
    financialSnapshot,
    riskRows,
    validationQuestions,
    heroStatement,
    fitHighlights,
    heroChips,
    executionPhases,
    executionPhaseCards,
    marketInsights,
    personaMarkdown,
    fitNarrativeMarkdown,
    immediateExperimentsList,
    immediateNextSteps,
    decisionChecklist,
    roadmapMarkdown,
  };
}

