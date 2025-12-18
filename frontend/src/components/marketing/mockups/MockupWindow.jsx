/**
 * MockupWindow - Reusable window mockup component with glass-card styling
 */
export default function MockupWindow({ 
  children, 
  className = "",
  title = "Application",
  showTitleBar = true 
}) {
  return (
    <div className={`mockup-window glass-card card-3d ${className}`}>
      {showTitleBar && (
        <div 
          className="flex items-center gap-2 px-4 py-3 border-b"
          style={{ 
            borderColor: "var(--mkt-outline)",
            background: "var(--mkt-surface-muted)"
          }}
        >
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#10b981" }} />
          </div>
          <div 
            className="flex-1 text-center text-xs font-medium"
            style={{ color: "var(--mkt-text-dim)" }}
          >
            {title}
          </div>
        </div>
      )}
      <div className="p-6">
        {children || (
          <div 
            className="w-full h-64 rounded-lg"
            style={{ 
              background: "linear-gradient(135deg, #e5e7eb, #d1d5db)",
              border: "1px solid var(--mkt-outline)"
            }}
          />
        )}
      </div>
    </div>
  );
}

