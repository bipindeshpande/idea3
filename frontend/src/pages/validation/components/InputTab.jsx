import { validationQuestions } from "../../../config/validationQuestions.js";
import UIHeading from "../../../components/ui/ui-heading.jsx";

export default function InputTab({ categoryAnswers, ideaExplanation }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-secondary mb-6">These are the inputs you provided during validation.</p>
      
      {/* Category Questions */}
      {validationQuestions.category_questions && validationQuestions.category_questions.length > 0 && (
        <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
          <UIHeading level="h2" className="text-primary flex items-center gap-2 mb-6">Category Information</UIHeading>
          <div className="space-y-2">
            {validationQuestions.category_questions.map((question) => {
              const answer = categoryAnswers[question.id];
              if (!answer) return null;
              return (
                <div key={question.id} className="rounded-xl border border-default shadow-sm bg-surface p-1.5 md:p-2">
                  <h3 className="mb-1 text-sm font-medium text-primary">{question.question}</h3>
                  <p className="text-secondary leading-snug text-sm">{answer}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Idea Explanation Questions */}
      {validationQuestions.idea_explanation_questions && validationQuestions.idea_explanation_questions.length > 0 && (
        <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
          <UIHeading level="h2" className="text-primary flex items-center gap-2 mb-6">Idea Details</UIHeading>
          <div className="space-y-2">
            {validationQuestions.idea_explanation_questions.map((question) => {
              const answer = categoryAnswers[question.id];
              if (!answer) return null;
              return (
                <div key={question.id} className="rounded-xl border border-default shadow-sm bg-surface p-1.5 md:p-2">
                  <h3 className="mb-1 text-sm font-medium text-primary">{question.question}</h3>
                  <p className="text-secondary leading-snug text-sm">{answer}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Optional Fields */}
      {validationQuestions.optional_fields && validationQuestions.optional_fields.length > 0 && (
        <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
          <UIHeading level="h2" className="text-primary flex items-center gap-2 mb-6">Additional Information</UIHeading>
          <div className="space-y-2">
            {validationQuestions.optional_fields.map((question) => {
              const answer = categoryAnswers[question.id];
              if (!answer) return null;
              const displayAnswer = Array.isArray(answer) ? answer.join(", ") : answer;
              return (
                <div key={question.id} className="rounded-xl border border-default shadow-sm bg-surface p-1.5 md:p-2">
                  <h3 className="mb-1 text-sm font-medium text-primary">{question.question}</h3>
                  <p className="text-secondary leading-snug text-sm">{displayAnswer}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Idea Explanation */}
      {ideaExplanation && (
        <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
          <UIHeading level="h2" className="text-primary flex items-center gap-2 mb-3">Detailed Idea Explanation</UIHeading>
          <div className="rounded-xl border border-default shadow-sm bg-surface p-1.5 md:p-2">
            <p className="whitespace-pre-wrap text-secondary leading-snug text-sm">{ideaExplanation}</p>
          </div>
        </div>
      )}

      {/* Fallback: Show raw category answers if questions not available */}
      {(!validationQuestions.category_questions || validationQuestions.category_questions.length === 0) &&
        Object.keys(categoryAnswers).length > 0 && (
          <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
            <UIHeading level="h2" className="text-primary flex items-center gap-2 mb-3">Your Idea Summary</UIHeading>
            <div className="space-y-2 text-sm text-secondary">
              {Object.entries(categoryAnswers).map(([key, value]) => (
                <div key={key} className="leading-snug">
                  <span className="font-medium text-primary">
                    {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}:
                  </span>{" "}
                  <span className="text-secondary">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}

