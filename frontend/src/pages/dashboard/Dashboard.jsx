import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import DashboardInsightsTab from "../../components/dashboard/DashboardInsightsTab.jsx";

const STORAGE_KEY = "sia_saved_runs";

export default function DashboardPage() {
  const [runs, setRuns] = useState([]);
  const [apiRuns, setApiRuns] = useState([]);
  const [apiValidations, setApiValidations] = useState([]);
  const [loadingRuns, setLoadingRuns] = useState(true);
  const [activeTab, setActiveTab] = useState("ideas"); // Workspace tab state
  const { deleteRun, setInputs } = useReports();
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const { getSavedValidations } = useValidation();
  const navigate = useNavigate();
  const location = useLocation();
  const [actions, setActions] = useState([]);
  const [loadingActions, setLoadingActions] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [sortBy, setSortBy] = useState("date"); // "date", "score", "name"
  const [dateFilter, setDateFilter] = useState("all"); // "all", "week", "month", "3months", "year"
  const [scoreFilter, setScoreFilter] = useState("all"); // "all", "high" (>=7), "medium" (5-7), "low" (<5)
  // Advanced search fields
  const [advancedSearch] = useState({
    goalType: "all",
    interestArea: "all",
    ideaDescription: "",
    budgetRange: "all",
    timeCommitment: "all",
    workStyle: "all",
    skillStrength: "all",
    searchType: "ideas", // "ideas" or "validations"
  });
  // Compare tab state - now for ideas
  const [allIdeas, setAllIdeas] = useState([]); // All ideas extracted from runs
  const [selectedIdeas, setSelectedIdeas] = useState(new Set()); // Selected idea IDs (format: "runId-ideaIndex")
  const [comparisonData, setComparisonData] = useState(null);
  const [comparing, setComparing] = useState(false);
  const [autoCompareTrigger, setAutoCompareTrigger] = useState(false); // Flag to trigger auto-comparison
  const [workspaceSearchQuery, setWorkspaceSearchQuery] = useState(""); // Workspace search for recall
  const [workspaceSearchResults, setWorkspaceSearchResults] = useState([]); // Unified search results
  const [workspaceSearchDebounceTimer, setWorkspaceSearchDebounceTimer] = useState(null); // Debounce timer
  const [insights, setInsights] = useState(null); // Run statistics
  const [searchTabQuery, setSearchTabQuery] = useState(""); // Search tab query
  const [searchTabResults, setSearchTabResults] = useState([]); // Search tab results
  const [searchCategory, setSearchCategory] = useState("all"); // Search category filter: "all", "title", "summary", "market", "revenue", "timeline", "why_fits"

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


  // Consolidated dashboard data loader
  const loadDashboardData = useCallback(async () => {
    setLoadingRuns(true);
    setLoadingActions(true);
    setLoadingNotes(true);
    
    try {
      if (isAuthenticated) {
        localStorage.removeItem("sia_validations");
        localStorage.removeItem("revalidate_data");
      }
      
      // Try /api/user/activity first (more reliable)
      const activityResponse = await fetch("/api/user/activity?limit=100", {
        headers: getAuthHeaders(),
      });
      
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        if (activityData.success) {
          const runs = activityData.runs || activityData.activity?.runs || [];
          const validations = activityData.validations || activityData.activity?.validations || [];
          
          if (process.env.NODE_ENV === 'development') {
            console.log("[Dashboard] Loaded runs from /api/user/activity:", runs.length);
            console.log("[Dashboard] Sample run:", runs[0] ? {
              run_id: runs[0].run_id,
              idea_title: runs[0].idea_title,
              summary: runs[0].summary,
              run_type: runs[0].run_type,
              hasReports: !!runs[0].reports,
              hasPersonalizedRecs: !!runs[0].reports?.personalized_recommendations,
              inputs: runs[0].inputs ? Object.keys(runs[0].inputs) : null,
            } : null);
          }
          
          setApiRuns(runs);
          setApiValidations(validations);
          console.log("Loaded sessions:", runs);
        }
      }
      
      // Also try /api/user/dashboard for additional data
      const dashboardResponse = await fetch("/api/user/dashboard", {
        headers: getAuthHeaders(),
      });
      
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        if (dashboardData.success) {
          // Get current state to check if we need to update
          setApiRuns(prev => {
            // Only update if we didn't get runs from activity endpoint
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
      
      // Fetch run statistics (optional - endpoint may not exist)
      try {
        const insightsResponse = await fetch("/api/runs/stats", {
          headers: getAuthHeaders(),
        });
        if (insightsResponse.ok) {
          const insightsData = await insightsResponse.json();
          if (insightsData.success) {
            setInsights(insightsData);
          }
        }
      } catch (error) {
        // Silently fail if stats endpoint doesn't exist
        if (process.env.NODE_ENV === 'development') {
          console.warn("[Dashboard] Stats endpoint not available:", error);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("[Dashboard] Failed to load dashboard data:", error);
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

  // Merge localStorage runs with API runs (must be defined before useEffects that use it)
  const allRuns = useMemo(() => {
    if (isAuthenticated && !loadingRuns) {
      const apiRunsList = apiRuns.map(apiRun => {
        // Parse reports if it's a string, otherwise use the object or empty object
        let reports = {};
        if (apiRun.reports) {
          if (typeof apiRun.reports === 'string') {
            try {
              reports = JSON.parse(apiRun.reports);
            } catch (e) {
              console.warn("Failed to parse reports for run:", apiRun.run_id, e);
            }
          } else {
            reports = apiRun.reports;
          }
        }
        
        return {
          id: `run_${apiRun.run_id}`,
          timestamp: apiRun.created_at ? new Date(apiRun.created_at).getTime() : Date.now(),
          inputs: apiRun.inputs || {},
          outputs: reports,
          reports: reports,
          run_id: apiRun.run_id,
          from_api: true,
          is_validation: false,
        };
      });
      
      apiRunsList.forEach(run => {
        if (run.is_validation === undefined) {
          run.is_validation = false;
        }
      });

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


  // Extract all ideas from runs when apiRuns changes
  useEffect(() => {
    const extractIdeas = async () => {
      const ideasList = [];
      const seenIds = new Set();
      
      // Normalize run IDs to strings for consistent comparison
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
                  // Try multiple report locations
                  let reports = data.run.reports;
                  if (typeof reports === 'string') {
                    reports = JSON.parse(reports);
                  }
                  
                  // Also check personalized_recommendations directly on run
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
                    console.warn("[Dashboard] Failed to parse reports for run:", runId, e);
                  }
                }
              }
            }
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.warn("[Dashboard] Failed to fetch reports for run:", runId, error);
            }
          }
        });
        
        await Promise.all(fetchPromises);
      }
      
      // Process API runs
      for (const run of apiRuns) {
        const runId = normalizeRunId(run.run_id);
        if (!runId) continue;
        
        // Try multiple locations for reports - API might return reports in different formats
        let reports = run.reports;
        let personalizedRecs = null;
        
        // Check if reports is a string that needs parsing
        if (typeof reports === 'string') {
          try {
            reports = JSON.parse(reports);
          } catch (e) {
            if (process.env.NODE_ENV === 'development') {
              console.warn("[Dashboard] Failed to parse reports string for run:", runId);
            }
          }
        }
        
        // Try to get personalized_recommendations from various locations
        personalizedRecs = reports?.personalized_recommendations || 
                          run.personalized_recommendations ||
                          reportsMap.get(runId)?.personalized_recommendations;
        
        // If still not found, try fetching from API
        if (!personalizedRecs && runId) {
          const cachedReports = reportsMap.get(runId);
          if (cachedReports?.personalized_recommendations) {
            personalizedRecs = cachedReports.personalized_recommendations;
            reports = cachedReports;
          }
        }
        
        if (personalizedRecs) {
          const topIdeas = parseTopIdeas(personalizedRecs, 3);
          topIdeas.forEach((idea) => {
            // Normalize idea index to string for consistent ID format
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
      
      // Process localStorage runs (for non-authenticated users or as fallback)
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.forEach((run) => {
            const runId = normalizeRunId(run.run_id || run.id);
            if (!runId) return;
            
            // Check if already processed (normalize IDs for comparison)
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
            console.warn("[Dashboard] Failed to parse localStorage runs:", e);
          }
        }
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log("[Dashboard] Extracted ideas:", {
          totalIdeas: ideasList.length,
          fromApiRuns: apiRuns.length,
          sampleIdea: ideasList[0] ? {
            id: ideasList[0].id,
            title: ideasList[0].title,
            runId: ideasList[0].runId,
            hasInputs: !!ideasList[0].runInputs,
          } : null,
        });
      }
      
      setAllIdeas(ideasList);
    };
    
    // Always run extraction when:
    // 1. We have API runs, OR
    // 2. We're not authenticated (use localStorage), OR  
    // 3. Loading is complete (even if no runs, to clear state)
    if (apiRuns.length > 0 || !isAuthenticated || !loadingRuns) {
      extractIdeas();
    }
  }, [apiRuns, isAuthenticated, loadingRuns, getAuthHeaders]);

  // Helper function to extract comparison metrics from reports
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

  // Reusable function to perform comparison
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
      // Normalize IDs for comparison - convert Set/Array to normalized string set
      const normalizedCompareSet = new Set();
      if (ideasToCompare instanceof Set) {
        ideasToCompare.forEach(id => normalizedCompareSet.add(String(id)));
      } else if (Array.isArray(ideasToCompare)) {
        ideasToCompare.forEach(id => normalizedCompareSet.add(String(id)));
      }
      
      // Filter ideas using normalized string comparison
      const selectedIdeasData = allIdeas.filter(idea => {
        const ideaId = String(idea.id || '');
        return normalizedCompareSet.has(ideaId);
      });
      
      if (selectedIdeasData.length === 0) {
        alert("No matching ideas found. Please try selecting ideas again.");
        setComparing(false);
        return;
      }
      
      const runIds = [...new Set(selectedIdeasData.map(idea => String(idea.runId || ''))).filter(Boolean)];
      
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
          const ideasComparison = {
            ideas: selectedIdeasData.map(idea => {
              // Normalize run_id for comparison
              const normalizedRunId = String(idea.runId || '');
              const run = data.comparison.runs?.find(r => {
                const rRunId = String(r.run_id || '');
                return rRunId === normalizedRunId;
              });
              
              if (run && run.reports?.personalized_recommendations) {
                const topIdeas = parseTopIdeas(run.reports.personalized_recommendations, 3);
                // Normalize ideaIndex for comparison
                const normalizedIdeaIndex = String(idea.ideaIndex || '');
                const matchedIdea = topIdeas.find(i => {
                  const iIndex = String(i.index || '');
                  return iIndex === normalizedIdeaIndex;
                });
                if (matchedIdea) {
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
        console.error("[Dashboard] Failed to compare ideas:", error);
      }
      alert("Network error. Please check your connection and try again.");
    } finally {
      setComparing(false);
    }
  }, [allIdeas, getAuthHeaders]);


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

  // Delete all active ideas, sessions, and validations
  const handleDeleteAll = async () => {
    const confirmMessage = "⚠️ WARNING: This will permanently delete ALL:\n" +
      "• All discovery sessions (runs)\n" +
      "• All validations\n" +
      "• All local storage data\n\n" +
      "This action CANNOT be undone. Are you absolutely sure?";
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    // Double confirmation
    if (!window.confirm("Last chance! This will delete EVERYTHING. Continue?")) {
      return;
    }
    
    try {
      const errors = [];
      let deletedRuns = 0;
      let deletedValidations = 0;
      
      // Delete all runs from API
      if (isAuthenticated && apiRuns.length > 0) {
        for (const run of apiRuns) {
          if (run.run_id) {
            try {
              const response = await fetch(`/api/user/run/${run.run_id}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
              });
              if (response.ok) {
                deletedRuns++;
              } else {
                const data = await response.json().catch(() => ({}));
                errors.push(`Failed to delete run ${run.run_id}: ${data.error || response.status}`);
              }
            } catch (error) {
              errors.push(`Error deleting run ${run.run_id}: ${error.message}`);
            }
          }
        }
      }
      
      // Delete all validations from API
      if (isAuthenticated && apiValidations.length > 0) {
        for (const validation of apiValidations) {
          const validationId = validation.validation_id || validation.id;
          if (validationId) {
            const cleanId = validationId.toString().replace(/^val_/, '');
            try {
              const response = await fetch(`/api/validate-idea/${cleanId}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
              });
              if (response.ok) {
                deletedValidations++;
              } else {
                const data = await response.json().catch(() => ({}));
                errors.push(`Failed to delete validation ${cleanId}: ${data.error || response.status}`);
              }
            } catch (error) {
              errors.push(`Error deleting validation ${cleanId}: ${error.message}`);
            }
          }
        }
      }
      
      // Clear all local storage
      localStorage.removeItem(STORAGE_KEY); // sia_saved_runs
      localStorage.removeItem("sia_validations");
      localStorage.removeItem("revalidate_data");
      localStorage.removeItem("recentDiscovery");
      
      // Clear local runs
      setRuns([]);
      setApiRuns([]);
      setApiValidations([]);
      
      // Reload dashboard data
      await loadDashboardData();
      loadRuns();
      
      // Show results
      const successMessage = `✅ Deletion complete!\n\n` +
        `• Deleted ${deletedRuns} run(s) from database\n` +
        `• Deleted ${deletedValidations} validation(s) from database\n` +
        `• Cleared all local storage\n` +
        (errors.length > 0 ? `\n⚠️ ${errors.length} error(s) occurred:\n${errors.slice(0, 5).join('\n')}` : '');
      
      alert(successMessage);
      
      if (errors.length > 0 && process.env.NODE_ENV === 'development') {
        console.error("Deletion errors:", errors);
      }
    } catch (error) {
      console.error("Failed to delete all data:", error);
      alert(`Failed to delete all data: ${error.message}`);
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

  // Format validations for display
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

  // Filter and sort sessions
  const filteredRuns = useMemo(() => {
    let filtered = allRuns.filter(s => {
      if (s.is_validation === true) return false;
      if (s.validation_id) return false;
      if (s.overall_score !== undefined && !s.run_id) return false;
      if (s.idea_explanation && !s.inputs) return false;
      return true;
    });
    
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "score":
          return (b.timestamp || 0) - (a.timestamp || 0);
        case "name":
          const aName = a.inputs?.founder_ambition || "";
          const bName = b.inputs?.founder_ambition || "";
          return aName.localeCompare(bName);
        case "date":
        default:
          return (b.timestamp || 0) - (a.timestamp || 0);
      }
    });
    
    return filtered;
  }, [allRuns, sortBy]);

  const filteredValidations = useMemo(() => {
    let filtered = [...allValidations];
    
    if (workspaceSearchQuery && workspaceSearchQuery.trim()) {
      const query = workspaceSearchQuery.toLowerCase();
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
  }, [allValidations, workspaceSearchQuery, dateFilter, scoreFilter, sortBy, advancedSearch]);

  // Check if a session has open actions
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

  // Check if a session has notes
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



  // Calculate summary statistics for Insights
  const summaryStats = useMemo(() => {
    const completedRuns = allRuns.filter(run => {
      // Check multiple locations for personalized_recommendations
      const reports = run.reports || run.outputs || {};
      const recs = reports.personalized_recommendations || run.personalized_recommendations;
      
      if (!recs) return false;
      
      // Check if it's a non-empty string or non-empty object
      if (typeof recs === 'string') {
        return recs.trim().length > 0;
      }
      if (typeof recs === 'object') {
        return Object.keys(recs).length > 0;
      }
      return false;
    });
    const validationsWithScores = allValidations.filter(v => v.overall_score !== undefined && v.overall_score !== null);
    const scores = validationsWithScores.map(v => v.overall_score);
    const avgScore = scores.length > 0 
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
      : 0;
    const highScores = scores.filter(s => s >= 7).length;
    
    return {
      totalDiscoveries: completedRuns.length,
      totalIdeas: completedRuns.length * 3,
      totalValidations: allValidations.length,
      avgValidationScore: avgScore.toFixed(1),
      highScoringIdeas: highScores,
      activeIdeas: allIdeas.length,
    };
  }, [allRuns, allValidations, allIdeas]);

  // Workspace search - unified search across ideas, sessions, validations (debounced, requires 3+ chars)
  useEffect(() => {
    // Clear existing timer
    if (workspaceSearchDebounceTimer) {
      clearTimeout(workspaceSearchDebounceTimer);
    }

    const query = workspaceSearchQuery.trim();
    
    // Don't search if less than 3 characters
    if (query.length < 3) {
      setWorkspaceSearchResults({ ideas: [], sessions: [], validations: [] });
      return;
    }

    // Debounce: wait 300ms after user stops typing
    const timer = setTimeout(() => {
      const queryLower = query.toLowerCase();
      const results = {
        ideas: [],
        sessions: [],
        validations: [],
      };

      // Search Active Ideas (max 3) - Expanded to include more fields
      allIdeas.forEach(idea => {
        if (results.ideas.length >= 3) return;
        const title = (idea.title || "").toLowerCase();
        const summary = (idea.summary || "").toLowerCase();
        const targetMarket = (idea.target_market || "").toLowerCase();
        const revenueModel = (idea.revenue_model || "").toLowerCase();
        const whyThisFits = (idea.why_this_fits || "").toLowerCase();
        const timeline = (idea.timeline || "").toLowerCase();
        const detailsMarkdown = (idea.details_markdown || "").toLowerCase();
        
        if (title.includes(queryLower) || 
            summary.includes(queryLower) ||
            targetMarket.includes(queryLower) ||
            revenueModel.includes(queryLower) ||
            whyThisFits.includes(queryLower) ||
            timeline.includes(queryLower) ||
            detailsMarkdown.includes(queryLower)) {
          const run = allRuns.find(r => (r.run_id || r.id) === idea.runId);
          const inputs = run?.inputs || {};
          const industry = inputs.sub_interest_area || inputs.industry_interest || "";
          results.ideas.push({
            type: "idea",
            id: idea.id,
            title: idea.title || "Untitled Idea",
            industry: industry,
            runId: idea.runId,
            ideaIndex: idea.ideaIndex,
            tab: "ideas",
            timestamp: idea.runCreatedAt ? new Date(idea.runCreatedAt).getTime() : 0,
          });
        }
      });

      // Search Past Sessions (max 3)
      filteredRuns.forEach(run => {
        if (results.sessions.length >= 3) return;
        const inputs = run.inputs || {};
        const founderAmbition = (inputs.founder_ambition || "").toLowerCase();
        const industryInterest = (inputs.industry_interest || "").toLowerCase();
        const subInterest = (inputs.sub_interest_area || "").toLowerCase();
        const runId = (run.run_id || run.id || "").toLowerCase();
        
        if (founderAmbition.includes(queryLower) || 
            industryInterest.includes(queryLower) || 
            subInterest.includes(queryLower) ||
            runId.includes(queryLower)) {
          const industry = inputs.sub_interest_area || inputs.industry_interest || "";
          results.sessions.push({
            type: "session",
            id: run.run_id || run.id,
            title: inputs.founder_ambition || "Discovery session",
            industry: industry,
            tab: "searches",
            timestamp: run.timestamp || (run.created_at ? new Date(run.created_at).getTime() : 0),
          });
        }
      });

      // Search Validations (max 3)
      filteredValidations.forEach(validation => {
        if (results.validations.length >= 3) return;
        const ideaExplanation = (validation.idea_explanation || "").toLowerCase();
        const valId = (validation.validation_id || validation.id || "").toLowerCase();
        
        if (ideaExplanation.includes(queryLower) || valId.includes(queryLower)) {
          // Try to find industry from validation context if available
          const industry = ""; // Validations don't always have industry context
          results.validations.push({
            type: "validation",
            id: validation.validation_id || validation.id,
            title: validation.idea_explanation || "Validated idea",
            industry: industry,
            tab: "validations",
            timestamp: validation.timestamp || 0,
          });
        }
      });

      // Sort each group by timestamp (most recent first)
      results.ideas.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      results.sessions.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      results.validations.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      setWorkspaceSearchResults(results);
    }, 300);

    setWorkspaceSearchDebounceTimer(timer);

    // Cleanup
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [workspaceSearchQuery, allIdeas, filteredRuns, filteredValidations, allRuns]);

  // Filtered ideas for search tab - searches across multiple fields with category filtering
  const filteredSearchIdeas = useMemo(() => {
    if (!searchTabQuery || searchTabQuery.trim().length < 2) {
      return [];
    }
    
    const query = searchTabQuery.toLowerCase().trim();
    const queryParts = query.split(/\s+/).filter(p => p.length > 0);
    
    return allIdeas.filter(idea => {
      const title = (idea.title || "").toLowerCase();
      const summary = (idea.summary || "").toLowerCase();
      const targetMarket = (idea.target_market || "").toLowerCase();
      const revenueModel = (idea.revenue_model || "").toLowerCase();
      const whyThisFits = (idea.why_this_fits || "").toLowerCase();
      const timeline = (idea.timeline || "").toLowerCase();
      const detailsMarkdown = (idea.details_markdown || "").toLowerCase();
      
      // If category is "all", search across all fields
      if (searchCategory === "all") {
        const searchableText = `${title} ${summary} ${targetMarket} ${revenueModel} ${whyThisFits} ${timeline} ${detailsMarkdown}`;
        return queryParts.every(part => searchableText.includes(part));
      }
      
      // Otherwise, search only in the selected category
      let searchableText = "";
      switch (searchCategory) {
        case "title":
          searchableText = title;
          break;
        case "summary":
          searchableText = summary;
          break;
        case "market":
          searchableText = targetMarket;
          break;
        case "revenue":
          searchableText = revenueModel;
          break;
        case "timeline":
          searchableText = timeline;
          break;
        case "why_fits":
          searchableText = whyThisFits;
          break;
        default:
          searchableText = `${title} ${summary} ${targetMarket} ${revenueModel} ${whyThisFits} ${timeline}`;
      }
      
      return queryParts.every(part => searchableText.includes(part));
    });
  }, [allIdeas, searchTabQuery, searchCategory]);

  // Check URL params for initial tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["ideas", "searches", "validations", "compare", "insights", "search"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Auto-trigger comparison when navigating to compare tab with pre-selected ideas
  useEffect(() => {
    if (activeTab === "compare" && selectedIdeas.size > 0 && !comparisonData && !comparing && autoCompareTrigger) {
      performComparison(selectedIdeas);
      setAutoCompareTrigger(false);
    }
  }, [activeTab, selectedIdeas, comparisonData, comparing, autoCompareTrigger, performComparison]);

  return (
    <div className="max-w-screen-lg mx-auto px-4 md:px-6 py-6">
      <Seo
        title="Idea Workspace | Startup Idea Advisor"
        description="View, compare, and revisit startup ideas you're working on."
        path="/dashboard"
      />

      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-slate-50">
          Idea Workspace
        </h1>
        <button
          onClick={handleDeleteAll}
          className="px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/50 hover:border-red-300 dark:hover:border-red-700 transition-colors flex items-center gap-2"
          title="Delete all sessions, validations, and local storage data"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete All Data
        </button>
      </div>

      {/* Action Bar - Lenses applied to workspace */}
      <div className="mb-6 flex justify-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/advisor")}
            className="px-4 py-2 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors flex items-center gap-2 action-button"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Discover Ideas
          </button>
          <button
            onClick={() => navigate("/validate-idea")}
            className="px-4 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors flex items-center gap-2 action-button"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Validate an Idea
          </button>
          <button
            onClick={() => setActiveTab("compare")}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 action-button ${
              activeTab === "compare"
                ? "border-purple-300 dark:border-purple-600 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300"
                : "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:border-purple-300 dark:hover:border-purple-700"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Compare Ideas
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 action-button ${
              activeTab === "insights"
                ? "border-blue-300 dark:border-blue-600 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                : "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:border-blue-300 dark:hover:border-blue-700"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Insights
          </button>
          <button
            onClick={() => navigate("/founder-connect")}
            className="px-4 py-2 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors flex items-center gap-2 action-button"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Founder Network
          </button>
        </div>
      </div>

      {/* Workspace - Dominant Surface */}
      <section className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-7 shadow-sm min-h-[600px] relative overflow-hidden workspace-container">
        <style>{`
          .action-button:hover {
            box-shadow: 0 0 12px rgba(120, 140, 255, 0.25);
          }
          .workspace-container {
            background: linear-gradient(180deg, #fafaff 0%, #ffffff 60%);
          }
          .dark .workspace-container {
            background: linear-gradient(180deg, #1e293b 0%, #0f172a 60%);
          }
        `}</style>
        {/* Accent circle behind tabs */}
        <div className="absolute top-[-60px] left-[-60px] w-[260px] h-[260px] rounded-full bg-indigo-200 opacity-[0.08] blur-2xl"></div>
        
        {/* Workspace Header */}
        <div className="mb-6 flex items-start justify-between gap-4 relative z-10">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-50 mb-2">Idea Workspace</h2>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              View, compare, and revisit startup ideas you're working on.
            </p>
          </div>
          {/* Workspace Search */}
          <div className="relative w-80">
            <div className="relative">
              <input
                type="text"
                value={workspaceSearchQuery}
                onChange={(e) => setWorkspaceSearchQuery(e.target.value)}
                placeholder="Find ideas you explored before"
                className="w-full px-4 py-2 pl-10 pr-10 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {workspaceSearchQuery && (
                <button
                  onClick={() => setWorkspaceSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {/* Search Results Dropdown */}
            {workspaceSearchQuery.trim().length >= 3 && 
             (workspaceSearchResults.ideas?.length > 0 || 
              workspaceSearchResults.sessions?.length > 0 || 
              workspaceSearchResults.validations?.length > 0) && (
              <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg max-h-[240px] overflow-y-auto">
                {/* Ideas Group */}
                {workspaceSearchResults.ideas && workspaceSearchResults.ideas.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide border-b border-gray-100 dark:border-slate-700">
                      Ideas
                    </div>
                    {workspaceSearchResults.ideas.map((result, index) => (
                      <button
                        key={`idea-${result.id}-${index}`}
                        onClick={() => {
                          setActiveTab(result.tab);
                          setWorkspaceSearchQuery("");
                          if (result.runId) {
                            const runId = result.runId;
                            const ideaIndex = result.ideaIndex || 0;
                            navigate(`/advisor/${runId}?idea=${ideaIndex}`);
                          }
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-b border-gray-100 dark:border-slate-700 last:border-b-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                              {result.title}
                            </div>
                            {result.industry && (
                              <div className="text-xs text-gray-600 dark:text-slate-400 mt-0.5">
                                Discovery session · {result.industry}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Sessions Group */}
                {workspaceSearchResults.sessions && workspaceSearchResults.sessions.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide border-b border-gray-100 dark:border-slate-700">
                      Sessions
                    </div>
                    {workspaceSearchResults.sessions.map((result, index) => (
                      <button
                        key={`session-${result.id}-${index}`}
                        onClick={() => {
                          setActiveTab(result.tab);
                          setWorkspaceSearchQuery("");
                          if (result.id) {
                            navigate(`/advisor/${result.id}`);
                          }
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-b border-gray-100 dark:border-slate-700 last:border-b-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                              {result.title}
                            </div>
                            {result.industry && (
                              <div className="text-xs text-gray-600 dark:text-slate-400 mt-0.5">
                                Discovery session · {result.industry}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Validations Group */}
                {workspaceSearchResults.validations && workspaceSearchResults.validations.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide border-b border-gray-100 dark:border-slate-700">
                      Validations
                    </div>
                    {workspaceSearchResults.validations.map((result, index) => (
                      <button
                        key={`validation-${result.id}-${index}`}
                        onClick={() => {
                          setActiveTab(result.tab);
                          setWorkspaceSearchQuery("");
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-b border-gray-100 dark:border-slate-700 last:border-b-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                              {result.title}
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5">
                              Validated idea{result.industry ? ` · ${result.industry}` : ""}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* No Results */}
            {workspaceSearchQuery.trim().length >= 3 && 
             (!workspaceSearchResults.ideas || workspaceSearchResults.ideas.length === 0) &&
             (!workspaceSearchResults.sessions || workspaceSearchResults.sessions.length === 0) &&
             (!workspaceSearchResults.validations || workspaceSearchResults.validations.length === 0) && (
              <div className="absolute z-50 w-full mt-2 bg-white  border border-slate-200  rounded-lg shadow-lg p-4">
                <p className="text-sm text-gray-600 text-center">
                  No matching ideas yet.
                </p>
              </div>
            )}
          </div>
        </div>
          
        {/* Workspace tabs */}
        <div className="mb-8 relative z-10">
          <nav className="flex gap-6 flex-wrap border-b border-gray-200 dark:border-slate-700" aria-label="Workspace tabs">
              <button
                onClick={() => setActiveTab("ideas")}
              className={`px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                  activeTab === "ideas"
                  ? "border-indigo-600 dark:border-indigo-400 text-gray-900 dark:text-indigo-400"
                    : "border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                }`}
              >
                Active Ideas
              </button>
              <button
                onClick={() => setActiveTab("searches")}
              className={`px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                  activeTab === "searches"
                  ? "border-indigo-600 dark:border-indigo-400 text-gray-900 dark:text-indigo-400"
                    : "border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                }`}
              >
                Past Sessions
              </button>
              <button
                onClick={() => setActiveTab("validations")}
              className={`px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                  activeTab === "validations"
                  ? "border-indigo-600 dark:border-indigo-400 text-gray-900 dark:text-indigo-400"
                    : "border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                }`}
              >
                Validations
              </button>
              <button
              onClick={() => setActiveTab("compare")}
              className={`px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                activeTab === "compare"
                  ? "border-indigo-600 dark:border-indigo-400 text-gray-900 dark:text-indigo-400"
                    : "border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                }`}
              >
              Compare
              </button>
              <button
              onClick={() => setActiveTab("insights")}
              className={`px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                activeTab === "insights"
                  ? "border-indigo-600 dark:border-indigo-400 text-gray-900 dark:text-indigo-400"
                    : "border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                }`}
              >
              Insights
              </button>
              <button
              onClick={() => setActiveTab("search")}
              className={`px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                activeTab === "search"
                  ? "border-indigo-600 dark:border-indigo-400 text-gray-900 dark:text-indigo-400"
                    : "border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                }`}
              >
              Search
              </button>
            </nav>
          </div>

          <div className="space-y-6">
          {/* Active Ideas */}
            {activeTab === "ideas" && (
              <>
              <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
                Ideas you're actively considering or revisiting.
              </p>
                <DashboardActiveIdeasTab
                  actions={actions}
                  notes={notes}
                  loadingActions={loadingActions}
                  loadingNotes={loadingNotes}
                  allRuns={allRuns}
                  allValidations={allValidations}
                  searchQuery={workspaceSearchQuery}
                  allIdeas={allIdeas}
                />
              </>
            )}

          {/* Past Sessions */}
          {activeTab === "searches" && (
            <>
              <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
                Ideas you explored earlier.
              </p>
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
            </>
            )}

          {/* Validations */}
          {activeTab === "validations" && (
            <>
              <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
                Results from checking how strong an idea is.
              </p>
              <DashboardSessionsTab
                activeTab="validations"
                setActiveTab={setActiveTab}
                filteredRuns={[]}
                filteredValidations={filteredValidations}
                loadingRuns={loadingRuns}
                sessionHasOpenActions={sessionHasOpenActions}
                sessionHasNotes={sessionHasNotes}
                handleDelete={handleDelete}
                handleNewRequest={handleNewRequest}
                handleEditValidation={handleEditValidation}
              />
            </>
          )}

          {/* Compare */}
          {activeTab === "compare" && (
            <>
              <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
                See ideas next to each other.
              </p>
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
            </>
          )}

          {/* Search Tab */}
          {activeTab === "search" && (
            <div className="space-y-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-slate-50 mb-2">Search Your Ideas</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Find ideas by searching across different fields. Use categories to narrow your search.
                </p>
              </div>

              {/* Search Categories */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
                  Search Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "all", label: "All Fields", icon: "🔍", description: "Search everywhere" },
                    { id: "title", label: "Title", icon: "📝", description: "Idea titles" },
                    { id: "summary", label: "Summary", icon: "📄", description: "Brief descriptions" },
                    { id: "market", label: "Target Market", icon: "🎯", description: "Who it's for" },
                    { id: "revenue", label: "Revenue Model", icon: "💰", description: "How it makes money" },
                    { id: "timeline", label: "Timeline", icon: "⏱️", description: "Time to launch" },
                    { id: "why_fits", label: "Why It Fits", icon: "✨", description: "Why it matches you" },
                  ].map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSearchCategory(category.id);
                        if (!searchTabQuery) {
                          setSearchTabQuery("");
                        }
                      }}
                      className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        searchCategory === category.id
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-md"
                          : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700"
                      }`}
                      title={category.description}
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Input with Better Placeholder */}
              <div className="relative">
                <textarea
                  value={searchTabQuery}
                  onChange={(e) => setSearchTabQuery(e.target.value)}
                  placeholder={
                    searchCategory === "all" 
                      ? "Type keywords to search across all fields (e.g., 'subscription', 'SaaS', 'B2B')..."
                      : searchCategory === "title"
                      ? "Search idea titles (e.g., 'AI chatbot', 'e-commerce platform')..."
                      : searchCategory === "summary"
                      ? "Search summaries (e.g., 'helps small businesses', 'automates workflow')..."
                      : searchCategory === "market"
                      ? "Search target markets (e.g., 'small businesses', 'developers', 'students')..."
                      : searchCategory === "revenue"
                      ? "Search revenue models (e.g., 'subscription', 'one-time', 'commission')..."
                      : searchCategory === "timeline"
                      ? "Search timelines (e.g., '3 months', '6 months', '1 year')..."
                      : "Search why ideas fit (e.g., 'matches your skills', 'low budget')..."
                  }
                  rows={3}
                  className="w-full px-4 py-3 pl-10 pr-10 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
                <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTabQuery && (
                  <button
                    onClick={() => {
                      setSearchTabQuery("");
                      setSearchCategory("all");
                    }}
                    className="absolute right-3 top-3 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-300"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Search Tips */}
              {!searchTabQuery && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Search Tips:</p>
                  <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                    <li>Select a category to search specific fields, or use "All Fields" to search everywhere</li>
                    <li>You can search for multiple words - all words must match</li>
                    <li>Try searching for: business types, industries, revenue models, or keywords from your ideas</li>
                  </ul>
                </div>
              )}

              {/* Search Results */}
              {searchTabQuery.trim().length >= 2 ? (
                filteredSearchIdeas.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600 dark:text-slate-400">
                        <span className="font-semibold">{filteredSearchIdeas.length}</span> idea{filteredSearchIdeas.length !== 1 ? "s" : ""} found
                        {searchCategory !== "all" && (
                          <span className="ml-2 text-xs">
                            in <span className="font-medium">{searchCategory === "title" ? "Titles" : searchCategory === "summary" ? "Summaries" : searchCategory === "market" ? "Target Markets" : searchCategory === "revenue" ? "Revenue Models" : searchCategory === "timeline" ? "Timelines" : "Why It Fits"}</span>
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setSearchTabQuery("");
                          setSearchCategory("all");
                        }}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                      >
                        Clear Search
                      </button>
                    </div>
                    <div className="grid gap-4">
                      {filteredSearchIdeas.map((idea) => {
                        const run = allRuns.find(r => (r.run_id || r.id) === idea.runId);
                        return (
                          <div
                            key={idea.id}
                            className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="text-lg font-bold text-gray-900 dark:text-slate-50 mb-2">
                                  {idea.title || "Untitled Idea"}
                                </h4>
                                {idea.summary && (
                                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                                    {idea.summary}
                                  </p>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                  {idea.target_market && (
                                    <div className={`p-2 rounded ${searchCategory === "market" ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800" : ""}`}>
                                      <span className="font-semibold text-gray-700 dark:text-slate-300">🎯 Target Market: </span>
                                      <span className="text-gray-600 dark:text-slate-400">{idea.target_market}</span>
                                    </div>
                                  )}
                                  {idea.revenue_model && (
                                    <div className={`p-2 rounded ${searchCategory === "revenue" ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800" : ""}`}>
                                      <span className="font-semibold text-gray-700 dark:text-slate-300">💰 Revenue Model: </span>
                                      <span className="text-gray-600 dark:text-slate-400">{idea.revenue_model}</span>
                                    </div>
                                  )}
                                  {idea.timeline && (
                                    <div className={`p-2 rounded ${searchCategory === "timeline" ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800" : ""}`}>
                                      <span className="font-semibold text-gray-700 dark:text-slate-300">⏱️ Timeline: </span>
                                      <span className="text-gray-600 dark:text-slate-400">{idea.timeline}</span>
                                    </div>
                                  )}
                                  {idea.why_this_fits && (
                                    <div className={`p-2 rounded ${searchCategory === "why_fits" ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800" : ""}`}>
                                      <span className="font-semibold text-gray-700 dark:text-slate-300">✨ Why This Fits: </span>
                                      <span className="text-gray-600 dark:text-slate-400">{idea.why_this_fits}</span>
                                    </div>
                                  )}
                                </div>
                                {idea.runCreatedAt && (
                                  <p className="text-xs text-gray-500 dark:text-slate-500 mt-3">
                                    Created: {new Date(idea.runCreatedAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                            {run && (
                              <button
                                onClick={() => {
                                  const ideaIndex = idea.ideaIndex || 0;
                                  navigate(`/advisor/${idea.runId}?idea=${ideaIndex}`);
                                }}
                                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                              >
                                View Full Details
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                      No ideas found matching "{searchTabQuery}"
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Try different keywords or check your spelling.
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700">
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Enter at least 2 characters to search
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Insights */}
          {activeTab === "insights" && (
            <DashboardInsightsTab insights={insights} />
          )}
          </div>
        </section>
    </div>
  );
}

