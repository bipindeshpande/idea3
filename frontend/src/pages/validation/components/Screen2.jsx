import UIHeading from "../../../components/ui/ui-heading.jsx";

/**
 * Screen 2: How Your Idea Works
 * Displays the form for collecting idea mechanics (5 dropdowns)
 */
export default function Screen2({
  questions,
  answers,
  onAnswerChange,
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
      <p className="mb-8 text-base leading-relaxed text-primary">
        Capture mechanics, value proposition, monetization.
      </p>

      <div className="space-y-6">
        {questions.map((question) => (
          <div key={question.id}>
            <label htmlFor={question.id} className="mb-2 block text-base font-semibold text-primary">
              {question.question}
            </label>
            <select
              id={question.id}
              value={answers[question.id] || ""}
              onChange={(e) => onAnswerChange(question.id, e.target.value)}
              className="ui-select focus-visible:outline-accent"
            >
              <option value="">Select an option...</option>
              {question.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
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

