import UIHeading from "../ui/ui-heading.jsx";
import IdeaTableRow from "./IdeaTableRow.jsx";

/**
 * Component for displaying the ideas tab content
 */
export default function IdeasTabContent({
  topIdeas,
  allIdeas,
  runId,
  currentRunId,
  effectiveReports,
  cachedRun,
  effectiveInputs,
  ideasWithActions,
  ideasWithNotes
}) {
  return (
    <div className="rounded-3xl border border-default bg-surface p-6 shadow-soft">
      <UIHeading level="h2" className="text-primary mb-1">
        Top Startup Ideas
      </UIHeading>
      <p className="mt-1 text-sm text-secondary">
        Review your three tailored ideas. Click any row to open the full playbook with financial outlook, risk radar, validation questions, and more.
      </p>
      <div className="mt-4 overflow-hidden rounded-2xl border border-default shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-surface text-left uppercase tracking-wide text-secondary">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Idea</th>
              <th className="px-4 py-3">Summary</th>
              <th className="px-4 py-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {topIdeas.map((idea) => {
              const runQuery = runId || currentRunId;
              const ideaId = runQuery ? `run_${runQuery}_idea_${idea.index}` : `idea_${idea.index}`;
              const hasActions = ideasWithActions.has(ideaId);
              const hasNotes = ideasWithNotes.has(ideaId);

              return (
                <IdeaTableRow
                  key={ideaId}
                  idea={idea}
                  runId={runId}
                  currentRunId={currentRunId}
                  allIdeas={allIdeas}
                  effectiveReports={effectiveReports}
                  cachedRun={cachedRun}
                  effectiveInputs={effectiveInputs}
                  hasActions={hasActions}
                  hasNotes={hasNotes}
                />
              );
            })}
            {topIdeas.length < 3 && (
              <tr className="bg-app text-secondary">
                <td colSpan={4} className="px-4 py-3 text-center italic">
                  Fewer than three ideas generated—rerun with expanded preferences for more options.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

