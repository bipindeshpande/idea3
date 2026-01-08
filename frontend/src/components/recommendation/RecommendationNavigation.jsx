import DiscoveryNavigation from "../discovery/DiscoveryNavigation.jsx";
import OpenForCollaboratorsButton from "../founder/OpenForCollaboratorsButton.jsx";
import { getLogBufferSize, downloadLogFile } from "../../utils/fileLogger.js";

/**
 * Navigation bar for recommendation detail page with optional dev tools
 */
export default function RecommendationNavigation({
  backPath,
  backState,
  isAuthenticated,
  activeIdea,
  runQuery,
  inputs
}) {
  return (
    <DiscoveryNavigation
      backPath={backPath}
      backLabel="Back to recommendations"
      backState={backState}
      showDashboard={isAuthenticated}
      rightContent={
        <>
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => {
                const size = getLogBufferSize();
                if (size > 0) {
                  downloadLogFile();
                } else {
                  alert("No logs collected yet. Logs will be collected as you interact with the page.");
                }
              }}
              className="ui-btn ui-btn-secondary focus-visible:outline-accent text-xs mr-2"
              title={`Download all collected logs as mylog.log (${getLogBufferSize()} entries)`}
            >
              📥 Download Logs ({getLogBufferSize()})
            </button>
          )}
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

