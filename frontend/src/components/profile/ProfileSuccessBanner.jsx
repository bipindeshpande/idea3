import { useDarkMode } from "../../hooks/useDarkMode.js";

/**
 * Success banner component displayed when profile analysis is ready
 * Shows link to recommendations
 */
export function ProfileSuccessBanner({ runId }) {
  const isDark = useDarkMode();

  const bgColor = isDark ? "#0B3A37" : "rgba(236, 253, 245, 0.8)";
  const borderColor = isDark ? "#1ABC9C" : "#10b981";
  const textColor = isDark ? "#1ABC9C" : "#065f46";
  const textColorLight = isDark ? "#4FD1B5" : "#047857";
  const linkHoverColor = isDark ? "#5FE5C8" : "#059669";

  return (
    <div 
      className="mb-6 rounded-xl border p-4 shadow-sm"
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">✨</span>
        <div>
          <p 
            className="font-semibold text-base mb-1"
            style={{ color: textColor }}
          >
            Your personalized reports are ready!
          </p>
          <p 
            className="text-xs"
            style={{ color: textColorLight }}
          >
            View your <a 
              href={`/dashboard/recommendations${runId ? `?id=${runId}` : ''}`}
              className="underline font-medium transition-colors"
              style={{ 
                color: textColor,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = linkHoverColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = textColor;
              }}
            >
              startup recommendations
            </a> and detailed analysis reports.
          </p>
        </div>
      </div>
    </div>
  );
}
