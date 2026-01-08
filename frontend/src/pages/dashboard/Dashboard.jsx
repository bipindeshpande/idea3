// ---------------------------------------------------------------------------
// Dashboard.jsx (Premium Polished UI Rewrite)
// ---------------------------------------------------------------------------
// All business logic, state management, API calls, comparison logic,
// filtering, sorting, idea extraction, validation logic — untouched.
// Only structure, visual hierarchy, and styling have been redesigned.
// ---------------------------------------------------------------------------

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import Seo from "../../components/common/Seo.jsx";
import { useReports } from "../../context/ReportsContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useValidation } from "../../context/ValidationContext.jsx";

import DashboardActiveIdeasTab from "../../components/dashboard/DashboardActiveIdeasTab.jsx";
import DashboardHistoryTab from "../../components/dashboard/DashboardHistoryTab.jsx";
import DashboardValidationsTab from "../../components/dashboard/DashboardValidationsTab.jsx";
import DashboardCompareTab from "../../components/dashboard/DashboardCompareTab.jsx";
import DashboardStats from "../../components/dashboard/DashboardStats.jsx";
import DashboardQuickActions from "../../components/dashboard/DashboardQuickActions.jsx";
import TabButton from "../../components/ui/ui-tab-button.jsx";
import UIButton from "../../components/ui/ui-button.jsx";

import { useDashboardData } from "../../hooks/dashboard/useDashboardData.js";
import { useIdeasExtraction } from "../../hooks/dashboard/useIdeasExtraction.js";
import { useRunDeletion } from "../../hooks/dashboard/useRunDeletion.js";
import { useValidationDeletion } from "../../hooks/dashboard/useValidationDeletion.js";
import { useTabNavigation } from "../../hooks/dashboard/useTabNavigation.js";
import { useComparison } from "../../hooks/dashboard/useComparison.js";
import { useFiltering } from "../../hooks/dashboard/useFiltering.js";
import { useDataMerging } from "../../hooks/dashboard/useDataMerging.js";
import ValidationComparisonView from "../../components/dashboard/ValidationComparisonView.jsx";

const STORAGE_KEY = "sia_saved_runs";

export default function DashboardPage() {
 const navigate = useNavigate();

 const { deleteRun: deleteRunFromContext } = useReports();
 const { isAuthenticated, getAuthHeaders } = useAuth();
 const { getSavedValidations, deleteValidation: deleteValidationFromContext } = useValidation();

 // ---------------------------------------------------------------------------
 // INTERNAL STATE (UNCHANGED)
 // ---------------------------------------------------------------------------

 const [runs, setRuns] = useState([]);
 const [apiRuns, setApiRuns] = useState([]);
 const [apiValidations, setApiValidations] = useState([]);
 const [loadingRuns, setLoadingRuns] = useState(true);

 const [actions, setActions] = useState([]);
 const [notes, setNotes] = useState([]);
 const [loadingActions, setLoadingActions] = useState(false);
 const [loadingNotes, setLoadingNotes] = useState(false);

 const [activeTab, setActiveTab] = useTabNavigation("ideas");

 const [allIdeas, setAllIdeas] = useState([]);
 const [selectedIdeas, setSelectedIdeas] = useState(new Set());
 const [comparisonData, setComparisonData] = useState(null);

 // Clear comparison data when switching tabs
 useEffect(() => {
  // Only clear if switching away from ideas tab and comparisonData is for ideas
  if (activeTab !== "ideas" && comparisonData?.ideas) {
   setComparisonData(null);
   setSelectedIdeas(new Set());
  }
  // Only clear if switching away from validations tab and comparisonData is for validations
  if (activeTab !== "validations" && comparisonData?.validations) {
   setComparisonData(null);
   setSelectedIdeas(new Set());
  }
 }, [activeTab, comparisonData]);

 const [insights, setInsights] = useState(null);

 const [sortBy, setSortBy] = useState("date");
 const [dateFilter, setDateFilter] = useState("all");
 const [scoreFilter, setScoreFilter] = useState("all");

 const [advancedSearch] = useState({
 goalType: "all",
 interestArea: "all",
 ideaDescription: "",
 budgetRange: "all",
 timeCommitment: "all",
 workStyle: "all",
 skillStrength: "all",
 searchType: "ideas"
 });

 const [searchTabQuery, setSearchTabQuery] = useState("");
 const [searchCategory, setSearchCategory] = useState("all");

 // ---------------------------------------------------------------------------
 // LOAD LOCAL RUNS
 // ---------------------------------------------------------------------------

 const loadRuns = () => {
 const stored = localStorage.getItem(STORAGE_KEY);
 if (!stored) return;
 try {
 const parsed = JSON.parse(stored);
 const filtered = parsed.filter(r => !r.validation_id && r.overall_score === undefined);
 setRuns(filtered);
 } catch (err) {
 console.error("Failed to parse runs:", err);
 }
 };

 // ---------------------------------------------------------------------------
 // DASHBOARD DATA LOADER (MODULARIZED)
 // ---------------------------------------------------------------------------

 const loadDashboardData = useDashboardData({
  isAuthenticated,
  getAuthHeaders,
  setApiRuns,
  setApiValidations,
  setActions,
  setNotes,
  setInsights,
  setLoadingRuns,
  setLoadingActions,
  setLoadingNotes
 });

 // ---------------------------------------------------------------------------
 // INITIALIZE LOAD
 // ---------------------------------------------------------------------------

 useEffect(() => {
 loadRuns();
 if (isAuthenticated) loadDashboardData();
 else {
 setLoadingRuns(false);
 setLoadingActions(false);
 setLoadingNotes(false);
 }
 }, [isAuthenticated, loadDashboardData]);

 // ---------------------------------------------------------------------------
 // MERGE DATA (MODULARIZED)
 // ---------------------------------------------------------------------------

 const { allRunsMerged, allValidations } = useDataMerging({
  apiRuns,
  runs,
  apiValidations,
  getSavedValidations,
  isAuthenticated,
  loadingRuns
 });

 // ---------------------------------------------------------------------------
 // EXTRACT IDEAS FROM RUNS
 // ---------------------------------------------------------------------------

 useIdeasExtraction({
  apiRuns,
  isAuthenticated,
  loadingRuns,
  getAuthHeaders,
  setAllIdeas
 });

 // ---------------------------------------------------------------------------
 // COMPARISON LOGIC (MODULARIZED)
 // ---------------------------------------------------------------------------

 const { comparing, performComparison, performValidationComparison } = useComparison({
  allIdeas,
  allRunsMerged,
  allValidations,
  getAuthHeaders,
  setComparisonData,
  setSelectedIdeas
 });

 // ---------------------------------------------------------------------------
 // VALIDATIONS (handled by useDataMerging)
 // ---------------------------------------------------------------------------

 // ---------------------------------------------------------------------------
 // FILTER & SORT (MODULARIZED)
 // ---------------------------------------------------------------------------

 const { filteredRuns, filteredValidations, filteredSearchIdeas } = useFiltering({
  allRunsMerged,
 allValidations,
  allIdeas,
  sortBy,
 dateFilter,
 scoreFilter,
  advancedSearch,
  searchTabQuery,
  searchCategory
 });

 // ---------------------------------------------------------------------------
 // VALIDATION COMPARISON (handled by useComparison)
 // ---------------------------------------------------------------------------

 // ---------------------------------------------------------------------------
 // SEARCH FILTERING (handled by useFiltering)
 // ---------------------------------------------------------------------------

 // ---------------------------------------------------------------------------
 // DELETE HANDLER WITH WARNING
 // ---------------------------------------------------------------------------

 const handleDeleteRun = useRunDeletion({
  allIdeas,
  isAuthenticated,
  deleteRunFromContext,
  loadDashboardData,
  loadRuns,
  setRuns,
  setAllIdeas,
  setApiRuns
 });

 // ---------------------------------------------------------------------------
 // DELETE VALIDATION HANDLER
 // ---------------------------------------------------------------------------

 const handleDeleteValidation = useValidationDeletion({
  isAuthenticated,
  getAuthHeaders,
  deleteValidationFromContext,
  loadDashboardData,
  setApiValidations
 });

 // ---------------------------------------------------------------------------
 // EDIT VALIDATION HANDLER
 // ---------------------------------------------------------------------------

 const handleEditValidation = useCallback((session) => {
  const validationId = session.validation_id || session.id;
  if (!validationId) {
   alert("Error: Cannot identify validation to edit.");
   return;
  }

  // Navigate to validation form with edit parameter
  const cleanId = String(validationId).replace(/^val_/, '');
  navigate(`/validate-idea?edit=${cleanId}`);
 }, [navigate]);

 // ---------------------------------------------------------------------------
 // HELPER LOGIC (unchanged)
 // ---------------------------------------------------------------------------

 const sessionHasOpenActions = useCallback(() => false, []);
 const sessionHasNotes = useCallback(() => false, []);

 // ---------------------------------------------------------------------------
 // URL TAB SYNC
 // ---------------------------------------------------------------------------
 // Handled by useTabNavigation hook

 // ---------------------------------------------------------------------------
 // PREMIUM UI STARTS HERE
 // ---------------------------------------------------------------------------

 return (
 <>
 <Seo
 title="Idea Workspace | Startup Idea Advisor"
 description="Track, compare, validate, and manage your startup ideas."
 path="/dashboard"
 />

 <div className="pb-16">
 {/* Quick Actions + Stats */}
 <div className="grid gap-4">
 <DashboardQuickActions />
 <DashboardStats
  ideas={allIdeas}
  validations={apiValidations}
  matchPercent={insights?.match_percent}
  riskAlerts={insights?.risk_alerts}
 />
 </div>

 {/* ---------------------------------------------------------------------
 TAB BAR 
 --------------------------------------------------------------------- */}
 <div className="mt-6 pt-6 border-t border-default">
 <nav className="flex gap-8 border-b border-default pb-0">
 {["ideas", "validations", "history"].map(tab => (
 <TabButton
 key={tab}
 active={activeTab === tab}
 onClick={() => setActiveTab(tab)}
 >
 {tab.charAt(0).toUpperCase() + tab.slice(1)}
 </TabButton>
 ))}
 </nav>
 </div>

 {/* ---------------------------------------------------------------------
 TAB CONTENT
 --------------------------------------------------------------------- */}
 <div className="mt-8">

 {/* IDEAS TAB */}
 {activeTab === "ideas" && (
 <div>
 {comparisonData?.ideas ? (
 <DashboardCompareTab
 allIdeas={allIdeas}
 allRuns={allRunsMerged}
 selectedIdeas={selectedIdeas}
 setSelectedIdeas={setSelectedIdeas}
 comparisonData={comparisonData}
 setComparisonData={setComparisonData}
 comparing={comparing}
 performComparison={performComparison}
 />
 ) : (
 <>
 <DashboardActiveIdeasTab
 actions={actions}
 notes={notes}
 loadingActions={loadingActions}
 loadingNotes={loadingNotes}
 allRuns={allRunsMerged}
 allIdeas={allIdeas}
 allValidations={allValidations}
 selectedIdeas={selectedIdeas}
 setSelectedIdeas={setSelectedIdeas}
 comparisonData={comparisonData}
 setComparisonData={setComparisonData}
 comparing={comparing}
 performComparison={performComparison}
 />
 </>
 )}
 </div>
 )}

 {/* VALIDATIONS TAB */}
 {activeTab === "validations" && (
 <div>
 <p className="section-description">
 All idea validations you’ve run—compare, revisit, or refine your assumptions.
 </p>

 {comparisonData?.validations ? (
  <ValidationComparisonView
   comparisonData={comparisonData}
   onResetComparison={() => {
      setComparisonData(null);
      setSelectedIdeas(new Set());
     }}
  />
 ) : (
  <DashboardValidationsTab
   filteredValidations={filteredValidations}
   loadingRuns={loadingRuns}
   sessionHasOpenActions={sessionHasOpenActions}
   sessionHasNotes={sessionHasNotes}
   selectedIdeas={selectedIdeas}
   setSelectedIdeas={setSelectedIdeas}
   comparisonData={comparisonData}
   setComparisonData={setComparisonData}
   comparing={comparing}
   performComparison={performValidationComparison}
   handleDelete={handleDeleteValidation}
   handleEditValidation={handleEditValidation}
  />
 )}
 </div>
 )}

 {/* HISTORY TAB */}
 {activeTab === "history" && (
 <div>
 <p className="section-description">
 Browse all previous discoveries and validations.
 </p>

 <DashboardHistoryTab
 filteredRuns={filteredRuns}
 loadingRuns={loadingRuns}
 sessionHasOpenActions={sessionHasOpenActions}
 sessionHasNotes={sessionHasNotes}
 handleDelete={handleDeleteRun}
 handleNewRequest={() => {}}
 />
 </div>
 )}
 </div>
 </div>
 </>
 );
}
//
