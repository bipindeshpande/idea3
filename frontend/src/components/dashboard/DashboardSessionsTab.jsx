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
        <p className="text-[15px] text-gray-700 leading-relaxed">
          Manage your idea discovery runs and validations - revisit previous recommendations or generate new ones.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-2" aria-label="Session tabs">
          <button
            onClick={() => setActiveTab("ideas")}
            className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
              activeTab === "ideas"
                ? "border-indigo-600 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Ideas Search ({filteredRuns.length})
          </button>
          <button
            onClick={() => setActiveTab("validations")}
            className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
              activeTab === "validations"
                ? "border-indigo-600 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Validations ({filteredValidations.length})
          </button>
        </nav>
      </div>
      
      {loadingRuns ? (
        <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6 md:p-7 text-center">
          <p className="text-[15px] text-gray-700 leading-relaxed">Loading sessions...</p>
        </div>
      ) : (
        <>
          {/* Ideas Search Tab */}
          {activeTab === "ideas" && (
            <>
              {filteredRuns.length === 0 ? (
                <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6 md:p-7 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    No past sessions yet
                  </h3>
                  <p className="text-[15px] text-gray-600 leading-relaxed max-w-md mx-auto">
                    Ideas you explored earlier will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:gap-8">
                  {filteredRuns.map((session) => {
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
                <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6 md:p-7 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    No validations yet
                  </h3>
                  <p className="text-[15px] text-gray-600 leading-relaxed max-w-md mx-auto">
                    Results from checking ideas will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredValidations.map((session) => {
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

