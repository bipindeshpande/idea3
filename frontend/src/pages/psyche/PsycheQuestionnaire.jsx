import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function PsycheQuestionnaire() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [optionalText, setOptionalText] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { getAuthHeaders, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const QUESTIONS_PER_STEP = 3;
  const totalSteps = Math.ceil(12 / QUESTIONS_PER_STEP);

  // Load questions on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/psyche/questionnaire");
      return;
    }

    const loadQuestions = async () => {
      try {
        const response = await fetch("/api/psyche/questions");
        const data = await response.json();
        if (data.success && data.questions) {
          setQuestions(data.questions);
        } else {
          setError("Failed to load questions");
        }
      } catch (err) {
        setError("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [isAuthenticated, navigate]);

  const handleAnswer = (questionId, answerId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
    setError("");
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // Validate all questions answered
    const unanswered = questions.filter((q) => !answers[q.question_id]);
    if (unanswered.length > 0) {
      setError(`Please answer all questions. ${unanswered.length} remaining.`);
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/psyche/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          answers,
          optional_text: optionalText || null,
        }),
      });

      if (!response.ok) {
        // Handle HTTP errors
        let errorMessage = "Failed to save profile";
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        setError(errorMessage);
        setSubmitting(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Redirect to simple confirmation screen
        navigate("/psyche/complete");
      } else {
        setError(data.message || "Failed to save profile");
      }
    } catch (err) {
      console.error("Error submitting questionnaire:", err);
      setError(err.message || "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrentQuestions = () => {
    const start = currentStep * QUESTIONS_PER_STEP;
    const end = Math.min(start + QUESTIONS_PER_STEP, questions.length);
    return questions.slice(start, end);
  };

  const getProgress = () => {
    const answered = Object.keys(answers).length;
    return {
      current: answered,
      total: questions.length,
      percentage: questions.length > 0 ? (answered / questions.length) * 100 : 0,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading questionnaire...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {error || "No questions available"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const progress = getProgress();
  const currentQuestions = getCurrentQuestions();
  const isLastStep = currentStep === totalSteps - 1;
  const canProceed = currentQuestions.every((q) => answers[q.question_id]);

  return (
    <>
      <Seo
        title="Decision & Work Style Assessment"
        description="Complete a short assessment to personalize your startup recommendations"
      />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
              Decision & Work Style Assessment
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Answer 12 questions to help personalize your startup recommendations (takes about 3–4 minutes)
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {progress.current} / {progress.total} answered
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-brand-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Questions Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {currentQuestions.map((question) => (
              <div
                key={question.question_id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                  {question.text}
                </h3>
                <div className="space-y-3">
                  {question.options.map((option) => {
                    const isSelected = answers[question.question_id] === option.id;
                    return (
                      <label
                        key={option.id}
                        className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name={question.question_id}
                          value={option.id}
                          checked={isSelected}
                          onChange={() => handleAnswer(question.question_id, option.id)}
                          className="mt-1 mr-3 h-4 w-4 text-brand-500 focus:ring-brand-500"
                        />
                        <span className="text-slate-700 dark:text-slate-300 flex-1">
                          {option.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Optional Text Field (only on last step) */}
            {isLastStep && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Additional context (optional)
                </label>
                <textarea
                  value={optionalText}
                  onChange={(e) => setOptionalText(e.target.value)}
                  placeholder="Share any additional context about your preferences, goals, or motivations..."
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-800 dark:text-slate-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  currentStep === 0
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                Previous
              </button>

              {!isLastStep ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed}
                  className={`px-6 py-3 rounded-lg font-medium transition ${
                    canProceed
                      ? "bg-brand-500 text-white hover:bg-brand-600"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canProceed || submitting}
                  className={`px-6 py-3 rounded-lg font-medium transition ${
                    canProceed && !submitting
                      ? "bg-brand-500 text-white hover:bg-brand-600"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {submitting ? "Saving..." : "Complete Questionnaire"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

