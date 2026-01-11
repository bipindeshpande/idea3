import DiscoveryNavigation from "../discovery/DiscoveryNavigation.jsx";
import OpenForCollaboratorsButton from "../founder/OpenForCollaboratorsButton.jsx";
import { downloadRecommendationPDF } from "../../utils/pdfExport.js";

/**
 * Navigation bar for recommendation detail page with PDF export
 */
export default function RecommendationNavigation({
  backPath,
  backState,
  isAuthenticated,
  activeIdea,
  runQuery,
  inputs,
  isEnriching
}) {
  return (
    <DiscoveryNavigation
      backPath={backPath}
      backLabel="Back to recommendations"
      backState={backState}
      showDashboard={isAuthenticated}
      rightContent={
        <>
          <button
            onClick={() => downloadRecommendationPDF(activeIdea, isEnriching)}
            disabled={isEnriching || !activeIdea}
            className="ui-btn ui-btn-secondary focus-visible:outline-accent text-sm mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title={isEnriching ? "Please wait for the recommendation to finish loading" : "Download complete recommendation as PDF"}
          >
            <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {isEnriching ? "Generating..." : "Download PDF"}
          </button>
          {activeIdea && runQuery && (
            <OpenForCollaboratorsButton
              runId={runQuery}
              sourceType="advisor"
              sourceId={runQuery}
              ideaTitle={activeIdea.title}
              ideaIndex={activeIdea.index}
              categoryAnswers={inputs}
            />
          )}
        </>
      }
      className="mb-6"
    />
  );
}

