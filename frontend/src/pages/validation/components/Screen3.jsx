import { useState, useMemo, useEffect } from "react";
import UIHeading from "../../../components/ui/ui-heading.jsx";
import { getFilteredOptions } from "../../../utils/validation/conflictValidation.js";

/**
 * Screen 3: Tell Us More
 * Displays the form for structured description and optional fields
 */
export default function Screen3({
  structuredDescription,
  onStructuredDescriptionChange,
  optionalFields,
  optionalAnswers,
  onOptionalAnswerChange,
  onConstraintToggle,
  screen1Answers,
  screen2Answers,
  error,
  loading,
  onBack,
  onNext,
  onAutoFill,
}) {
  // Track overrides for disabled options
  const [overrides, setOverrides] = useState(new Set());

  // Reset overrides when dependencies change (e.g., business archetype changes)
  // This prevents stale overrides when compatibility changes
  useEffect(() => {
    setOverrides(new Set());
  }, [screen2Answers?.business_archetype]);

  // Get filtered options for delivery_channel
  const deliveryChannelField = optionalFields.find(f => f.id === "delivery_channel");
  const filteredDeliveryChannels = useMemo(() => {
    if (!deliveryChannelField) return null;
    const currentAnswers = { ...screen1Answers, ...screen2Answers };
    return getFilteredOptions(
      "delivery_channel",
      deliveryChannelField.options,
      currentAnswers
    );
  }, [deliveryChannelField, screen1Answers, screen2Answers]);

  const handleOverrideToggle = (fieldId, optionValue) => {
    const key = `${fieldId}:${optionValue}`;
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

  const isOptionEnabled = (fieldId, optionValue) => {
    if (fieldId !== "delivery_channel" || !filteredDeliveryChannels) return true;

    const optionData = filteredDeliveryChannels.find((opt) => opt.value === optionValue);
    if (!optionData) return true;

    const overrideKey = `${fieldId}:${optionValue}`;
    if (overrides.has(overrideKey)) return true;

    return optionData.enabled;
  };

  const getOptionReason = (fieldId, optionValue) => {
    if (fieldId !== "delivery_channel" || !filteredDeliveryChannels) return null;

    const optionData = filteredDeliveryChannels.find((opt) => opt.value === optionValue);
    return optionData?.reason || null;
  };
  return (
    <div className="rounded-2xl border border-default bg-surface p-8 shadow-lg">
      <div className="flex items-center justify-between gap-4 mb-3">
        <UIHeading level="h1" className="text-primary">
          Tell Us More
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
      <p className="mb-8 text-base leading-relaxed text-primary">
        Capture the narrative + constraints that shape risk assessment.
      </p>

      <div className="space-y-6">
        {/* Structured Description (Required) */}
        <div className="relative">
          <label htmlFor="structuredDescription" className="mb-2 block text-base font-semibold text-primary">
            Describe your idea using the structure below:
          </label>
          <textarea
            id="structuredDescription"
            value={structuredDescription}
            onChange={(e) => onStructuredDescriptionChange(e.target.value)}
            rows={12}
            className="ui-textarea focus-visible:outline-accent resize-y"
            placeholder={`1. Problem: 
2. Solution:
3. User:
4. Differentiation:
5. Monetization:
6. Scope/Region:`}
          />
        </div>

        {/* Optional Fields */}
        {optionalFields.map((field) => {
          if (["initial_budget", "delivery_channel"].includes(field.id)) {
            const needsFiltering = field.id === "delivery_channel";
            const filteredOptions = needsFiltering ? filteredDeliveryChannels : null;

            return (
              <div key={field.id}>
                <label htmlFor={field.id} className="mb-2 block text-base font-semibold text-primary">
                  {field.question}
                </label>
                <select
                  id={field.id}
                  value={optionalAnswers[field.id] || ""}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    onOptionalAnswerChange(field.id, selectedValue);
                    
                    // Auto-enable override if user selects a disabled option
                    if (needsFiltering && filteredOptions) {
                      const selectedOption = filteredOptions.find(opt => opt.value === selectedValue);
                      if (selectedOption && !selectedOption.enabled) {
                        const overrideKey = `${field.id}:${selectedValue}`;
                        if (!overrides.has(overrideKey)) {
                          handleOverrideToggle(field.id, selectedValue);
                        }
                      }
                    }
                  }}
                  className="ui-select focus-visible:outline-accent"
                >
                  <option value="">Select an option...</option>
                  {field.options.map((option) => {
                    const enabled = isOptionEnabled(field.id, option);
                    const isSelected = optionalAnswers[field.id] === option;

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

                {/* Show warning if user selected a disabled delivery channel */}
                {needsFiltering && filteredOptions && optionalAnswers[field.id] && (
                  (() => {
                    const selectedOption = filteredOptions.find(opt => opt.value === optionalAnswers[field.id]);
                    if (selectedOption && !selectedOption.enabled) {
                      const overrideKey = `${field.id}:${optionalAnswers[field.id]}`;
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
                                  onChange={() => handleOverrideToggle(field.id, optionalAnswers[field.id])}
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
          } else if (field.id === "constraints" && field.multiSelect) {
            return (
              <div key={field.id}>
                <label className="mb-2 block text-base font-semibold text-primary">
                  {field.question}
                </label>
                <div className="space-y-2">
                  {field.options.map((option) => (
                    <label key={option} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={optionalAnswers.constraints.includes(option)}
                        onChange={() => onConstraintToggle(option)}
                        className="h-4 w-4 rounded border-default text-accent "
                      />
                      <span className="text-sm text-primary">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })}

        {/* Competitors (Optional Textbox) */}
        <div>
          <label htmlFor="competitors" className="mb-2 block text-base font-semibold text-primary">
            Any competitors you already know? (Optional)
          </label>
          <input
            type="text"
            id="competitors"
            value={optionalAnswers.competitors || ""}
            onChange={(e) => onOptionalAnswerChange("competitors", e.target.value)}
            placeholder="List websites, apps, or companies (optional)"
            className="ui-input focus-visible:outline-accent"
          />
        </div>
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
          className="ui-btn ui-btn-primary focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Validating..." : "Validate Idea →"}
        </button>
      </div>
    </div>
  );
}

