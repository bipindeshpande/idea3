/**
 * Cache Indicator Component
 * Shows when a response was served from cache (development only)
 */

export default function CacheIndicator({ isCached, className = "" }) {
  // Only show in development
  if (process.env.NODE_ENV !== 'development' || !isCached) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 px-4 py-2 bg-yellow-100 border-2 border-yellow-400 rounded-lg shadow-lg ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <svg
          className="w-5 h-5 text-yellow-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-yellow-800">
            Cache Response
          </span>
          <span className="text-xs text-yellow-700">
            This result was served from cache
          </span>
        </div>
      </div>
    </div>
  );
}

