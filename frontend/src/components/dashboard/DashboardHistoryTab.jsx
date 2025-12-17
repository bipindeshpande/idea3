import { memo } from "react";
import SessionCard from "./SessionCard.jsx";

function DashboardHistoryTab({
 filteredRuns,
 loadingRuns,
 sessionHasOpenActions,
 sessionHasNotes,
 handleDelete,
 handleNewRequest,
}) {
 return (
 <>
 <div className="mb-6">
 <p className="text-primary text-primary leading-relaxed">
 AI-assisted idea discovery runs (suggestions only). Read-only workspace to revisit AI-generated ideas.
 </p>
 </div>
 
 {loadingRuns ? (
 <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 text-center">
 <p className="text-primary text-primary leading-relaxed">Loading history...</p>
 </div>
 ) : (
 <>
 {filteredRuns.length === 0 ? (
 <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 text-center">
 <h3 className="text-lg font-semibold text-primary mb-1">
 No discovery runs yet
 </h3>
 <p className="text-primary text-secondary leading-relaxed max-w-md mx-auto">
 AI-assisted idea discovery runs will appear here. These are read-only suggestions you can revisit.
 </p>
 </div>
 ) : (
 <div className="grid gap-6 md:gap-8">
 {(filteredRuns || []).map((session) => {
 const hasOpenActions = sessionHasOpenActions(session);
 const hasNotes = sessionHasNotes(session);
 
 return (
 <SessionCard
 key={session.id}
 session={session}
 hasOpenActions={hasOpenActions}
 hasNotes={hasNotes}
 onDelete={handleDelete}
 onEdit={handleNewRequest}
 isValidation={false}
 />
 );
 })}
 </div>
 )}
 </>
 )}
 </>
 );
}

export default memo(DashboardHistoryTab);

