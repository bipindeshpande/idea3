import UIHeading from "../../../components/ui/ui-heading.jsx";

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
  error,
  loading,
  onBack,
  onNext,
  onAutoFill,
}) {
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
            return (
              <div key={field.id}>
                <label htmlFor={field.id} className="mb-2 block text-base font-semibold text-primary">
                  {field.question}
                </label>
                <select
                  id={field.id}
                  value={optionalAnswers[field.id] || ""}
                  onChange={(e) => onOptionalAnswerChange(field.id, e.target.value)}
                  className="ui-select focus-visible:outline-accent"
                >
                  <option value="">Select an option...</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
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
          className={`rounded-xl border border-default bg-surface px-6 py-3 text-base font-semibold text-primary text-secondary shadow-sm transition-all duration-200 hover:bg-surface hover:bg-surface hover:-translate-y-0.5 whitespace-nowrap ${loading ? "cursor-not-allowed opacity-50" : ""}`}
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

