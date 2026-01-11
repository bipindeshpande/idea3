import ReactMarkdown from "react-markdown";
import LearnMore from "../../common/LearnMore.jsx";

/**
 * Validation Questions Section Component
 */
export default function ValidationQuestionsSection({ validationQuestions, content, isEnriching }) {
  if (validationQuestions && validationQuestions.length > 0) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {validationQuestions.map(({ question, listenFor, actOn }, index) => (
            <div
              key={index}
              className="ui-card2 ui-pad-md rounded-xl shadow-card text-sm"
            >
              <p className="font-semibold text-primary">Question {index + 1}</p>
              <p className="mt-2 text-sm text-primary text-primary">{question}</p>
              <p className="mt-3 text-xs text-primary text-primary">
                <strong>What to listen for:</strong> {listenFor}
              </p>
              <p className="mt-2 text-xs text-primary text-primary">
                <strong>Act on it:</strong> {actOn}
              </p>
            </div>
          ))}
        </div>

        {/* Learn More Section */}
        <LearnMore
          title="How to Validate Startup Ideas"
          summary="These questions are tailored for your specific idea. Learn the complete validation framework and methodology that applies to any startup."
          linkTo="/resources/validation-methodology"
          linkText="Read full validation guide →"
        />
      </div>
    );
  }

  return content?.trim() ? (
    <div className="prose prose-slate max-w-none text-primary text-primary">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  ) : (
    <p className="text-sm text-primary text-primary italic">No validation questions available yet.</p>
  );
}
