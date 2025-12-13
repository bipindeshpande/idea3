import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { formFieldsConfig } from "../../config/formFieldsConfig.js";

function DashboardSearchTab({
  advancedSearch,
  setAdvancedSearch,
  searchPerformed,
  setSearchPerformed,
  selectedSearchIdeas,
  setSelectedSearchIdeas,
  filteredIdeas,
  filteredValidations,
  allIdeas,
  allValidations,
  allRuns,
  dateFilter,
  setDateFilter,
  scoreFilter,
  setScoreFilter,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  searchInput,
  setSearchInput,
  setActiveTab,
  setSelectedIdeas,
  setComparisonData,
  setAutoCompareTrigger,
  performComparison,
}) {
  // Check if user has any runs
  const hasRuns = allRuns && allRuns.length > 0;
  // Debug logging for search
  if (process.env.NODE_ENV === 'development' && searchPerformed) {
    console.log("[DashboardSearchTab] Search state:", {
      searchType: advancedSearch.searchType,
      searchQuery: searchQuery,
      allIdeasCount: allIdeas.length,
      filteredIdeasCount: filteredIdeas.length,
      filters: {
        goalType: advancedSearch.goalType,
        interestArea: advancedSearch.interestArea,
        budgetRange: advancedSearch.budgetRange,
        timeCommitment: advancedSearch.timeCommitment,
        dateFilter: dateFilter,
      },
      sampleIdea: allIdeas[0] ? {
        id: allIdeas[0].id,
        title: allIdeas[0].title,
        runInputs: allIdeas[0].runInputs ? Object.keys(allIdeas[0].runInputs) : null,
      } : null,
    });
  }

  // Show placeholder when user has no runs
  if (!hasRuns) {
    return (
      <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/30 p-8 text-center">
        <div className="mb-4 text-4xl">🔍</div>
        <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
          Search
        </h3>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
          No items yet. These appear as you explore or validate ideas.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/advisor"
            className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
          >
            Explore ideas
          </Link>
          <span className="text-slate-400">•</span>
          <Link
            to="/validate-idea"
            className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
          >
            Validate an idea
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">Advanced Search</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Use multiple search criteria and filters to find exactly what you're looking for.
        </p>
      </div>

      {/* Advanced Search Form - Hide when search performed */}
      {!searchPerformed && (
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-800/95 p-6 shadow-lg">
          <div className="space-y-4">
            {/* Search Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Search Type
              </label>
              <select
                value={advancedSearch.searchType}
                onChange={(e) => {
                  setAdvancedSearch({
                    goalType: "all",
                    interestArea: "all",
                    ideaDescription: "",
                    budgetRange: "all",
                    timeCommitment: "all",
                    workStyle: "all",
                    skillStrength: "all",
                    searchType: e.target.value,
                  });
                  setSearchQuery("");
                  setSearchInput("");
                }}
                className="w-full rounded-lg border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:border-brand-400 dark:focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
              >
                <option value="ideas">Ideas</option>
                <option value="validations">Validations</option>
              </select>
            </div>

            {/* Search Fields Grid */}
            {advancedSearch.searchType === "ideas" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Founder Ambition */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Founder Ambition
                  </label>
                  <select
                    value={advancedSearch.goalType}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, goalType: e.target.value})}
                    className="w-full rounded-lg border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:border-brand-400 dark:focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
                  >
                    <option value="all">All Goals</option>
                    <option value="Side income">Side income</option>
                    <option value="Full-time business">Full-time business</option>
                    <option value="Scalable venture">Scalable venture</option>
                    <option value="Turn hobby into business">Turn hobby into business</option>
                    <option value="Social Impact">Social Impact</option>
                    <option value="Part-time business">Part-time business</option>
                  </select>
                </div>

                {/* Industry Interest */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Industry Interest
                  </label>
                  <select
                    value={advancedSearch.interestArea}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, interestArea: e.target.value})}
                    className="w-full rounded-lg border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:border-brand-400 dark:focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
                  >
                    <option value="all">All Industries</option>
                    <option value="AI & Automation">AI & Automation</option>
                    <option value="Freelancing / Consulting">Freelancing / Consulting</option>
                    <option value="Education">Education</option>
                    <option value="Beauty & Wellness">Beauty & Wellness</option>
                    <option value="Finance / Accounting">Finance / Accounting</option>
                    <option value="Retail & E-commerce">Retail & E-commerce</option>
                    <option value="Social Impact">Social Impact</option>
                    <option value="Travel & Tourism">Travel & Tourism</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Budget Range */}
                {(() => {
                  const budgetField = formFieldsConfig.fields.find(f => f.id === "budget_range");
                  return (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Budget Range
                      </label>
                      <select
                        value={advancedSearch.budgetRange}
                        onChange={(e) => setAdvancedSearch({...advancedSearch, budgetRange: e.target.value})}
                        className="w-full rounded-lg border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:border-brand-400 dark:focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
                      >
                        <option value="all">All Budgets</option>
                        {budgetField?.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })()}

                {/* Time Commitment */}
                {(() => {
                  const timeField = formFieldsConfig.fields.find(f => f.id === "time_commitment");
                  return (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Time Commitment
                      </label>
                      <select
                        value={advancedSearch.timeCommitment}
                        onChange={(e) => setAdvancedSearch({...advancedSearch, timeCommitment: e.target.value})}
                        className="w-full rounded-lg border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:border-brand-400 dark:focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
                      >
                        <option value="all">All Time</option>
                        {timeField?.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Validation Score Range */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Validation Score Range
                  </label>
                  <select
                    value={scoreFilter}
                    onChange={(e) => setScoreFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:border-brand-400 dark:focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
                  >
                    <option value="all">All Scores</option>
                    <option value="high">High (≥7.0)</option>
                    <option value="medium">Medium (5.0-6.9)</option>
                    <option value="low">Low (&lt;5.0)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  const queryParts = [];
                  if (advancedSearch.goalType && advancedSearch.goalType !== "all") queryParts.push(advancedSearch.goalType);
                  if (advancedSearch.interestArea && advancedSearch.interestArea !== "all") queryParts.push(advancedSearch.interestArea);
                  if (advancedSearch.ideaDescription && advancedSearch.ideaDescription.trim()) queryParts.push(advancedSearch.ideaDescription.trim());
                  
                  const finalQuery = queryParts.join(" ").trim();
                  // Set query to empty string if no filters, so allIdeas will be shown
                  setSearchQuery(finalQuery);
                  setSearchInput(finalQuery);
                  setSearchPerformed(true);
                  
                  if (process.env.NODE_ENV === 'development') {
                    console.log("[DashboardSearchTab] Search triggered:", {
                      query: finalQuery,
                      filters: {
                        goalType: advancedSearch.goalType,
                        interestArea: advancedSearch.interestArea,
                        budgetRange: advancedSearch.budgetRange,
                        timeCommitment: advancedSearch.timeCommitment,
                      },
                    });
                  }
                }}
                className="flex-1 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all duration-200 hover:from-brand-600 hover:to-brand-700 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5"
              >
                Search
              </button>
              <button
                onClick={() => {
                  setAdvancedSearch({
                    goalType: "all",
                    interestArea: "all",
                    ideaDescription: "",
                    budgetRange: "all",
                    timeCommitment: "all",
                    workStyle: "all",
                    skillStrength: "all",
                    searchType: "ideas",
                  });
                  setSearchInput("");
                  setSearchQuery("");
                  setDateFilter("all");
                  setScoreFilter("all");
                  setSortBy("date");
                  setSearchPerformed(false);
                  setSelectedSearchIdeas(new Set());
                }}
                className="rounded-xl border border-slate-300 dark:border-slate-600 px-6 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Count and Compare Button */}
      {searchPerformed && (
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {advancedSearch.searchType === "ideas" && (
              <>Showing {filteredIdeas.length} of {allIdeas.length} ideas</>
            )}
            {advancedSearch.searchType === "validations" && (
              <>Showing {filteredValidations.length} of {allValidations.length} validations</>
            )}
          </div>
          {advancedSearch.searchType === "ideas" && filteredIdeas.length > 0 && selectedSearchIdeas.size > 0 && (
            <button
              onClick={async () => {
                // Normalize IDs for comparison
                const normalizedSelectedSet = new Set(Array.from(selectedSearchIdeas).map(id => String(id)));
                const selectedIdeasData = filteredIdeas.filter(idea => {
                  const normalizedId = String(idea.id || '');
                  return normalizedSelectedSet.has(normalizedId);
                });
                const selectedIds = new Set(selectedIdeasData.map(idea => String(idea.id || '')));
                setSelectedIdeas(selectedIds);
                setComparisonData(null);
                setAutoCompareTrigger(true);
                setActiveTab("compare");
                await performComparison(selectedIds);
              }}
              className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all duration-200 hover:from-brand-600 hover:to-brand-700 hover:shadow-xl hover:shadow-brand-500/30"
            >
              Compare {selectedSearchIdeas.size} Idea{selectedSearchIdeas.size !== 1 ? "s" : ""}
            </button>
          )}
          <button
            onClick={() => {
              setSearchPerformed(false);
              setSelectedSearchIdeas(new Set());
            }}
            className="rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            New Search
          </button>
        </div>
      )}

      {/* Search Results */}
      {searchPerformed && (
        <div className="space-y-4">
          {/* Ideas Results */}
          {advancedSearch.searchType === "ideas" && filteredIdeas.length > 0 && (
            <div className="grid gap-4">
              {filteredIdeas.map((idea) => {
                // Normalize ID for comparison
                const normalizedId = String(idea.id || '');
                const normalizedSelectedSet = new Set(Array.from(selectedSearchIdeas).map(id => String(id)));
                const isSelected = normalizedSelectedSet.has(normalizedId);
                
                return (
                  <div
                    key={normalizedId}
                    className={`rounded-xl border p-4 transition-all ${
                      isSelected
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const newSet = new Set(Array.from(selectedSearchIdeas).map(id => String(id)));
                          if (newSet.has(normalizedId)) {
                            newSet.delete(normalizedId);
                          } else {
                            if (newSet.size >= 5) {
                              alert("Maximum 5 ideas can be compared at once");
                              return;
                            }
                            newSet.add(normalizedId);
                          }
                          setSelectedSearchIdeas(newSet);
                        }}
                        className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                          {idea.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {idea.summary}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {idea.runCreatedAt ? new Date(idea.runCreatedAt).toLocaleDateString() : "Unknown date"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Validations Results */}
          {advancedSearch.searchType === "validations" && filteredValidations.length > 0 && (
            <div className="grid gap-4">
              {filteredValidations.map((session) => (
                <div
                  key={session.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4"
                >
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                    {session.idea_explanation || "Validation"}
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                    {session.overall_score !== undefined && (
                      <span className="text-xs font-bold text-brand-700 dark:text-brand-300">
                        Score: {session.overall_score.toFixed(1)}/10
                      </span>
                    )}
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ID: {session.validation_id || session.id || "N/A"} • {session.timestamp ? new Date(session.timestamp).toLocaleDateString() : "Unknown date"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {((advancedSearch.searchType === "ideas" && filteredIdeas.length === 0) ||
            (advancedSearch.searchType === "validations" && filteredValidations.length === 0)) && (
            <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-800/50 p-6 text-center">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {advancedSearch.searchType === "ideas" 
                  ? `No ideas found. ${allIdeas.length === 0 ? "No ideas available yet." : "Adjust your filters."}`
                  : `No validations found. ${allValidations.length === 0 ? "No validations available yet." : "Adjust your filters."}`}
              </p>
              {allIdeas.length > 0 && advancedSearch.searchType === "ideas" && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Showing 0 of {allIdeas.length} ideas. Try removing filters or changing your search query.
                </p>
              )}
              {allValidations.length > 0 && advancedSearch.searchType === "validations" && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Showing 0 of {allValidations.length} validations. Try removing filters or changing your search query.
                </p>
              )}
              <button
                onClick={() => {
                  setAdvancedSearch({
                    goalType: "all",
                    interestArea: "all",
                    ideaDescription: "",
                    budgetRange: "all",
                    timeCommitment: "all",
                    workStyle: "all",
                    skillStrength: "all",
                    searchType: advancedSearch.searchType,
                  });
                  setSearchInput("");
                  setSearchQuery("");
                  setDateFilter("all");
                  setScoreFilter("all");
                  setSortBy("date");
                  setSearchPerformed(false);
                  setSelectedSearchIdeas(new Set());
                }}
                className="inline-block rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all duration-200 hover:from-brand-600 hover:to-brand-700 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(DashboardSearchTab);

