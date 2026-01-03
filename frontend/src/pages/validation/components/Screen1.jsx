import UIHeading from "../../../components/ui/ui-heading.jsx";

/**
 * Screen 1: About Your Idea
 * Displays the form for collecting basic idea information (4 dropdowns)
 */
export default function Screen1({
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
    <div id="validation-form" className="ui-card rounded-[16px] p-6 shadow-card">
      <header className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-secondary">Step 1 of 3</p>
            <UIHeading level="h1" className="mt-2 text-primary">
              About your idea
            </UIHeading>
            <p className="mt-2 text-base text-secondary">Set context and market boundaries.</p>
          </div>
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
      </header>

      <div className="space-y-6">
        {questions.map((question) => (
          <div key={question.id} className="relative">
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
        <div className="badge-danger mt-6 rounded-xl p-4 text-base font-semibold">{error}</div>
      )}

      <footer className="mt-8 flex items-center justify-between border-t border-default pt-6">
        <button type="button" className="ui-btn ui-btn-secondary focus-visible:outline-accent" disabled>
          Save Draft
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="ui-btn ui-btn-secondary focus-visible:outline-accent disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={loading}
            className="ui-btn ui-btn-primary focus-visible:outline-accent disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </footer>
    </div>
  );
}

