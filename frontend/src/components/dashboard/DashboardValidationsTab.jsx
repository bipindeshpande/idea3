import { memo } from "react";
import SessionCard from "./SessionCard.jsx";
import UIButton from "../ui/ui-button.jsx";

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
 <p className="text-sm text-secondary leading-relaxed">Loading validations...</p>
 </div>
 ) : (
 <>
 {filteredValidations.length === 0 ? (
 <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 text-center">
 <h3 className="text-lg font-semibold text-primary mb-1">
 No validations yet
 </h3>
 <p className="text-secondary leading-relaxed max-w-md mx-auto">
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
 // For validations, use validation IDs directly
 const selectedIds = Array.from(selectedIdeas);
 performComparison(new Set(selectedIds));
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

