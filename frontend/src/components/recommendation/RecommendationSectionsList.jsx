import CollapsibleSection from "../ui/CollapsibleSection.jsx";
import RecommendationSections from "../recommendations/RecommendationSections.jsx";
import { getSectionToggleId, getSectionDescription } from "../recommendations/utils/sectionConstants.js";
import { getSectionTheme } from "../recommendations/utils/sectionThemes.js";
import { DISCOVERY_SPACING } from "../discovery/DiscoveryTheme.js";
import DiscoveryLoadingState from "../discovery/DiscoveryLoadingState.jsx";

/**
 * Renders the list of collapsible sections for a recommendation
 */
export default function RecommendationSectionsList({
  orderedSections,
  openSections,
  toggleSection,
  fitNarrativeMarkdown,
  discoveryNextSteps,
  financialSnapshot,
  executionPhaseCards,
  riskRows,
  validationQuestions,
  roadmapMarkdown,
  personaMarkdown,
  marketInsights,
  immediateExperimentsList,
  immediateNextSteps,
  decisionChecklist,
  isEnriching,
  hasBody,
  activeIdea
}) {
  return (
    <div className={`flex flex-col ${DISCOVERY_SPACING.sectionGap} mt-8`}>
      {/* Show loading message if we have idea but no body content yet */}
      {activeIdea && !hasBody && isEnriching && (
        <DiscoveryLoadingState
          title="Loading detailed content..."
          message="Loading detailed content for this recommendation..."
          size="sm"
        />
      )}

      {/* Render all sections from orderedSections - single source of truth */}
      {orderedSections.map((section) => {
        // Skip why_fits if fitNarrativeMarkdown is not available (special case)
        if (section.key === "why_fits" && !fitNarrativeMarkdown) {
          return null;
        }

        const toggleId = getSectionToggleId(section.key);
        const description = getSectionDescription(section.key);
        const title = section.key === "immediate_next_steps" && discoveryNextSteps
          ? "Early-stage Next Steps"
          : section.title;

        return (
          <CollapsibleSection
            key={section.key}
            title={title}
            description={description}
            theme={getSectionTheme(title)}
            isOpen={openSections.has(toggleId)}
            onToggle={() => toggleSection(toggleId)}
            className="mb-2"
          >
            <RecommendationSections
              sectionKey={section.key}
              content={section.content}
              isEnriching={isEnriching}
              fitNarrativeMarkdown={fitNarrativeMarkdown}
              financialSnapshot={financialSnapshot}
              executionPhaseCards={executionPhaseCards}
              riskRows={riskRows}
              validationQuestions={validationQuestions}
              roadmapMarkdown={roadmapMarkdown}
              personaMarkdown={personaMarkdown}
              marketInsights={marketInsights}
              immediateExperimentsList={immediateExperimentsList}
              discoveryNextSteps={discoveryNextSteps}
              immediateNextSteps={immediateNextSteps}
              decisionChecklist={decisionChecklist}
            />
          </CollapsibleSection>
        );
      })}
    </div>
  );
}

