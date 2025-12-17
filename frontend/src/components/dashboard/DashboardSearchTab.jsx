import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { formFieldsConfig } from "../../config/formFieldsConfig.js";
import UISelect from "../ui/ui-select.jsx";
import UIButton from "../ui/ui-button.jsx";
import UICard from "../ui/ui-card.jsx";
import UIHeading from "../ui/ui-heading.jsx";

const selectClass = "ui-select text-sm focus-visible:outline-accent";

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
      <UICard className="ui-pad-lg text-center">
 <div className="mb-4 text-4xl">🔍</div>
        <UIHeading level="h3" className="mb-3">
          Search
        </UIHeading>
        <p className="mb-4 text-sm text-secondary leading-relaxed max-w-md mx-auto">
 No items yet. These appear as you explore or validate ideas.
 </p>
 <div className="flex gap-3 justify-center">
 <Link
 to="/advisor"
            className="text-sm text-accent hover:text-accent-hover"
 >
 Explore ideas
 </Link>
 <span className="text-secondary">•</span>
 <Link
 to="/validate-idea"
            className="text-sm text-accent hover:text-accent-hover"
 >
 Validate an idea
 </Link>
 </div>
      </UICard>
 );
 }

 return (
 <div className="space-y-6">
 <div className="mb-6">
        <UIHeading level="h3" className="mb-2">
          Advanced Search
        </UIHeading>
        <p className="text-sm text-secondary">
 Use multiple search criteria and filters to find exactly what you're looking for.
 </p>
 </div>

 {/* Advanced Search Form - Hide when search performed */}
 {!searchPerformed && (
        <UICard className="ui-pad-md shadow-card">
          <div className="space-y-4">
 {/* Search Type */}
 <div>
              <label className="block text-sm font-semibold text-primary mb-2">
 Search Type
 </label>
              <UISelect
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
                className={selectClass}
 >
 <option value="ideas">Ideas</option>
 <option value="validations">Validations</option>
              </UISelect>
 </div>

 {/* Search Fields Grid */}
 {advancedSearch.searchType === "ideas" ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Founder Ambition */}
 <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
 Founder Ambition
 </label>
                  <UISelect
 value={advancedSearch.goalType}
 onChange={(e) => setAdvancedSearch({...advancedSearch, goalType: e.target.value})}
                    className={selectClass}
 >
 <option value="all">All Goals</option>
 <option value="Side income">Side income</option>
 <option value="Full-time business">Full-time business</option>
 <option value="Scalable venture">Scalable venture</option>
 <option value="Turn hobby into business">Turn hobby into business</option>
 <option value="Social Impact">Social Impact</option>
 <option value="Part-time business">Part-time business</option>
                  </UISelect>
 </div>

 {/* Industry Interest */}
 <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
 Industry Interest
 </label>
                  <UISelect
 value={advancedSearch.interestArea}
 onChange={(e) => setAdvancedSearch({...advancedSearch, interestArea: e.target.value})}
                    className={selectClass}
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
                  </UISelect>
 </div>

 {/* Budget Range */}
 {(() => {
 const budgetField = formFieldsConfig.fields.find(f => f.id === "budget_range");
 return (
 <div>
                      <label className="block text-sm font-semibold text-primary mb-2">
 Budget Range
 </label>
                      <UISelect
 value={advancedSearch.budgetRange}
 onChange={(e) => setAdvancedSearch({...advancedSearch, budgetRange: e.target.value})}
                        className={selectClass}
 >
 <option value="all">All Budgets</option>
 {budgetField?.options?.map((option) => (
 <option key={option} value={option}>
 {option}
 </option>
 ))}
                      </UISelect>
 </div>
 );
 })()}

 {/* Time Commitment */}
 {(() => {
 const timeField = formFieldsConfig.fields.find(f => f.id === "time_commitment");
 return (
 <div>
                      <label className="block text-sm font-semibold text-primary mb-2">
 Time Commitment
 </label>
                      <UISelect
 value={advancedSearch.timeCommitment}
 onChange={(e) => setAdvancedSearch({...advancedSearch, timeCommitment: e.target.value})}
                        className={selectClass}
 >
 <option value="all">All Time</option>
 {timeField?.options?.map((option) => (
 <option key={option} value={option}>
 {option}
 </option>
 ))}
                      </UISelect>
 </div>
 );
 })()}
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Validation Score Range */}
 <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
 Validation Score Range
 </label>
                  <UISelect
 value={scoreFilter}
 onChange={(e) => setScoreFilter(e.target.value)}
                    className={selectClass}
 >
 <option value="all">All Scores</option>
 <option value="high">High (≥7.0)</option>
 <option value="medium">Medium (5.0-6.9)</option>
 <option value="low">Low (&lt;5.0)</option>
                  </UISelect>
 </div>
 </div>
 )}

 {/* Action Buttons */}
 <div className="flex gap-3 pt-4">
              <UIButton
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
                variant="primary"
                className="flex-1 focus-visible:outline-accent"
 >
 Search
              </UIButton>
              <UIButton
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
                variant="secondary"
                className="focus-visible:outline-accent"
 >
 Clear All
              </UIButton>
 </div>
          </div>
        </UICard>
 )}

 {/* Results Count and Compare Button */}
 {searchPerformed && (
 <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-secondary">
 {advancedSearch.searchType === "ideas" && (
 <>Showing {filteredIdeas.length} of {allIdeas.length} ideas</>
 )}
 {advancedSearch.searchType === "validations" && (
 <>Showing {filteredValidations.length} of {allValidations.length} validations</>
 )}
 </div>
 {advancedSearch.searchType === "ideas" && filteredIdeas.length > 0 && selectedSearchIdeas.size > 0 && (
          <UIButton
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
            variant="primary"
            className="focus-visible:outline-accent"
 >
 Compare {selectedSearchIdeas.size} Idea{selectedSearchIdeas.size !== 1 ? "s" : ""}
          </UIButton>
 )}
        <UIButton
 onClick={() => {
 setSearchPerformed(false);
 setSelectedSearchIdeas(new Set());
 }}
          variant="secondary"
          className="focus-visible:outline-accent"
 >
 New Search
        </UIButton>
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
                    ? "border-default bg-surface"
 : "border-default bg-surface"
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
 className="mt-1 rounded border-default text-accent "
 />
 <div className="flex-1">
                    <h4 className="text-sm font-bold text-primary">
 {idea.title}
 </h4>
                    <p className="text-xs text-secondary mt-1">
 {idea.summary}
 </p>
                    <p className="text-xs text-secondary mt-1">
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
                className="ui-card2 ui-pad-md"
 >
                  <h4 className="text-sm font-bold text-primary">
 {session.idea_explanation || "Validation"}
 </h4>
 <div className="flex items-center gap-2 mt-2">
 {session.overall_score !== undefined && (
                      <span className="text-xs font-bold text-accent">
 Score: {session.overall_score.toFixed(1)}/10
 </span>
 )}
                  <span className="text-xs text-secondary">
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
            <UICard className="ui-pad-md text-center">
              <p className="text-sm font-semibold text-primary mb-2">
 {advancedSearch.searchType === "ideas" 
 ? `No ideas found. ${allIdeas.length === 0 ? "No ideas available yet." : "Adjust your filters."}`
 : `No validations found. ${allValidations.length === 0 ? "No validations available yet." : "Adjust your filters."}`}
 </p>
 {allIdeas.length > 0 && advancedSearch.searchType === "ideas" && (
                <p className="text-xs text-secondary mb-4">
 Showing 0 of {allIdeas.length} ideas. Try removing filters or changing your search query.
 </p>
 )}
 {allValidations.length > 0 && advancedSearch.searchType === "validations" && (
                <p className="text-xs text-secondary mb-4">
 Showing 0 of {allValidations.length} validations. Try removing filters or changing your search query.
 </p>
 )}
              <UIButton
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
                variant="primary"
                className="focus-visible:outline-accent"
 >
 Clear Filters
              </UIButton>
            </UICard>
 )}
 </div>
 )}
 </div>
 );
}

export default memo(DashboardSearchTab);

