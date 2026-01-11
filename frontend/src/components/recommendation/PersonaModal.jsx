import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { cleanNarrativeMarkdown } from "../../utils/formatters/recommendationFormatters.js";

/**
 * PersonaModal - Full-screen modal for detailed customer persona information
 */
export default function PersonaModal({ isOpen, onClose, personaMarkdown }) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-background rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-divider">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
              👥 Customer Persona Details
            </h2>
            <button
              onClick={onClose}
              className="text-secondary hover:text-primary transition-colors p-2 hover:bg-surface rounded-lg"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {personaMarkdown ? (
              <div className="prose prose-slate max-w-none text-primary">
                <ReactMarkdown
                  components={{
                    p: ({ node, ...props }) => (
                      <p className="text-primary leading-relaxed mb-4" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-semibold text-primary" {...props} />
                    ),
                    h1: ({ node, ...props }) => (
                      <h1 className="text-2xl font-bold text-primary mt-6 mb-4" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="text-xl font-semibold text-primary mt-5 mb-3" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="text-lg font-semibold text-primary mt-4 mb-2" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc list-outside space-y-2 text-primary mb-4 ml-5" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal list-outside space-y-2 text-primary mb-4 ml-5" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="leading-relaxed" {...props} />
                    ),
                  }}
                >
                  {cleanNarrativeMarkdown(personaMarkdown)}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-secondary">No detailed persona information available yet.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-divider bg-surface">
            <p className="text-sm text-secondary">
              💡 Use these insights to tailor your solution and marketing
            </p>
            <button
              onClick={onClose}
              className="ui-btn ui-btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

