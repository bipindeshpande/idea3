/**
 * IdeaTableRow - Component for displaying an idea in a table row
 */
import { useNavigate } from "react-router-dom";
import DiscoveryBadge from "./DiscoveryBadge.jsx";
import UIBadge from "../ui/ui-badge.jsx";
import { personalizeCopy } from "../../utils/formatters/recommendationFormatters.js";

export default function IdeaTableRow({
  idea,
  runId,
  currentRunId,
  allIdeas,
  effectiveReports,
  cachedRun,
  effectiveInputs,
  hasActions = false,
  hasNotes = false
}) {
  const navigate = useNavigate();
  const runQuery = runId || currentRunId;
  const detailPath = runQuery
    ? `/results/recommendations/${idea.index}?id=${runQuery}`
    : `/results/recommendations/${idea.index}`;

  const handleViewDetails = () => {
    navigate(detailPath, {
      state: {
        idea: idea,
        allIdeas: allIdeas,
        recommendations: effectiveReports,
        run: cachedRun,
        runId: runQuery,
        inputs: effectiveInputs
      }
    });
  };

  return (
    <tr className="transition hover:bg-surface">
      <td className="px-4 py-3 font-semibold text-secondary">{idea.index}</td>
      <td className="px-4 py-3 font-medium text-primary">
        <div className="flex items-center gap-2">
          <span>{idea.title}</span>
          {(hasActions || hasNotes) && (
            <div className="flex items-center gap-1">
              {hasActions && (
                <DiscoveryBadge
                  variant="accent"
                  size="sm"
                  icon={
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  }
                  title="Has action items"
                >
                  Tasks
                </DiscoveryBadge>
              )}
              {hasNotes && (
                <UIBadge variant="info" className="inline-flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Notes
                </UIBadge>
              )}
            </div>
          )}
        </div>
        {runQuery && (
          <p className="mt-1 text-xs text-secondary">
            ID: {runQuery.slice(-8)}
          </p>
        )}
      </td>
      <td className="px-4 py-3 text-secondary">{personalizeCopy(idea.summary)}</td>
      <td className="px-4 py-3">
        <button
          onClick={handleViewDetails}
          className="mx-auto flex max-w-[8rem] justify-center rounded-full px-4 py-2 text-xs font-semibold text-on-accent bg-accent shadow-sm transition hover:bg-accent-hover whitespace-nowrap"
        >
          View details
        </button>
      </td>
    </tr>
  );
}

