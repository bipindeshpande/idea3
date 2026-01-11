import { useRef, useState } from "react";
import Seo from "../../components/common/Seo.jsx";
import DiscoveryEmptyState from "../../components/discovery/DiscoveryEmptyState.jsx";
import DiscoveryLoadingState from "../../components/discovery/DiscoveryLoadingState.jsx";
import DiscoveryErrorState from "../../components/discovery/DiscoveryErrorState.jsx";
import DiscoveryTabs from "../../components/discovery/DiscoveryTabs.jsx";
import { DISCOVERY_SPACING } from "../../components/discovery/DiscoveryTheme.js";
import { useReports } from "../../context/ReportsContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import CacheIndicator from "../../components/common/CacheIndicator.jsx";
import { useRecommendationReportData } from "../../hooks/recommendation/useRecommendationReportData.js";
import { useRecommendationTransformations } from "../../hooks/recommendation/useRecommendationTransformations.js";
import { useSmartRecommendations } from "../../hooks/recommendation/useSmartRecommendations.js";
import { useReportEnhancements } from "../../hooks/recommendation/useReportEnhancements.js";
import ConflictAdjustmentMessage from "../../components/discovery/ConflictAdjustmentMessage.jsx";
import IdeasTabContent from "../../components/discovery/IdeasTabContent.jsx";
import NextStepsTabContent from "../../components/discovery/NextStepsTabContent.jsx";
import FinalConclusionTabContent from "../../components/discovery/FinalConclusionTabContent.jsx";
import SimilarIdeasSection from "../../components/discovery/SimilarIdeasSection.jsx";
import UnparseableRecommendations from "../../components/discovery/UnparseableRecommendations.jsx";

export default function RecommendationsReport() {
 const { reports, loadRunById, currentRunId, inputs, loadFromRecentDiscoveryCache, isCached } = useReports();
 const { getAuthHeaders, isAuthenticated } = useAuth();
 const reportRef = useRef(null);
 const [activeTab, setActiveTab] = useState("ideas");

 // Custom hooks for data management
 const {
   runId,
   error,
   isLoading,
   effectiveReports,
   effectiveInputs,
   cachedRun,
   cachedIdeas
 } = useRecommendationReportData(reports, inputs, loadRunById, currentRunId, loadFromRecentDiscoveryCache);

 const {
   markdown,
   conflictAdjustment,
   allIdeas,
   topIdeas,
   unifiedNextSteps,
   finalRecommendation,
   finalConclusion
 } = useRecommendationTransformations(effectiveReports, cachedIdeas, effectiveInputs);

 const {
   smartRecommendations,
   ideasWithActions,
   ideasWithNotes
 } = useSmartRecommendations(isAuthenticated, getAuthHeaders);

 const {
   enhancements,
   enhancementsLoading,
   enhancementsStarted
} = useReportEnhancements(isAuthenticated, runId, effectiveReports, cachedRun, getAuthHeaders);

// Show error state
if (error) {
 return (
 <>
 <Seo
 title="Error | Startup Idea Advisor"
 description="Error loading recommendation report"
 path="/dashboard/recommendations"
 />
 <DiscoveryErrorState
 error={error}
 primaryAction={{ to: "/advisor", label: "Generate New Report" }}
 />
 </>
 );
 }

 // Show loading state
 if (isLoading) {
 return (
 <>
 <Seo
 title="Loading Recommendations | Startup Idea Advisor"
 description="Loading recommendation report"
 path="/dashboard/recommendations"
 />
 <DiscoveryLoadingState
 title="Loading Report..."
 message="Please wait while we load your recommendations."
 />
 </>
 );
 }

 // Show message if no reports yet
 if (!effectiveReports || !effectiveReports.personalized_recommendations || !effectiveReports.personalized_recommendations.trim()) {
 // Debug info in development
 const debugInfo = process.env.NODE_ENV === 'development' && effectiveReports ? {
   hasEffectiveReports: !!effectiveReports,
   hasReports: !!reports,
   hasRecommendations: !!effectiveReports?.personalized_recommendations,
   recommendationsLength: effectiveReports?.personalized_recommendations?.length || 0,
   recommendationsPreview: effectiveReports?.personalized_recommendations?.substring(0, 500),
   allKeys: Object.keys(effectiveReports || {}),
 } : null;

 return (
 <>
 <Seo
 title="No Recommendations | Startup Idea Advisor"
 description="No recommendation report available"
 path="/dashboard/recommendations"
 />
 <DiscoveryEmptyState
 title="No Report Available"
 message={runId ? "Report not found. It may have been deleted or the ID is invalid." : "No report data available. Please generate recommendations first."}
 primaryAction={{ to: "/advisor", label: "Generate Recommendations" }}
 debugInfo={debugInfo}
 />
 </>
 );
 }

 return (
 <>
 <Seo
 title="Personalized Startup Recommendations | Startup Idea Advisor"
 description="Review AI-generated startup ideas, financial outlook, and execution roadmap tailored to your profile."
 path="/dashboard/recommendations"
 />

 <div ref={reportRef} className={DISCOVERY_SPACING.sectionGap.replace('gap-', 'space-y-')}>
 {/* Conflict Adjustment Message */}
 <ConflictAdjustmentMessage conflictAdjustment={conflictAdjustment} />

 {/* Unparseable Recommendations */}
 {topIdeas.length === 0 && (
 <UnparseableRecommendations markdown={markdown} />
 )}

 {topIdeas.length > 0 && (
 <>
 {/* Tabbed Interface */}
 <DiscoveryTabs
 tabs={[
 { id: "ideas", label: "Top Startup Ideas" },
 { id: "nextsteps", label: "Next Steps" },
 ...(finalRecommendation || finalConclusion ? [{ id: "conclusion", label: "Final Recommendation" }] : [])
 ]}
 activeTab={activeTab}
 onTabChange={setActiveTab}
 />

 {/* Tab Content: Top Startup Ideas */}
 {activeTab === "ideas" && (
 <IdeasTabContent
 topIdeas={topIdeas}
 allIdeas={allIdeas}
 runId={runId}
 currentRunId={currentRunId}
 effectiveReports={effectiveReports}
 cachedRun={cachedRun}
 effectiveInputs={effectiveInputs}
 ideasWithActions={ideasWithActions}
 ideasWithNotes={ideasWithNotes}
 />
 )}

 {/* Tab Content: Next Steps */}
 {activeTab === "nextsteps" && (
 <NextStepsTabContent
 unifiedNextSteps={unifiedNextSteps}
 topIdeas={topIdeas}
 allIdeas={allIdeas}
 runId={runId}
 currentRunId={currentRunId}
 effectiveReports={effectiveReports}
 cachedRun={cachedRun}
 effectiveInputs={effectiveInputs}
 />
 )}

 {/* Tab Content: Final Conclusion */}
 {activeTab === "conclusion" && (
 <FinalConclusionTabContent
 finalRecommendation={finalRecommendation}
 finalConclusion={finalConclusion}
 />
 )}

 {/* Similar Ideas Section */}
 <SimilarIdeasSection smartRecommendations={smartRecommendations} />
 </>
 )}
 </div>
 <CacheIndicator isCached={isCached} />
 </>
 );
}
