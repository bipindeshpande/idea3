import React, { useEffect, useMemo, useState, useRef } from "react";
import Seo from "../../components/common/Seo.jsx";
import { useValidation } from "../../context/ValidationContext.jsx";
import { useReports } from "../../context/ReportsContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { buildValidationConclusion } from "../../utils/formatters/validationConclusion.js";
import { getScoreMeta } from "./utils.js";
import ValidationHeader from "./components/ValidationHeader.jsx";
import ValidationTabs from "./components/ValidationTabs.jsx";
import InputTab from "./components/InputTab.jsx";
import ResultsTab from "./components/ResultsTab.jsx";
import AnalysisTab from "./components/AnalysisTab.jsx";
import ConclusionTab from "./components/ConclusionTab.jsx";
import NextStepsTab from "./components/NextStepsTab.jsx";
import ValidationLoadingState from "./components/ValidationLoadingState.jsx";
import ValidationErrorState from "./components/ValidationErrorState.jsx";
import { useValidationDataLoader } from "./hooks/useValidationDataLoader.js";
import { useValidationProcessing } from "./hooks/useValidationProcessing.js";
import { usePDFGenerator } from "./hooks/usePDFGenerator.jsx";

export default function ValidationResult() {
  const { currentValidation, categoryAnswers, ideaExplanation, loading: validationLoading } = useValidation();
  const { setInputs } = useReports();
  const { subscription, user, isAuthenticated } = useAuth();
  const isFree = !subscription || subscription?.subscription_type === "free";
  const isStarter = subscription?.subscription_type === "starter";
  const [activeTab, setActiveTab] = useState("input");
  const [viewFilter, setViewFilter] = useState("all");
  const [sortOption, setSortOption] = useState("category");
  const downloadButtonRef = useRef(null);
  
  // Scroll to top when navigating to results tab
  useEffect(() => {
    if (activeTab === "results") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeTab]);

  // Load validation data from URL parameters
  const { previousScore } = useValidationDataLoader();

  // Get validation data - the validation result is stored in currentValidation.validation
  const validation = currentValidation?.validation || null;
  const [showCelebration, setShowCelebration] = useState(false);

  // Process validation data (recommendations, nextSteps, parameterLookup, etc.)
  const {
    scores,
    overallScore,
    recommendations,
    nextSteps,
    parameterLookup,
    radarData,
    parameterGroups,
  } = useValidationProcessing(validation, categoryAnswers, ideaExplanation, viewFilter, sortOption);

  // Show celebration for high scores
  useEffect(() => {
    if (overallScore >= 8 && validation) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [overallScore, validation]);

  // Generate final conclusion
  const finalConclusion = useMemo(
    () => buildValidationConclusion(validation, categoryAnswers, ideaExplanation),
    [validation, categoryAnswers, ideaExplanation]
  );

  // Get effective category answers
  const effectiveCategoryAnswers = useMemo(() => {
    if (categoryAnswers && Object.keys(categoryAnswers).length > 0) {
      return categoryAnswers;
    }
    if (currentValidation?.categoryAnswers && Object.keys(currentValidation.categoryAnswers).length > 0) {
      return currentValidation.categoryAnswers;
    }
    return {};
  }, [categoryAnswers, currentValidation]);

  // PDF generation hook
  const { downloadingPDF, generatePDF } = usePDFGenerator();

  // Calculate overall status
  const overallStatus = getScoreMeta(overallScore);

  // Early return AFTER all hooks have been called
  // Show loading state if validation is being loaded
  if (validationLoading) {
    return <ValidationLoadingState />;
  }

  if (!validation) {
    return <ValidationErrorState />;
  }

  const scoreDescription =
    overallScore >= 8
      ? "Your idea shows strong potential with excellent scores across key validation parameters."
      : overallScore >= 6
      ? "Your idea has good potential with some areas that need strengthening."
      : "Your idea requires refinement in several key areas before moving forward.";

  const dynamicTitle = validation
    ? `Idea Validation Results - Score: ${overallScore}/10 | Startup Idea Advisor`
    : "Idea Validation Results | Startup Idea Advisor";

  const dynamicDescription = validation
    ? `${scoreDescription} Review detailed analysis across 10 parameters: market opportunity, problem-solution fit, competitive landscape, target audience clarity, business model viability, technical feasibility, financial sustainability, scalability potential, risk assessment, and go-to-market strategy. Get actionable recommendations to strengthen your startup concept.`
    : "Review your startup idea validation results with comprehensive analysis across 10 key parameters and actionable recommendations to improve your startup concept.";

  const handleDownloadPDF = async () => {
    await generatePDF({
      validation,
      overallScore,
      scores,
      parameterGroups,
      parameterLookup,
      recommendations,
      nextSteps,
      categoryAnswers: effectiveCategoryAnswers || categoryAnswers,
      ideaExplanation,
      userName: user?.name || user?.email?.split("@")[0] || "User",
      userEmail: user?.email || "",
      finalConclusion,
    });
  };

  return (
    <React.Fragment>
      <Seo
        title={dynamicTitle}
        description={dynamicDescription}
        keywords="startup validation results, idea validation score, startup idea analysis, business validation report, startup feasibility report, idea evaluation results, startup assessment, business idea score, validation feedback, startup recommendations"
        path="/validate-result"
      />
      <div className="mx-auto max-w-6xl py-6">
        <ValidationHeader
          isAuthenticated={isAuthenticated}
          currentValidation={currentValidation}
          ideaExplanation={ideaExplanation}
          categoryAnswers={categoryAnswers}
          downloadButtonRef={downloadButtonRef}
          downloadingPDF={downloadingPDF}
          onDownloadPDF={handleDownloadPDF}
          parameterGroups={parameterGroups}
          validation={validation}
          overallScore={overallScore}
          scores={scores}
          recommendations={recommendations}
          nextSteps={nextSteps}
          user={user}
          finalConclusion={finalConclusion}
        />

        <ValidationTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          recommendations={recommendations}
          finalConclusion={finalConclusion}
        />

        {/* Tab Content: Your Input */}
        {activeTab === "input" && <InputTab categoryAnswers={categoryAnswers} ideaExplanation={ideaExplanation} />}

        {/* Tab Content: Validation Results */}
        {activeTab === "results" && (
          <ResultsTab
            overallScore={overallScore}
            showCelebration={showCelebration}
            previousScore={previousScore}
            overallStatus={overallStatus}
            radarData={radarData}
            parameterGroups={parameterGroups}
            parameterLookup={parameterLookup}
            viewFilter={viewFilter}
            setViewFilter={setViewFilter}
            sortOption={sortOption}
            setSortOption={setSortOption}
            setActiveTab={setActiveTab}
            downloadButtonRef={downloadButtonRef}
          />
        )}

        {/* Tab Content: Detailed Analysis & Recommendations */}
        {activeTab === "analysis" && <AnalysisTab parameterLookup={parameterLookup} recommendations={recommendations} />}

        {/* Tab Content: Final Validation Conclusion & Decision */}
        {activeTab === "conclusion" && <ConclusionTab finalConclusion={finalConclusion} />}

        {/* Tab Content: Next Steps */}
        {activeTab === "nextsteps" && (
          <NextStepsTab
            overallScore={overallScore}
            isFree={isFree}
            isStarter={isStarter}
            subscription={subscription}
            nextSteps={nextSteps}
            validation={validation}
            currentValidation={currentValidation}
            scores={scores}
            categoryAnswers={categoryAnswers}
            ideaExplanation={ideaExplanation}
            setInputs={setInputs}
          />
        )}
      </div>
    </React.Fragment>
  );
}
