import { useState } from "react";
import TabButton from "../ui/ui-tab-button.jsx";
import CollapsibleSection from "../ui/CollapsibleSection.jsx";
import RecommendationSections from "../recommendations/RecommendationSections.jsx";
import ActionsNotesTab from "./ActionsNotesTab.jsx";
import PersonaModal from "./PersonaModal.jsx";
import EnrichmentProgress from "./EnrichmentProgress.jsx";
import { getSectionToggleId, getSectionDescription } from "../recommendations/utils/sectionConstants.js";
import { getSectionTheme } from "../recommendations/utils/sectionThemes.js";
import { getSectionIcon } from "../recommendations/utils/sectionIcons.js";
import { DISCOVERY_SPACING } from "../discovery/DiscoveryTheme.js";
import DiscoveryLoadingState from "../discovery/DiscoveryLoadingState.jsx";

/**
 * Tab configuration - defines which sections belong to which tab
 */
const TAB_CONFIG = {
  overview: {
    id: 'overview',
    label: '📋 Overview',
    sections: ['why_fits', 'financial_snapshot', 'immediate_next_steps', 'timeline_effort']
  },
  validation: {
    id: 'validation',
    label: '⚠️ Validation & Risks',
    sections: ['validation_questions', 'key_risks', 'decision_checklist', 'immediate_experiments']
  },
  execution: {
    id: 'execution',
    label: '🚀 Execution',
    sections: ['execution_path']
  },
  research: {
    id: 'research',
    label: '📚 Market Intel',
    sections: ['customer_persona', 'market_opportunity', 'additional_insights']
  },
  actionsNotes: {
    id: 'actionsNotes',
    label: '📋 Actions & Notes',
    sections: [] // Special tab - custom component
  }
};

/**
 * Tabbed view of recommendation sections
 */
export default function RecommendationTabbedSections({
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
  activeIdea,
  heroChips,
  onValidate,
  onSave,
  validating,
  isAuthenticated,
  // Actions & Notes props
  actions,
  notes,
  loadingActions,
  loadingNotes,
  newActionText,
  setNewActionText,
  newNoteContent,
  setNewNoteContent,
  handleCreateAction,
  handleUpdateAction,
  handleCreateNote,
  isValidIdeaId
}) {
  const [activeTab, setActiveTab] = useState('overview'); // Default to Overview tab
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);

  // Group sections by tab
  const sectionsByTab = Object.keys(TAB_CONFIG).reduce((acc, tabKey) => {
    const tabSections = orderedSections.filter(section => 
      TAB_CONFIG[tabKey].sections.includes(section.key)
    );
    acc[tabKey] = tabSections;
    return acc;
  }, {});

  // Get sections for current tab
  const currentSections = sectionsByTab[activeTab] || [];

  return (
    <div className="mt-8">
      {/* Tab Navigation */}
      <div className="border-b border-divider mb-6 -mx-4 sm:mx-0">
        <div className="flex gap-1 sm:gap-2 overflow-x-auto px-4 sm:px-0 scrollbar-hide">
          {Object.values(TAB_CONFIG).map(tab => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </TabButton>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className={`flex flex-col ${DISCOVERY_SPACING.sectionGap}`}>
        {/* Enrichment Progress Indicator */}
        {isEnriching && activeTab !== 'actionsNotes' && (
          <EnrichmentProgress 
            isEnriching={isEnriching}
            currentStage={hasBody ? "finalizing" : "analyzing"}
          />
        )}

        {/* Actions & Notes Tab - Special component */}
        {activeTab === 'actionsNotes' ? (
          <ActionsNotesTab
            actions={actions}
            notes={notes}
            loadingActions={loadingActions}
            loadingNotes={loadingNotes}
            newActionText={newActionText}
            setNewActionText={setNewActionText}
            newNoteContent={newNoteContent}
            setNewNoteContent={setNewNoteContent}
            handleCreateAction={handleCreateAction}
            handleUpdateAction={handleUpdateAction}
            handleCreateNote={handleCreateNote}
            isValidIdeaId={isValidIdeaId}
            isAuthenticated={isAuthenticated}
          />
        ) : currentSections.length === 0 ? (
          <div className="text-center py-8 text-secondary">
            <p>No content available for this section yet.</p>
          </div>
        ) : (
          currentSections.map((section) => {
            // Skip why_fits if fitNarrativeMarkdown is not available (special case)
            if (section.key === "why_fits" && !fitNarrativeMarkdown) {
              return null;
            }

            const toggleId = getSectionToggleId(section.key);
            const description = getSectionDescription(section.key);
            const title = section.key === "immediate_next_steps" && discoveryNextSteps
              ? "Early-stage Next Steps"
              : section.title;
            const sectionIcon = getSectionIcon(section.key);
            const sectionTheme = getSectionTheme(title);

            return (
              <CollapsibleSection
                key={section.key}
                title={title}
                description={description}
                theme={{ ...sectionTheme, icon: sectionIcon }}
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
                  onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
                />
              </CollapsibleSection>
            );
          })
        )}

        {/* Show message if tab has no available content */}
        {currentSections.length > 0 && currentSections.every(section => 
          (section.key === "why_fits" && !fitNarrativeMarkdown) ||
          !section.content || section.content.trim().length === 0
        ) && (
          <div className="text-center py-8 text-secondary">
            <p>Content for this section is being generated...</p>
          </div>
        )}
      </div>

      {/* Persona Modal */}
      <PersonaModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        personaMarkdown={personaMarkdown}
      />
    </div>
  );
}

