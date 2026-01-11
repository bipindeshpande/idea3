import { useState, useMemo, useEffect } from "react";
import UIHeading from "../../../components/ui/ui-heading.jsx";
import { getFilteredOptions } from "../../../utils/validation/conflictValidation.js";

/**
 * Screen 2: How Your Idea Works
 * Displays the form for collecting idea mechanics (5 dropdowns)
 */
export default function Screen2({
  questions,
  answers,
  onAnswerChange,
  screen1Answers, // For filtering based on Screen 1 selections
  error,
  loading,
  onBack,
  onNext,
  onAutoFill,
}) {
  // Track overrides for disabled options
  const [overrides, setOverrides] = useState(new Set());

  // Reset overrides when dependencies change
  // This prevents stale overrides when compatibility changes
  useEffect(() => {
    setOverrides(new Set());
  }, [screen1Answers?.industry, answers?.solution_type]);

  // Get filtered options for each question that needs filtering
  const filteredOptionsMap = useMemo(() => {
    const map = {};
    questions.forEach((question) => {
      if (["solution_type", "business_archetype"].includes(question.id)) {
        const currentAnswers = { ...screen1Answers, ...answers };
        map[question.id] = getFilteredOptions(
          question.id,
          question.options,
          currentAnswers
        );
      }
    });
    return map;
  }, [questions, screen1Answers, answers]);

  const handleOverrideToggle = (questionId, optionValue) => {
    const key = `${questionId}:${optionValue}`;
    setOverrides((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const isOptionEnabled = (questionId, optionValue) => {
    const filtered = filteredOptionsMap[questionId];
    if (!filtered) return true; // No filtering for this question

    const optionData = filtered.find((opt) => opt.value === optionValue);
    if (!optionData) return true;

    // If overridden, always enabled
    const overrideKey = `${questionId}:${optionValue}`;
    if (overrides.has(overrideKey)) return true;

    return optionData.enabled;
  };

  const getOptionReason = (questionId, optionValue) => {
    const filtered = filteredOptionsMap[questionId];
    if (!filtered) return null;

    const optionData = filtered.find((opt) => opt.value === optionValue);
    return optionData?.reason || null;
  };
  return (
    <div className="rounded-2xl border border-default bg-surface p-8 shadow-lg">
      <div className="flex items-center justify-between gap-4 mb-3">
        <UIHeading level="h1" className="text-primary">
          How Your Idea Works
        </UIHeading>
        {process.env.NODE_ENV === "development" && (
          <button
            type="button"
            onClick={onAutoFill}
            className="ui-btn ui-btn-secondary focus-visible:outline-accent whitespace-nowrap"
          >
            🔧 Auto-Fill (Dev)
          </button>
        )}
      </div>
      <p className="mb-4 text-base leading-relaxed text-primary">
        Capture mechanics, value proposition, monetization.
      </p>
      {screen1Answers?.industry && (
        <div className="mb-6 rounded-lg border border-default/50 bg-surface-muted/50 p-3 text-xs text-secondary">
          <span className="font-medium text-primary">💡 Tip:</span> Options are filtered based on your industry selection ("{screen1Answers.industry}"). 
          You can still select other options if they fit your idea—just check the acknowledgment when it appears.
        </div>
      )}

      <div className="space-y-6">
        {questions.map((question) => {
          const needsFiltering = ["solution_type", "business_archetype"].includes(question.id);
          const filteredOptions = needsFiltering ? filteredOptionsMap[question.id] : null;

          return (
            <div key={question.id}>
              <label htmlFor={question.id} className="mb-2 block text-base font-semibold text-primary">
                {question.question}
              </label>
              <select
                id={question.id}
                value={answers[question.id] || ""}
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  onAnswerChange(question.id, selectedValue);
                  
                  // Auto-enable override if user selects a disabled option
                  if (needsFiltering && filteredOptions) {
                    const selectedOption = filteredOptions.find(opt => opt.value === selectedValue);
                    if (selectedOption && !selectedOption.enabled) {
                      const overrideKey = `${question.id}:${selectedValue}`;
                      if (!overrides.has(overrideKey)) {
                        handleOverrideToggle(question.id, selectedValue);
                      }
                    }
                  }
                }}
                className="ui-select focus-visible:outline-accent"
              >
                <option value="">Select an option...</option>
                {question.options.map((option) => {
                  const enabled = isOptionEnabled(question.id, option);
                  const isSelected = answers[question.id] === option;
                  const overrideKey = `${question.id}:${option}`;
                  const isOverridden = overrides.has(overrideKey);
                  const reason = getOptionReason(question.id, option);

                  // Show visual indicator but allow selection
                  return (
                    <option
                      key={option}
                      value={option}
                      style={!enabled && !isSelected ? { 
                        color: '#999', 
                        fontStyle: 'italic'
                      } : {}}
                    >
                      {!enabled && !isSelected ? `${option} ⚠️ (not recommended)` : option}
                    </option>
                  );
                })}
              </select>
              
              {/* Show warning and override option if user selected a disabled option */}
              {needsFiltering && filteredOptions && answers[question.id] && (
                (() => {
                  const selectedOption = filteredOptions.find(opt => opt.value === answers[question.id]);
                  if (selectedOption && !selectedOption.enabled) {
                    const overrideKey = `${question.id}:${answers[question.id]}`;
                    const isOverridden = overrides.has(overrideKey);
                    
                    return (
                      <div className="mt-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm">
                        <div className="flex items-start gap-2">
                          <svg
                            className="w-5 h-5 text-warning flex-shrink-0 mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          <div className="flex-1">
                            <p className="font-medium text-primary mb-1">
                              ⚠️ Unusual combination detected
                            </p>
                            {selectedOption.reason && (
                              <p className="text-secondary text-xs mb-2">
                                {selectedOption.reason}
                              </p>
                            )}
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isOverridden}
                                onChange={() => handleOverrideToggle(question.id, answers[question.id])}
                                className="h-4 w-4 rounded border-default text-accent"
                              />
                              <span className="text-xs text-secondary">
                                I understand this is unusual. My description explains why this combination makes sense.
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="badge-danger mt-6 rounded-xl p-4 text-sm font-semibold">{error}</div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className={`rounded-xl border border-default bg-surface px-6 py-3 text-base font-semibold text-primary shadow-sm transition-all duration-200 hover:bg-surface hover:-translate-y-0.5 whitespace-nowrap ${loading ? "cursor-not-allowed opacity-50" : ""}`}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={loading}
          className={`ui-btn ui-btn-primary focus-visible:outline-accent ${loading ? "cursor-not-allowed opacity-50" : ""}`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

