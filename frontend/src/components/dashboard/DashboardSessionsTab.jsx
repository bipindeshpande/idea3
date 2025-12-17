import { useState, memo } from "react";
import { Link } from "react-router-dom";
import SessionCard from "./SessionCard.jsx";

function DashboardSessionsTab({
 activeTab,
 setActiveTab,
 filteredRuns,
 filteredValidations,
 loadingRuns,
 sessionHasOpenActions,
 sessionHasNotes,
 handleDelete,
 handleNewRequest,
 handleEditValidation,
}) {
 return (
 <>
 <div className="mb-6">
 <p className="text-primary text-primary leading-relaxed">
 Manage your idea discovery runs and validations - revisit previous recommendations or generate new ones.
 </p>
 </div>

 {/* Tabs */}
 <div className="mb-6 border-b border-default">
 <nav className="flex gap-2" aria-label="Session tabs">
 <button
 onClick={() => setActiveTab("ideas")}
 className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
 activeTab === "ideas"
 ? "border-default text-primary"
 : "border-transparent text-secondary hover:text-primary hover:border-default"
 }`}
 >
 Ideas Search ({filteredRuns.length})
 </button>
 <button
 onClick={() => setActiveTab("validations")}
 className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
 activeTab === "validations"
 ? "border-default text-primary"
 : "border-transparent text-secondary hover:text-primary hover:border-default"
 }`}
 >
 Validations ({filteredValidations.length})
 </button>
 </nav>
 </div>
 
 {loadingRuns ? (
 <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 text-center">
 <p className="text-primary text-primary leading-relaxed">Loading sessions...</p>
 </div>
 ) : (
 <>
 {/* Ideas Search Tab */}
 {activeTab === "ideas" && (
 <>
 {!filteredRuns ? null : filteredRuns.length === 0 ? (
 <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 text-center">
 <h3 className="text-lg font-semibold text-primary mb-1">
 No past sessions yet
 </h3>
 <p className="text-primary text-secondary leading-relaxed max-w-md mx-auto">
 Ideas you explored earlier will appear here.
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

 {/* Validations Tab */}
 {activeTab === "validations" && (
 <>
 {filteredValidations.length === 0 ? (
 <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 text-center">
 <h3 className="text-lg font-semibold text-primary mb-1">
 No validations yet
 </h3>
 <p className="text-primary text-secondary leading-relaxed max-w-md mx-auto">
 Results from checking ideas will appear here.
 </p>
 </div>
 ) : (
 <div className="grid gap-4">
 {(filteredValidations || []).map((session) => {
 const hasOpenActions = sessionHasOpenActions(session);
 const hasNotes = sessionHasNotes(session);
 
 return (
 <SessionCard
 key={session.id}
 session={session}
 hasOpenActions={hasOpenActions}
 hasNotes={hasNotes}
 onDelete={handleDelete}
 onEdit={handleEditValidation}
 isValidation={true}
 />
 );
 })}
 </div>
 )}
 </>
 )}
 </>
 )}
 </>
 );
}

export default memo(DashboardSessionsTab);
