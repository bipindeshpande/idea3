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
 <div 
 key={session.id}
 className={isSelected ? "rounded-xl border-2 border-default bg-surface" : ""}
 >
 {selectedIdeas && (
 <div className="p-2 border-b border-default">
 <input
 type="checkbox"
 checked={isSelected || false}
 onChange={(e) => {
 e.stopPropagation();
 const newSet = new Set(selectedIdeas);
 if (newSet.has(session.id)) {
 newSet.delete(session.id);
 } else {
 if (newSet.size >= 5) {
 alert("Maximum 5 validations can be compared at once");
 return;
 }
 newSet.add(session.id);
 }
 setSelectedIdeas(newSet);
 }}
 className="rounded border-default text-accent "
 />
 <span className="ml-2 text-sm text-primary">Select for comparison</span>
 </div>
 )}
 <SessionCard
 session={session}
 hasOpenActions={hasOpenActions}
 hasNotes={hasNotes}
 onDelete={handleDelete}
 onEdit={handleEditValidation}
 isValidation={true}
 />
 </div>
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

