import { memo } from "react";
import SessionCard from "./SessionCard.jsx";

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
 <div className="mb-6">
 <p className="text-primary text-primary leading-relaxed">
 Validations you've already run.
 </p>
 </div>
 
 {loadingRuns ? (
 <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 text-center">
 <p className="text-primary text-primary leading-relaxed">Loading validations...</p>
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
 <button
 onClick={() => {
 // For validations, use validation IDs directly
 const selectedIds = Array.from(selectedIdeas);
 performComparison(new Set(selectedIds));
 }}
 disabled={comparing}
 className="px-4 py-2 rounded-lg bg-accent text-on-accent text-sm font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
 >
 {comparing ? "Comparing..." : `Compare selected validations (${selectedIdeas.size})`}
 </button>
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

