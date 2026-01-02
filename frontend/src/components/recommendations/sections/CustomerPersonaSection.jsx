import ReactMarkdown from "react-markdown";
import { cleanNarrativeMarkdown } from "../../../utils/formatters/recommendationFormatters.js";

/**
 * Customer Persona Section Component
 */
export default function CustomerPersonaSection({ personaMarkdown, validationQuestions, content, isEnriching }) {
  return (
    <div className="space-y-6">
      {personaMarkdown && (
        <div className="mt-6 pb-6 border-b border-default border-default">
          <h3 className="text-lg font-semibold text-primary text-primary mb-2 border-l-4 border-default border-default pl-3">Customer Persona</h3>
          <p className="text-sm text-primary text-primary mb-3">
            A detailed profile of your ideal customer—their demographics, pain points, goals, and buying behavior.
          </p>
          <div className="ui-card2 ui-pad-md rounded-xl shadow-card">
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => (
                  <p className="text-primary leading-relaxed mb-3" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-primary" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-outside space-y-2 text-primary mb-3 ml-5" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="leading-relaxed" {...props} />
                ),
              }}
            >
              {cleanNarrativeMarkdown(personaMarkdown)}
            </ReactMarkdown>
          </div>
        </div>
      )}
      {validationQuestions.length > 0 && (
        <div className="mt-0">
          <h3 className="text-lg font-semibold text-primary text-primary mb-2 border-l-4 border-default border-default pl-3">Validation Questions</h3>
          <p className="text-sm text-primary text-primary mb-3">
            Ask these during discovery interviews, quick surveys, or pilot onboarding to confirm demand, willingness to pay, and whether the idea solves the right pain.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {validationQuestions.map(({ question, listenFor, actOn }, index) => (
              <div
                key={index}
                className="ui-card2 ui-pad-md rounded-xl shadow-card text-sm"
              >
                <p className="font-semibold text-primary">Question {index + 1}</p>
                <p className="mt-2 text-sm text-primary">{question}</p>
                <p className="mt-3 text-xs text-primary">
                  <strong>What to listen for:</strong> {listenFor}
                </p>
                <p className="mt-2 text-xs text-primary">
                  <strong>Act on it:</strong> {actOn}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {!personaMarkdown && validationQuestions.length === 0 && (
        <p className="text-sm text-primary text-primary italic">No customer persona information available yet.</p>
      )}
    </div>
  );
}
