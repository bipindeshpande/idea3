import WhyFitSection from "./sections/WhyFitSection.jsx";
import FinancialSnapshotSection from "./sections/FinancialSnapshotSection.jsx";
import ExecutionPathSection from "./sections/ExecutionPathSection.jsx";
import RisksSection from "./sections/RisksSection.jsx";
import ValidationQuestionsSection from "./sections/ValidationQuestionsSection.jsx";
import TimelineEffortSection from "./sections/TimelineEffortSection.jsx";
import CustomerPersonaSection from "./sections/CustomerPersonaSection.jsx";
import MarketOpportunitySection from "./sections/MarketOpportunitySection.jsx";
import ImmediateExperimentsSection from "./sections/ImmediateExperimentsSection.jsx";
import ImmediateNextStepsSection from "./sections/ImmediateNextStepsSection.jsx";
import DecisionChecklistSection from "./sections/DecisionChecklistSection.jsx";
import AdditionalInsightsSection from "./sections/AdditionalInsightsSection.jsx";

/**
 * Recommendation Sections Component
 * Renders section content based on section key
 */
export default function RecommendationSections({
  sectionKey,
  content,
  isEnriching,
  // Section-specific data
  fitNarrativeMarkdown,
  financialSnapshot,
  executionPhaseCards,
  riskRows,
  validationQuestions,
  roadmapMarkdown,
  personaMarkdown,
  marketInsights,
  immediateExperimentsList,
  discoveryNextSteps,
  immediateNextSteps,
  decisionChecklist,
}) {
  // Skip rendering if enrichment is loading and content is empty
  if (isEnriching && !content?.trim()) {
    return <p className="text-sm text-primary text-primary italic">Content loading...</p>;
  }

  switch (sectionKey) {
    case "why_fits":
      return <WhyFitSection fitNarrativeMarkdown={fitNarrativeMarkdown} isEnriching={isEnriching} />;

    case "financial_snapshot":
      return (
        <FinancialSnapshotSection
          financialSnapshot={financialSnapshot}
          content={content}
          isEnriching={isEnriching}
        />
      );

    case "execution_path":
      return (
        <ExecutionPathSection
          executionPhaseCards={executionPhaseCards}
          content={content}
          isEnriching={isEnriching}
        />
      );

    case "immediate_experiments":
      return (
        <ImmediateExperimentsSection
          immediateExperimentsList={immediateExperimentsList}
          content={content}
          isEnriching={isEnriching}
        />
      );

    case "timeline_effort":
      return (
        <TimelineEffortSection
          roadmapMarkdown={roadmapMarkdown}
          content={content}
          isEnriching={isEnriching}
        />
      );

    case "customer_persona":
      return (
        <CustomerPersonaSection
          personaMarkdown={personaMarkdown}
          validationQuestions={validationQuestions}
          content={content}
          isEnriching={isEnriching}
        />
      );

    case "market_opportunity":
      return (
        <MarketOpportunitySection
          marketInsights={marketInsights}
          content={content}
          isEnriching={isEnriching}
        />
      );

    case "key_risks":
      return (
        <RisksSection
          riskRows={riskRows}
          content={content}
          isEnriching={isEnriching}
        />
      );

    case "validation_questions":
      return (
        <ValidationQuestionsSection
          validationQuestions={validationQuestions}
          content={content}
          isEnriching={isEnriching}
        />
      );

    case "immediate_next_steps":
      return (
        <ImmediateNextStepsSection
          discoveryNextSteps={discoveryNextSteps}
          immediateNextSteps={immediateNextSteps}
          content={content}
          isEnriching={isEnriching}
        />
      );

    case "decision_checklist":
      return (
        <DecisionChecklistSection
          decisionChecklist={decisionChecklist}
          content={content}
          isEnriching={isEnriching}
        />
      );

    case "additional_insights":
      return (
        <AdditionalInsightsSection
          content={content}
          isEnriching={isEnriching}
        />
      );

    default:
      return content?.trim() ? (
        <div className="prose prose-slate max-w-none text-primary text-primary">
          {content}
        </div>
      ) : (
        <p className="text-sm text-primary text-primary italic">No content available yet.</p>
      );
  }
}
