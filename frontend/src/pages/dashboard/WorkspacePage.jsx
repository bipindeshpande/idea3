import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useReports } from "../../context/ReportsContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useValidation } from "../../context/ValidationContext.jsx";
import { parseTopIdeas } from "../../utils/markdown/markdown.js";
import { 
 buildFinancialSnapshots, 
 parseRiskRows, 
 splitFullReportSections 
} from "../../utils/formatters/recommendationFormatters.js";
import DashboardActiveIdeasTab from "../../components/dashboard/DashboardActiveIdeasTab.jsx";
import DashboardSessionsTab from "../../components/dashboard/DashboardSessionsTab.jsx";
import DashboardCompareTab from "../../components/dashboard/DashboardCompareTab.jsx";
import DashboardSearchTab from "../../components/dashboard/DashboardSearchTab.jsx";

const STORAGE_KEY = "sia_saved_runs";

export default function WorkspacePage() {
 const [runs, setRuns] = useState([]);
 const [apiRuns, setApiRuns] = useState([]);
 const [apiValidations, setApiValidations] = useState([]);
 const [loadingRuns, setLoadingRuns] = useState(true);
 const [activeTab, setActiveTab] = useState("ideas");
 const { deleteRun, setInputs } = useReports();
 const { isAuthenticated, getAuthHeaders } = useAuth();
 const { getSavedValidations } = useValidation();
 const navigate = useNavigate();
 const location = useLocation();
 const [actions, setActions] = useState([]);
 const [loadingActions, setLoadingActions] = useState(false);
 const [notes, setNotes] = useState([]);
 const [loadingNotes, setLoadingNotes] = useState(false);
 const [searchInput, setSearchInput] = useState(""); // What user is typing
 const [searchQuery, setSearchQuery] = useState(""); // Active search query used for filtering
 const [sortBy, setSortBy] = useState("date"); // "date", "score", "name"
 const [dateFilter, setDateFilter] = useState("all"); // "all", "week", "month", "3months", "year"
 const [scoreFilter, setScoreFilter] = useState("all"); // "all", "high" (>=7), "medium" (5-7), "low" (<5)
 // Advanced search fields
 const [advancedSearch, setAdvancedSearch] = useState({
 goalType: "all",
 interestArea: "all",
 ideaDescription: "",
 budgetRange: "all",
 timeCommitment: "all",
 workStyle: "all",
 skillStrength: "all",
 searchType: "ideas", // "ideas" or "validations"
 });
 const [searchPerformed, setSearchPerformed] = useState(false); // Track if search has been performed
 const [selectedSearchIdeas, setSelectedSearchIdeas] = useState(new Set()); // Selected ideas from search results for comparison
 const [allIdeas, setAllIdeas] = useState([]);
 const [selectedIdeas, setSelectedIdeas] = useState(new Set());
 const [comparisonData, setComparisonData] = useState(null);
 const [comparing, setComparing] = useState(false);
 const [autoCompareTrigger, setAutoCompareTrigger] = useState(false);

 // Check URL params for initial tab
 useEffect(() => {
 const params = new URLSearchParams(location.search);
 const tab = params.get("tab");
 if (tab && ["ideas", "searches", "compare", "search"].includes(tab)) {
 setActiveTab(tab);
 }
 }, [location.search]);

 const loadRuns = () => {
 const stored = localStorage.getItem(STORAGE_KEY);
 if (stored) {
 try {
 const parsed = JSON.parse(stored);
 const filtered = parsed.filter(run => {
 return !run.validation_id && run.overall_score === undefined;
 });
 setRuns(filtered);
 } catch (error) {
 console.error("Failed to parse saved runs", error);
 }
 }
 };

 const loadDashboardData = useCallback(async () => {
 setLoadingRuns(true);
 setLoadingActions(true);
 setLoadingNotes(true);
 
 try {
 if (isAuthenticated) {
 localStorage.removeItem("sia_validations");
 localStorage.removeItem("revalidate_data");
 }
 
 const activityResponse = await fetch("/api/user/activity?limit=100", {
 headers: getAuthHeaders(),
 });
 
 if (activityResponse.ok) {
 const activityData = await activityResponse.json();
 if (activityData.success) {
 const runs = activityData.runs || activityData.activity?.runs || [];
 const validations = activityData.validations || activityData.activity?.validations || [];
 setApiRuns(runs);
 setApiValidations(validations);
 }
 }
 
 const dashboardResponse = await fetch("/api/user/dashboard", {
 headers: getAuthHeaders(),
 });
 
 if (dashboardResponse.ok) {
 const dashboardData = await dashboardResponse.json();
 if (dashboardData.success) {
 setApiRuns(prev => {
 if (prev.length === 0 && dashboardData.activity?.runs) {
 return dashboardData.activity.runs;
 }
 return prev;
 });
 setApiValidations(prev => {
 if (prev.length === 0 && dashboardData.activity?.validations) {
 return dashboardData.activity.validations;
 }
 return prev;
 });
 setActions(dashboardData.actions || []);
 setNotes(dashboardData.notes || []);
 }
 }
 } catch (error) {
 if (process.env.NODE_ENV === 'development') {
 console.error("[Workspace] Failed to load data:", error);
 }
 } finally {
 setLoadingRuns(false);
 setLoadingActions(false);
 setLoadingNotes(false);
 }
 }, [getAuthHeaders, isAuthenticated]);

 useEffect(() => {
 if (isAuthenticated) {
 localStorage.removeItem("sia_validations");
 localStorage.removeItem("revalidate_data");
 }
 
 loadRuns();
 if (isAuthenticated) {
 loadDashboardData();
 } else {
 setLoadingRuns(false);
 setLoadingActions(false);
 setLoadingNotes(false);
 }
 }, [isAuthenticated, loadDashboardData]);

 const allRuns = useMemo(() => {
 if (isAuthenticated && !loadingRuns) {
 const apiRunsList = apiRuns.map(apiRun => ({
 id: `run_${apiRun.run_id}`,
 timestamp: apiRun.created_at ? new Date(apiRun.created_at).getTime() : Date.now(),
 inputs: apiRun.inputs || {},
 outputs: {},
 run_id: apiRun.run_id,
 from_api: true,
 is_validation: false,
 reports: apiRun.reports || {},
 }));
 
 const localRuns = runs.map(run => ({
 ...run,
 from_api: false,
 is_validation: false,
 }));

 const combined = [...apiRunsList];
 const apiIds = new Set(apiRunsList.map(r => r.run_id || r.id));
 localRuns.forEach(localRun => {
 const localId = localRun.run_id || localRun.id;
 if (!apiIds.has(localId)) {
 combined.push(localRun);
 }
 });

 return combined.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
 }
 return runs.map(run => ({
 ...run,
 from_api: false,
 is_validation: false,
 }));
 }, [apiRuns, runs, isAuthenticated, loadingRuns]);

 // Extract all ideas from runs
 useEffect(() => {
 const extractIdeas = async () => {
 const ideasList = [];
 const seenIds = new Set();
 
 const normalizeRunId = (id) => {
 if (!id) return null;
 return String(id).replace(/^run_/, '');
 };
 
 const runsNeedingReports = apiRuns.filter(
 run => {
 const runId = normalizeRunId(run.run_id);
 const hasReports = run.reports?.personalized_recommendations || run.personalized_recommendations;
 return !hasReports && runId;
 }
 );
 
 const reportsMap = new Map();
 if (runsNeedingReports.length > 0) {
 const fetchPromises = runsNeedingReports.map(async (run) => {
 const runId = normalizeRunId(run.run_id);
 if (!runId) return;
 
 try {
 const response = await fetch(`/api/user/run/${runId}`, {
 headers: getAuthHeaders(),
 });
 if (response.ok) {
 const data = await response.json();
 if (data.success && data.run) {
 try {
 let reports = data.run.reports;
 if (typeof reports === 'string') {
 reports = JSON.parse(reports);
 }
 
 if (!reports?.personalized_recommendations && data.run.personalized_recommendations) {
 reports = {
 ...reports,
 personalized_recommendations: data.run.personalized_recommendations
 };
 }
 
 if (reports?.personalized_recommendations) {
 reportsMap.set(runId, reports);
 }
 } catch (e) {
 if (process.env.NODE_ENV === 'development') {
 console.warn("[Workspace] Failed to parse reports for run:", runId, e);
 }
 }
 }
 }
 } catch (error) {
 if (process.env.NODE_ENV === 'development') {
 console.warn("[Workspace] Failed to fetch reports for run:", runId, error);
 }
 }
 });
 
 await Promise.all(fetchPromises);
 }
 
 for (const run of apiRuns) {
 const runId = normalizeRunId(run.run_id);
 if (!runId) continue;
 
 let reports = run.reports;
 let personalizedRecs = null;
 
 if (typeof reports === 'string') {
 try {
 reports = JSON.parse(reports);
 } catch (e) {
 if (process.env.NODE_ENV === 'development') {
 console.warn("[Workspace] Failed to parse reports string for run:", runId);
 }
 }
 }
 
 personalizedRecs = reports?.personalized_recommendations || 
 run.personalized_recommendations ||
 reportsMap.get(runId)?.personalized_recommendations;
 
 if (personalizedRecs) {
 const topIdeas = parseTopIdeas(personalizedRecs, 3);
 topIdeas.forEach((idea) => {
 const ideaIndex = String(idea.index || idea.ideaIndex || '');
 const ideaId = `${runId}-${ideaIndex}`;
 
 if (!seenIds.has(ideaId) && idea.title) {
 seenIds.add(ideaId);
 ideasList.push({
 id: ideaId,
 runId: runId,
 ideaIndex: ideaIndex,
 title: idea.title || '',
 summary: idea.summary || '',
 runInputs: run.inputs || {},
 runCreatedAt: run.created_at || run.createdAt || null,
 runReports: reports || { personalized_recommendations: personalizedRecs },
 });
 }
 });
 }
 }
 
 const stored = localStorage.getItem(STORAGE_KEY);
 if (stored) {
 try {
 const parsed = JSON.parse(stored);
 parsed.forEach((run) => {
 const runId = normalizeRunId(run.run_id || run.id);
 if (!runId) return;
 
 const alreadyProcessed = apiRuns.some(apiRun => {
 const apiRunId = normalizeRunId(apiRun.run_id);
 return apiRunId === runId;
 });
 
 if (!alreadyProcessed && run.outputs?.personalized_recommendations) {
 const topIdeas = parseTopIdeas(run.outputs.personalized_recommendations, 3);
 topIdeas.forEach((idea) => {
 const ideaIndex = String(idea.index || '');
 const ideaId = `${runId}-${ideaIndex}`;
 
 if (!seenIds.has(ideaId)) {
 seenIds.add(ideaId);
 ideasList.push({
 id: ideaId,
 runId: runId,
 ideaIndex: ideaIndex,
 title: idea.title || '',
 summary: idea.summary || '',
 runInputs: run.inputs || {},
 runCreatedAt: run.timestamp ? new Date(run.timestamp).toISOString() : null,
 runReports: run.outputs,
 });
 }
 });
 }
 });
 } catch (e) {
 if (process.env.NODE_ENV === 'development') {
 console.warn("[Workspace] Failed to parse localStorage runs:", e);
 }
 }
 }
 
 setAllIdeas(ideasList);
 };
 
 if (apiRuns.length > 0 || !isAuthenticated || !loadingRuns) {
 extractIdeas();
 }
 }, [apiRuns, isAuthenticated, loadingRuns, getAuthHeaders]);

 const extractComparisonMetrics = (run, ideaIndex) => {
 const metrics = {
 startupCost: "N/A",
 monthlyRevenue: "N/A",
 marketSize: "N/A",
 competitionLevel: "N/A",
 riskLevel: "N/A",
 timeToMarket: "N/A",
 customerSegment: "N/A",
 keyStrengths: "N/A",
 validationScore: "N/A",
 scalability: "N/A",
 };

 if (!run || !run.reports) return metrics;

 const reportsObj = typeof run.reports === 'object' ? run.reports : {};
 const personalizedRecs = reportsObj.personalized_recommendations;
 
 if (!personalizedRecs) return metrics;

 const reportsStr = typeof personalizedRecs === 'string' ? personalizedRecs : JSON.stringify(personalizedRecs);
 const sections = splitFullReportSections(reportsStr);
 const topIdeas = parseTopIdeas(personalizedRecs, 3);
 const idea = topIdeas.find(i => i.index === ideaIndex);
 
 if (idea) {
 if (idea.summary) {
 const summaryLines = idea.summary.split(/[\.;]/).filter(line => line.trim().length > 20);
 if (summaryLines.length > 0) {
 metrics.keyStrengths = summaryLines[0].trim().substring(0, 80);
 }
 }
 if (idea.whyItFits && metrics.keyStrengths === "N/A") {
 metrics.keyStrengths = idea.whyItFits.substring(0, 80);
 }
 }

 const financialSection = sections['financial outlook'] || sections['financial'] || '';
 if (financialSection) {
 const financialSnapshots = buildFinancialSnapshots(
 financialSection, 
 idea?.title || '', 
 run.inputs?.budget_range || ''
 );
 
 const startupCostEntry = financialSnapshots.find(e => 
 e.focus?.toLowerCase().includes('startup') || 
 e.focus?.toLowerCase().includes('investment')
 );
 if (startupCostEntry && startupCostEntry.metric) {
 metrics.startupCost = startupCostEntry.metric;
 }
 
 const revenueEntry = financialSnapshots.find(e => 
 e.focus?.toLowerCase().includes('revenue') || 
 e.focus?.toLowerCase().includes('profit')
 );
 if (revenueEntry && revenueEntry.metric) {
 metrics.monthlyRevenue = revenueEntry.metric;
 }
 }

 const marketMatch = reportsStr.match(/(?:market\s+size|market\s+opportunity|TAM)[:\-]?\s*(.+?)(?:\n|$)/i);
 if (marketMatch) {
 const marketText = marketMatch[1].trim();
 const currencyMatch = marketText.match(/\$[\d,]+(?:\.\d+)?[KMB]?/i);
 if (currencyMatch) {
 metrics.marketSize = currencyMatch[0];
 } else {
 metrics.marketSize = marketText.substring(0, 50);
 }
 }

 const competitionMatch = reportsStr.match(/(?:competition\s+level|competitive\s+landscape|competition)[:\-]?\s*(low|medium|high|intense|moderate)/i);
 if (competitionMatch) {
 metrics.competitionLevel = competitionMatch[1].charAt(0).toUpperCase() + competitionMatch[1].slice(1);
 }

 const riskSection = sections['risk radar'] || sections['risk'] || '';
 if (riskSection) {
 const riskRows = parseRiskRows(riskSection);
 if (riskRows && riskRows.length > 0) {
 const highRisk = riskRows.find(r => r.severity === 'HIGH');
 const mediumRisk = riskRows.find(r => r.severity === 'MEDIUM');
 if (highRisk) {
 metrics.riskLevel = 'High';
 } else if (mediumRisk) {
 metrics.riskLevel = 'Medium';
 } else if (riskRows[0]) {
 metrics.riskLevel = riskRows[0].severity.charAt(0) + riskRows[0].severity.slice(1).toLowerCase();
 }
 }
 }

 const timeMatch = reportsStr.match(/(?:time\s+to\s+market|launch\s+timeline|time\s+to\s+launch)[:\-]?\s*(\d+\s*(?:weeks?|months?|days?))/i);
 if (timeMatch) {
 metrics.timeToMarket = timeMatch[1];
 }

 const personaSection = sections['customer persona'] || sections['persona'] || '';
 if (personaSection) {
 const segmentMatch = personaSection.match(/(?:target\s+audience|primary\s+customer|customer\s+segment|primary)[:\-]?\s*([^\n]+)/i);
 if (segmentMatch) {
 metrics.customerSegment = segmentMatch[1].trim().substring(0, 50);
 }
 }

 const scalabilityMatch = reportsStr.match(/(?:scalability|scalable|growth\s+potential)[:\-]?\s*(high|medium|low|excellent|good)/i);
 if (scalabilityMatch) {
 metrics.scalability = scalabilityMatch[1].charAt(0).toUpperCase() + scalabilityMatch[1].slice(1);
 }

 return metrics;
 };

 // Compare individual ideas (not sessions)
 // This function compares selected ideas by:
 // 1. Filtering allIdeas to get the selected ideas
 // 2. Fetching run data for those ideas (using compare-sessions API to get full run reports)
 // 3. Extracting metrics for each specific idea using its ideaIndex
 const performComparison = useCallback(async (ideasToCompare) => {
 if (!ideasToCompare || (ideasToCompare instanceof Set && ideasToCompare.size === 0) || (Array.isArray(ideasToCompare) && ideasToCompare.length === 0)) {
 return;
 }

 const compareSize = ideasToCompare instanceof Set ? ideasToCompare.size : ideasToCompare.length;
 if (compareSize > 5) {
 alert("Maximum 5 ideas can be compared at once");
 return;
 }

 setComparing(true);
 try {
 const normalizedCompareSet = new Set();
 if (ideasToCompare instanceof Set) {
 ideasToCompare.forEach(id => normalizedCompareSet.add(String(id)));
 } else if (Array.isArray(ideasToCompare)) {
 ideasToCompare.forEach(id => normalizedCompareSet.add(String(id)));
 }
 
 // Get the selected ideas from allIdeas
 const selectedIdeasData = allIdeas.filter(idea => {
 const ideaId = String(idea.id || '');
 return normalizedCompareSet.has(ideaId);
 });
 
 if (selectedIdeasData.length === 0) {
 alert("No matching ideas found. Please try selecting ideas again.");
 setComparing(false);
 return;
 }
 
 // Get unique run IDs to fetch full run data (needed to extract idea-specific metrics)
 const runIds = [...new Set(selectedIdeasData.map(idea => String(idea.runId || ''))).filter(Boolean)];
 
 // Fetch run data (using compare-sessions API to get full reports)
 const response = await fetch("/api/user/compare-sessions", {
 method: "POST",
 headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
 body: JSON.stringify({
 run_ids: runIds,
 validation_ids: [],
 }),
 });
 if (response.ok) {
 const data = await response.json();
 if (data.success) {
 // Map each selected idea to its comparison data
 // Each idea gets its own metrics extracted using its specific ideaIndex
 const ideasComparison = {
 ideas: selectedIdeasData.map(idea => {
 const normalizedRunId = String(idea.runId || '');
 const run = data.comparison.runs?.find(r => {
 const rRunId = String(r.run_id || '');
 return rRunId === normalizedRunId;
 });
 
 if (run && run.reports?.personalized_recommendations) {
 const topIdeas = parseTopIdeas(run.reports.personalized_recommendations, 3);
 const normalizedIdeaIndex = String(idea.ideaIndex || '');
 const matchedIdea = topIdeas.find(i => {
 const iIndex = String(i.index || '');
 return iIndex === normalizedIdeaIndex;
 });
 if (matchedIdea) {
 // Extract metrics for this specific idea (not the entire session)
 const metrics = extractComparisonMetrics(run, normalizedIdeaIndex);
 return {
 ...idea,
 fullData: matchedIdea,
 runInputs: run.inputs || idea.runInputs || {},
 runCreatedAt: run.created_at || idea.runCreatedAt,
 metrics: metrics,
 };
 }
 }
 // Fallback: extract metrics even if idea not found in topIdeas
 const metrics = run ? extractComparisonMetrics(run, String(idea.ideaIndex || '')) : {};
 return {
 ...idea,
 runInputs: idea.runInputs || {},
 runCreatedAt: idea.runCreatedAt,
 metrics: metrics,
 };
 }).filter(idea => idea !== null),
 };
 setComparisonData(ideasComparison);
 } else {
 alert(data.error || "Failed to compare ideas. Please try again.");
 }
 } else {
 const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
 alert(errorData.error || "Failed to compare ideas. Please try again.");
 }
 } catch (error) {
 if (process.env.NODE_ENV === 'development') {
 console.error("[Workspace] Failed to compare ideas:", error);
 }
 alert("Network error. Please check your connection and try again.");
 } finally {
 setComparing(false);
 }
 }, [allIdeas, getAuthHeaders]);

 useEffect(() => {
 if (activeTab === "compare" && selectedIdeas.size > 0 && !comparisonData && !comparing && autoCompareTrigger) {
 performComparison(selectedIdeas);
 setAutoCompareTrigger(false);
 }
 }, [activeTab, selectedIdeas, comparisonData, comparing, autoCompareTrigger, performComparison]);

 const handleDelete = async (session) => {
 if (window.confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
 if (session.is_validation || session.validation_id) {
 const validationId = session.validation_id || session.id;
 const cleanId = validationId.toString().replace(/^val_/, '');
 
 try {
 const response = await fetch(`/api/validate-idea/${cleanId}`, {
 method: "DELETE",
 headers: getAuthHeaders(),
 });
 
 const responseData = await response.json().catch(() => ({}));
 
 if (response.ok) {
 setApiValidations(prev => prev.filter(v => {
 const vId = v.validation_id || v.id;
 const vCleanId = vId?.toString().replace(/^val_/, '') || '';
 return vCleanId !== cleanId;
 }));
 await loadDashboardData();
 } else {
 console.error('❌ [Delete] Delete failed:', response.status, responseData);
 alert(responseData.error || `Failed to delete validation (${response.status}). Please try again.`);
 }
 } catch (error) {
 console.error("❌ [Delete] Exception while deleting validation:", error);
 alert("Failed to delete validation. Please try again.");
 }
 return;
 }
 
 if (session.from_api && session.run_id) {
 try {
 const response = await fetch(`/api/user/run/${session.run_id}`, {
 method: "DELETE",
 headers: getAuthHeaders(),
 });
 if (response.ok) {
 setApiRuns(prev => prev.filter(r => r.run_id !== session.run_id));
 await loadDashboardData();
 } else {
 const data = await response.json().catch(() => ({}));
 alert(data.error || "Failed to delete session. Please try again.");
 }
 } catch (error) {
 console.error("Failed to delete session:", error);
 alert("Failed to delete session. Please try again.");
 }
 } else {
 deleteRun(session.id);
 loadRuns();
 }
 }
 };

 const handleNewRequest = async (run) => {
 if (run.from_api && run.run_id && (!run.inputs || Object.keys(run.inputs).length === 0)) {
 try {
 const response = await fetch(`/api/user/run/${run.run_id}`, {
 headers: getAuthHeaders(),
 });
 if (response.ok) {
 const data = await response.json();
 if (data.success && data.run?.inputs) {
 setInputs(data.run.inputs);
 navigate("/advisor#intake-form");
 return;
 }
 }
 } catch (error) {
 console.error("Failed to load run inputs:", error);
 }
 }

 if (run.inputs && Object.keys(run.inputs).length > 0) {
 setInputs(run.inputs);
 navigate("/advisor#intake-form");
 } else {
 navigate("/advisor#intake-form");
 }
 };

 const handleEditValidation = (validation) => {
 let validationId = null;
 
 if (validation.validation_id) {
 validationId = String(validation.validation_id);
 } else if (validation.id) {
 const id = String(validation.id);
 validationId = id.replace(/^val_/, '');
 }
 
 if (!validationId) {
 console.error('Cannot edit validation: no ID found', validation);
 alert('Unable to edit validation: ID not found');
 return;
 }
 
 const cleanId = validationId.replace(/^val_/, '');
 navigate(`/validate-idea?edit=${cleanId}`);
 };

 const allValidations = useMemo(() => {
 const apiVals = apiValidations.map(v => {
 const validationId = v.validation_id || v.id || null;
 return {
 id: validationId ? `val_${validationId}` : `val_${Date.now()}`,
 validation_id: validationId,
 timestamp: v.created_at ? new Date(v.created_at).getTime() : Date.now(),
 overall_score: v.overall_score,
 idea_explanation: v.idea_explanation,
 from_api: true,
 is_validation: true,
 };
 });

 if (isAuthenticated && !loadingRuns) {
 localStorage.removeItem("sia_validations");
 localStorage.removeItem("revalidate_data");
 return apiVals.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
 }

 const localValidations = getSavedValidations();
 const localVals = localValidations.map(v => ({
 id: v.id || `local_${v.timestamp}`,
 validation_id: v.id || `local_${v.timestamp}`,
 timestamp: v.timestamp || Date.now(),
 overall_score: v.validation?.overall_score,
 idea_explanation: v.ideaExplanation || v.idea_explanation,
 from_api: false,
 is_validation: true,
 }));

 const combined = [...apiVals];
 const apiIds = new Set(apiVals.map(v => v.validation_id));
 localVals.forEach(localVal => {
 if (!apiIds.has(localVal.validation_id)) {
 combined.push(localVal);
 }
 });

 return combined.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
 }, [apiValidations, getSavedValidations, isAuthenticated, loadingRuns]);

 // Filter and sort ideas (for search)
 const filteredIdeas = useMemo(() => {
 let filtered = [...allIdeas];
 
 // Normalize string values for comparison
 const normalizeString = (val) => {
 if (val === null || val === undefined) return "";
 return String(val).trim();
 };
 
 if (searchQuery && searchQuery.trim()) {
 const query = searchQuery.toLowerCase().trim();
 filtered = filtered.filter(idea => {
 const title = normalizeString(idea.title).toLowerCase();
 const summary = normalizeString(idea.summary).toLowerCase();
 const founderAmbition = normalizeString(idea.runInputs?.founder_ambition).toLowerCase();
 const industryInterest = normalizeString(idea.runInputs?.industry_interest).toLowerCase();
 const subInterest = normalizeString(idea.runInputs?.sub_interest_area).toLowerCase();
 const runId = normalizeString(idea.runId).toLowerCase();
 
 // Allow partial matches - check if query appears anywhere in the fields
 return title.includes(query) || 
 summary.includes(query) ||
 founderAmbition.includes(query) || 
 industryInterest.includes(query) || 
 subInterest.includes(query) || 
 runId.includes(query);
 });
 }
 
 if (advancedSearch.goalType && advancedSearch.goalType !== "all") {
 filtered = filtered.filter(idea => {
 const goal = normalizeString(idea.runInputs?.founder_ambition);
 return goal === advancedSearch.goalType;
 });
 }
 
 if (advancedSearch.interestArea && advancedSearch.interestArea !== "all") {
 filtered = filtered.filter(idea => {
 const industry = normalizeString(idea.runInputs?.industry_interest);
 const subIndustry = normalizeString(idea.runInputs?.sub_interest_area);
 return industry === advancedSearch.interestArea || subIndustry === advancedSearch.interestArea;
 });
 }
 
 if (advancedSearch.budgetRange && advancedSearch.budgetRange !== "all") {
 filtered = filtered.filter(idea => {
 const budget = normalizeString(idea.runInputs?.budget_range);
 return budget === advancedSearch.budgetRange;
 });
 }
 
 if (advancedSearch.timeCommitment && advancedSearch.timeCommitment !== "all") {
 filtered = filtered.filter(idea => {
 const time = normalizeString(idea.runInputs?.time_commitment);
 return time === advancedSearch.timeCommitment;
 });
 }
 
 if (dateFilter && dateFilter !== "all") {
 const now = Date.now();
 const filterMap = {
 week: 7 * 24 * 60 * 60 * 1000,
 month: 30 * 24 * 60 * 60 * 1000,
 "3months": 90 * 24 * 60 * 60 * 1000,
 year: 365 * 24 * 60 * 60 * 1000,
 };
 const cutoff = now - (filterMap[dateFilter] || 0);
 filtered = filtered.filter(idea => {
 if (!idea.runCreatedAt) return false;
 const ideaDate = new Date(idea.runCreatedAt).getTime();
 return !isNaN(ideaDate) && ideaDate >= cutoff;
 });
 }
 
 filtered.sort((a, b) => {
 switch (sortBy) {
 case "name":
 const aName = normalizeString(a.title);
 const bName = normalizeString(b.title);
 return aName.localeCompare(bName);
 case "date":
 default:
 const aDate = a.runCreatedAt ? new Date(a.runCreatedAt).getTime() : 0;
 const bDate = b.runCreatedAt ? new Date(b.runCreatedAt).getTime() : 0;
 return bDate - aDate;
 }
 });
 
 return filtered;
 }, [allIdeas, searchQuery, dateFilter, sortBy, advancedSearch]);

 const filteredRuns = useMemo(() => {
 let filtered = allRuns.filter(s => {
 if (s.is_validation === true) return false;
 if (s.validation_id) return false;
 if (s.overall_score !== undefined && !s.run_id) return false;
 if (s.idea_explanation && !s.inputs) return false;
 return true;
 });
 
 filtered.sort((a, b) => {
 return (b.timestamp || 0) - (a.timestamp || 0);
 });
 
 return filtered;
 }, [allRuns]);

 const filteredValidations = useMemo(() => {
 let filtered = [...allValidations];
 
 if (searchQuery && searchQuery.trim()) {
 const query = searchQuery.toLowerCase();
 const queryParts = query.split(/\s+/).filter(p => p.length > 0);
 filtered = filtered.filter(session => {
 const idea = session.idea_explanation?.toLowerCase() || "";
 const valId = session.validation_id?.toLowerCase() || session.id?.toLowerCase() || "";
 return queryParts.some(part => idea.includes(part) || valId.includes(part));
 });
 }
 
 if (advancedSearch.ideaDescription) {
 const ideaDesc = advancedSearch.ideaDescription.toLowerCase();
 filtered = filtered.filter(s => 
 s.idea_explanation?.toLowerCase().includes(ideaDesc)
 );
 }
 
 if (dateFilter !== "all") {
 const now = Date.now();
 const filterMap = {
 week: 7 * 24 * 60 * 60 * 1000,
 month: 30 * 24 * 60 * 60 * 1000,
 "3months": 90 * 24 * 60 * 60 * 1000,
 year: 365 * 24 * 60 * 60 * 1000,
 };
 const cutoff = now - filterMap[dateFilter];
 filtered = filtered.filter(s => (s.timestamp || 0) >= cutoff);
 }
 
 if (scoreFilter !== "all") {
 filtered = filtered.filter(s => {
 const score = s.overall_score;
 if (score === undefined || score === null) return false;
 switch (scoreFilter) {
 case "high":
 return score >= 7;
 case "medium":
 return score >= 5 && score < 7;
 case "low":
 return score < 5;
 default:
 return true;
 }
 });
 }
 
 filtered.sort((a, b) => {
 switch (sortBy) {
 case "score":
 const aScore = a.overall_score ?? 0;
 const bScore = b.overall_score ?? 0;
 return bScore - aScore;
 case "name":
 const aName = a.idea_explanation || "";
 const bName = b.idea_explanation || "";
 return aName.localeCompare(bName);
 case "date":
 default:
 return (b.timestamp || 0) - (a.timestamp || 0);
 }
 });
 
 return filtered;
 }, [allValidations, searchQuery, dateFilter, scoreFilter, sortBy, advancedSearch]);

 const sessionHasOpenActions = useCallback((session) => {
 if (!session || !actions.length) return false;
 
 if (!session.is_validation) {
 const runId = session.run_id || session.id?.replace('run_', '');
 return actions.some(action => {
 if (!action.idea_id || action.status === "completed") return false;
 const runMatch = action.idea_id.match(/run_([^_]+)/);
 return runMatch && runMatch[1] === runId;
 });
 }
 
 if (session.is_validation && session.validation_id) {
 return actions.some(action => {
 if (!action.idea_id || action.status === "completed") return false;
 const valMatch = action.idea_id.match(/val_(.+)/);
 return valMatch && valMatch[1] === session.validation_id;
 });
 }
 
 return false;
 }, [actions]);

 const sessionHasNotes = useCallback((session) => {
 if (!session || !notes.length) return false;
 
 if (!session.is_validation) {
 const runId = session.run_id || session.id?.replace('run_', '');
 return notes.some(note => {
 if (!note.idea_id) return false;
 const runMatch = note.idea_id.match(/run_([^_]+)/);
 return runMatch && runMatch[1] === runId;
 });
 }
 
 if (session.is_validation && session.validation_id) {
 return notes.some(note => {
 if (!note.idea_id) return false;
 const valMatch = note.idea_id.match(/val_(.+)/);
 return valMatch && valMatch[1] === session.validation_id;
 });
 }
 
 return false;
 }, [notes]);


 return (
 <>
 <Seo
 title="Workspace | Startup Idea Advisor"
 description="Your explored ideas and thinking history."
 path="/dashboard/workspace"
 />

 {/* Main Workspace */}
 <section className="ui-card mb-8 rounded-[16px] p-6 shadow-card">
 {/* Workspace tabs */}
 <div className="mb-6 border-b border-default">
 <nav className="flex gap-6 flex-wrap" aria-label="Workspace tabs">
 <button
 onClick={() => setActiveTab("ideas")}
 className={`px-4 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
 activeTab === "ideas"
    ? "border-accent text-primary"
    : "border-transparent text-secondary hover:text-accent-hover"
 }`}
 >
   Ideas
 </button>
 <button
 onClick={() => setActiveTab("searches")}
 className={`px-4 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
 activeTab === "searches"
    ? "border-accent text-primary"
    : "border-transparent text-secondary hover:text-accent-hover"
 }`}
 >
   History
 </button>
 <button
 onClick={() => setActiveTab("compare")}
 className={`px-4 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
 activeTab === "compare"
 ? "border-default text-accent text-accent"
 : "border-transparent text-secondary text-secondary hover:text-primary hover:text-primary"
 }`}
 >
 Compare
 </button>
 <button
 onClick={() => setActiveTab("search")}
 className={`px-4 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
 activeTab === "search"
 ? "border-default text-accent text-accent"
 : "border-transparent text-secondary text-secondary hover:text-primary hover:text-primary"
 }`}
 >
 Search
 </button>
 </nav>
 </div>

 <div className="space-y-6">
 {/* Active Ideas */}
 {activeTab === "ideas" && (
 <DashboardActiveIdeasTab
 actions={actions}
 notes={notes}
 loadingActions={loadingActions}
 loadingNotes={loadingNotes}
 allRuns={allRuns}
 allValidations={allValidations}
 />
 )}

 {/* Past Sessions */}
 {activeTab === "searches" && (
 <DashboardSessionsTab
 activeTab="ideas"
 setActiveTab={setActiveTab}
 filteredRuns={filteredRuns}
 filteredValidations={[]}
 loadingRuns={loadingRuns}
 sessionHasOpenActions={sessionHasOpenActions}
 sessionHasNotes={sessionHasNotes}
 handleDelete={handleDelete}
 handleNewRequest={handleNewRequest}
 handleEditValidation={handleEditValidation}
 />
 )}

 {/* Compare */}
 {activeTab === "compare" && (
 <DashboardCompareTab
 allIdeas={allIdeas}
 allRuns={allRuns}
 selectedIdeas={selectedIdeas}
 setSelectedIdeas={setSelectedIdeas}
 comparisonData={comparisonData}
 setComparisonData={setComparisonData}
 comparing={comparing}
 performComparison={performComparison}
 />
 )}

 {/* Search */}
 {activeTab === "search" && (
 <DashboardSearchTab
 advancedSearch={advancedSearch}
 setAdvancedSearch={setAdvancedSearch}
 searchPerformed={searchPerformed}
 setSearchPerformed={setSearchPerformed}
 selectedSearchIdeas={selectedSearchIdeas}
 setSelectedSearchIdeas={setSelectedSearchIdeas}
 filteredIdeas={filteredIdeas}
 filteredValidations={filteredValidations}
 allIdeas={allIdeas}
 allValidations={allValidations}
 allRuns={allRuns}
 dateFilter={dateFilter}
 setDateFilter={setDateFilter}
 scoreFilter={scoreFilter}
 setScoreFilter={setScoreFilter}
 sortBy={sortBy}
 setSortBy={setSortBy}
 searchQuery={searchQuery}
 setSearchQuery={setSearchQuery}
 searchInput={searchInput}
 setSearchInput={setSearchInput}
 setActiveTab={setActiveTab}
 setSelectedIdeas={setSelectedIdeas}
 setComparisonData={setComparisonData}
 setAutoCompareTrigger={setAutoCompareTrigger}
 performComparison={performComparison}
 />
 )}
 </div>
 </section>
 </>
 );
}

