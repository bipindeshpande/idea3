import ReactMarkdown from "react-markdown";
import { extractTimelineSlice } from "../../../utils/formatters/recommendationFormatters.js";

/**
 * Timeline & Effort Section Component
 */
export default function TimelineEffortSection({ roadmapMarkdown, content, isEnriching }) {
  if (roadmapMarkdown) {
    const hasBullets = /^[-*]\s+/m.test(roadmapMarkdown);
    if (hasBullets) {
      return (
        <div className="prose prose-slate max-w-none text-primary text-primary">
          <ReactMarkdown>{roadmapMarkdown}</ReactMarkdown>
        </div>
      );
    }
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {["0-30 Days", "30-60 Days", "60-90 Days"].map((window, index) => {
          const segmentContent = extractTimelineSlice(roadmapMarkdown, index);
          return (
            <div key={window} className="ui-card2 ui-pad-md ui-radius-card shadow-card">
              <p className="text-xs uppercase tracking-wide text-primary">{window}</p>
              <div className="mt-2 text-sm text-primary">
                <ReactMarkdown>{segmentContent}</ReactMarkdown>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return content?.trim() ? (
    <div className="prose prose-slate max-w-none text-primary text-primary">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  ) : (
    <p className="text-sm text-primary text-primary italic">No timeline information available yet.</p>
  );
}
