import { memo } from "react";
import SessionCard from "./SessionCard.jsx";
import UIButton from "../ui/ui-button.jsx";
import { WORKSPACE_TYPOGRAPHY } from "../workspace/WorkspaceTheme.js";

function DashboardValidationsTab({
 filteredValidations,
 loadingRuns,
 sessionHasOpenActions,
 sessionHasNotes,
 handleDelete,
 handleEditValidation,
 selectedIdeas,
 setSelectedIdeas,
 comparisonData,
 setComparisonData,
 comparing,
 performComparison,
}) {
 return (
 <>
 {loadingRuns ? (
 <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 text-center">
 <p className={WORKSPACE_TYPOGRAPHY.subtitle}>Loading validations...</p>
 </div>
 ) : (
 <>
 {filteredValidations.length === 0 ? (
 <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 text-center">
 <h3 className={`${WORKSPACE_TYPOGRAPHY.h3} mb-1`}>
 No validations yet
 </h3>
 <p className={`${WORKSPACE_TYPOGRAPHY.body} max-w-md mx-auto`}>
 Validations are created when you test your own ideas.
 </p>
 </div>
 ) : (
 <>
 {selectedIdeas && selectedIdeas.size >= 2 && (
 <div className="mb-4 flex justify-end">
 <UIButton
 variant="primary"
 onClick={() => {
  if (selectedIdeas.size < 2) {
   alert("Please select at least 2 validations to compare");
   return;
  }
  // For validations, use validation IDs directly
  performComparison(selectedIdeas);
 }}
 disabled={comparing}
 className="flex items-center gap-2"
 >
 {comparing ? "Comparing..." : `Compare selected validations (${selectedIdeas.size})`}
 </UIButton>
 </div>
 )}
 <div className="grid gap-4">
 {(filteredValidations || []).map((session) => {
 const hasOpenActions = sessionHasOpenActions(session);
 const hasNotes = sessionHasNotes(session);
 const isSelected = selectedIdeas && selectedIdeas.has(session.id);
 
 return (
 <SessionCard
 key={session.id}
 session={session}
 hasOpenActions={hasOpenActions}
 hasNotes={hasNotes}
 onDelete={handleDelete}
 onEdit={handleEditValidation}
 isValidation={true}
 selectedIdeas={selectedIdeas}
 setSelectedIdeas={setSelectedIdeas}
 />
 );
 })}
 </div>
 </>
 )}
 </>
 )}
 </>
 );
}

export default memo(DashboardValidationsTab);

