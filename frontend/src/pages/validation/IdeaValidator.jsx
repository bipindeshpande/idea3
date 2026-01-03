import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useValidation } from "../../context/ValidationContext.jsx";
import { useReports } from "../../context/ReportsContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { validationQuestions } from "../../config/validationQuestions.js";
import ValidationLoadingIndicator from "../../components/validation/ValidationLoadingIndicator.jsx";
import FocusLayout from "../../layouts/FocusLayout.jsx";
import { useValidationData } from "../../hooks/validation/useValidationData.js";
import { useValidationEditMode } from "../../hooks/validation/useValidationEditMode.js";
import { useValidationForm } from "../../hooks/validation/useValidationForm.js";
import ValidationHero from "./components/ValidationHero.jsx";
import Screen1 from "./components/Screen1.jsx";
import Screen2 from "./components/Screen2.jsx";
import Screen3 from "./components/Screen3.jsx";
import { getAutoFillData } from "./utils/autoFillData.js";

const SCREEN1_QUESTIONS = validationQuestions.screen1_questions || validationQuestions.category_questions || [];
const SCREEN2_QUESTIONS = validationQuestions.screen2_questions || validationQuestions.idea_explanation_questions || [];
const OPTIONAL_FIELDS = validationQuestions.optional_fields || [];

export default function IdeaValidator() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { validateIdea, loading, error, setError, setCategoryAnswers, setIdeaExplanation } = useValidation();
  const { inputs } = useReports();
  const { getAuthHeaders, isAuthenticated } = useAuth();

  const [step, setStep] = useState(0);

  const isRevalidate = searchParams.get("revalidate") === "true";
  const editValidationIdRaw = searchParams.get("edit");
  // Strip "val_" prefix if present - backend and API return validation_id without prefix
  const editValidationId = editValidationIdRaw ? editValidationIdRaw.replace(/^val_/, "") : null;
  const [isEditMode, setIsEditMode] = useState(!!editValidationId);

  // Load user data and activity data
  const { userIntake, loadingIntake, isFirstValidation, activityData, setActivityData } = useValidationData({
    isAuthenticated,
    getAuthHeaders,
    inputs,
  });

  // Form state and handlers
  const formState = useValidationForm({
    setCategoryAnswers,
    setIdeaExplanation,
    validateIdea,
    navigate,
    editValidationId,
    isRevalidate,
  });

  // Load validation data when in edit mode
  const { loadingValidationData } = useValidationEditMode({
    editValidationId,
    isAuthenticated,
    getAuthHeaders,
    setCategoryAnswers,
    setIdeaExplanation,
    setError,
    activityData,
    setActivityData,
    setScreen1Answers: formState.setScreen1Answers,
    setScreen2Answers: formState.setScreen2Answers,
    setStructuredDescription: formState.setStructuredDescription,
    setOptionalAnswers: formState.setOptionalAnswers,
  });

  // Update edit mode state when editValidationId changes
  useEffect(() => {
    setIsEditMode(!!editValidationId);
  }, [editValidationId]);

  const handleNext = () => {
    if (step === 0) {
      // Validate Screen 1 (4 required dropdowns)
      const allAnswered = SCREEN1_QUESTIONS.every((q) => formState.screen1Answers[q.id]);
      if (!allAnswered) {
        setError("Please answer all questions before continuing.");
        return;
      }
      setError("");
      setStep(1);
    } else if (step === 1) {
      // Validate Screen 2 (5 required dropdowns)
      const allAnswered = SCREEN2_QUESTIONS.every((q) => formState.screen2Answers[q.id]);
      if (!allAnswered) {
        setError("Please answer all questions before continuing.");
        return;
      }
      setError("");
      setStep(2);
    } else if (step === 2) {
      // Validate Screen 3 (structured description required)
      if (!formState.structuredDescription.trim()) {
        setError("Please provide a structured description of your idea.");
        return;
      }
      setError("");
      formState.handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setError("");
    } else {
      navigate("/");
    }
  };

  // Dev-only auto-fill handler
  const handleAutoFill = () => {
    const autoFillData = getAutoFillData();

    // Fill all fields
    formState.setScreen1Answers(autoFillData.screen1);
    formState.setScreen2Answers(autoFillData.screen2);
    formState.setStructuredDescription(autoFillData.structuredDescription);
    formState.setOptionalAnswers(autoFillData.optional);
    setError(""); // Clear any errors

    // Scroll to form after auto-fill
    setTimeout(() => {
      const formElement = document.getElementById("validation-form");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <FocusLayout
      steps={[
        { label: "About your idea" },
        { label: "How it works" },
        { label: "Tell us more" },
      ]}
      currentStep={step}
    >
      <Seo
        title="Validate Your Startup Idea | Free AI-Powered Validation Tool | Startup Idea Advisor"
        description="Validate your startup idea with our free AI-powered tool. Get comprehensive analysis across 10 key parameters."
        keywords="startup idea validation, validate startup idea, business idea validation"
        path="/validate-idea"
      />

      {loading && <ValidationLoadingIndicator />}

      {/* Hero Section - Only show on first step and not in edit mode */}
      {step === 0 && !isEditMode && <ValidationHero onAutoFill={handleAutoFill} />}

      <section>
        {loadingValidationData && (
          <div className="ui-card mb-6 rounded-[16px] p-6 text-center shadow-card bg-surface-muted">
            <p className="text-base font-semibold text-primary">Loading validation data...</p>
          </div>
        )}

        {isEditMode && editValidationId && !loadingValidationData && (
          <div className="ui-card mb-6 rounded-[16px] p-4 shadow-card">
            <p className="text-base font-semibold text-accent">Editing validation: {editValidationId}</p>
          </div>
        )}

        {error && !loading && (
          <div className="badge-danger mb-6 rounded-[16px] p-4">
            <p className="text-base font-semibold">{error}</p>
          </div>
        )}

        {/* SCREEN 1: About Your Idea */}
        {step === 0 && (
          <Screen1
            questions={SCREEN1_QUESTIONS}
            answers={formState.screen1Answers}
            onAnswerChange={formState.handleScreen1Answer}
            error={error}
            loading={loading}
            onBack={handleBack}
            onNext={handleNext}
            onAutoFill={handleAutoFill}
          />
        )}

        {/* SCREEN 2: How Your Idea Works */}
        {step === 1 && (
          <Screen2
            questions={SCREEN2_QUESTIONS}
            answers={formState.screen2Answers}
            onAnswerChange={formState.handleScreen2Answer}
            error={error}
            loading={loading}
            onBack={handleBack}
            onNext={handleNext}
            onAutoFill={handleAutoFill}
          />
        )}

        {/* SCREEN 3: Tell Us More */}
        {step === 2 && (
          <Screen3
            structuredDescription={formState.structuredDescription}
            onStructuredDescriptionChange={formState.setStructuredDescription}
            optionalFields={OPTIONAL_FIELDS}
            optionalAnswers={formState.optionalAnswers}
            onOptionalAnswerChange={formState.handleOptionalAnswer}
            onConstraintToggle={formState.handleConstraintToggle}
            error={error}
            loading={loading}
            onBack={handleBack}
            onNext={handleNext}
            onAutoFill={handleAutoFill}
          />
        )}
      </section>
    </FocusLayout>
  );
}
