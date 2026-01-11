import { memo } from "react";
import SessionCard from "./SessionCard.jsx";
import { WORKSPACE_TYPOGRAPHY } from "../workspace/WorkspaceTheme.js";

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
 {loadingRuns ? (
  <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 text-center">
   <p className={WORKSPACE_TYPOGRAPHY.subtitle + " leading-relaxed"}>Loading history...</p>
  </div>
 ) : (
  <>
   {filteredRuns.length === 0 ? (
    <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 text-center">
     <h3 className={WORKSPACE_TYPOGRAPHY.h4 + " mb-1"}>
      No discovery runs yet
     </h3>

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

