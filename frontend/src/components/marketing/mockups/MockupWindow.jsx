/**
 * MockupWindow - Reusable window mockup component with glass-card styling
 */
export default function MockupWindow({ 
  children, 
  className = "",
  title = "Application",
  showTitleBar = true,
  caption, // V6: Caption under mockup
  zIndex = 1, // V6: For layered stack effect
  offset = 0, // V6: Offset for layered stack
}) {
  return (
    <div 
      className={`mockup-window glass-card card-3d mkt-soft-glow ${className}`}
      style={{
        position: "relative",
        zIndex: zIndex,
        transform: `translateY(${offset}px)`,
        boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        filter: "drop-shadow(4px 8px 16px rgba(0, 0, 0, 0.1))"
      }}
    >
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
      <div className="p-4">
        {children || (
          <div 
            className="w-full h-48 rounded-lg"
            style={{ 
              background: "linear-gradient(135deg, #e5e7eb, #d1d5db)",
              border: "1px solid var(--mkt-outline)"
            }}
          />
        )}
      </div>
      {/* V6: Caption under mockup */}
      {caption && (
        <p className="text-xs text-center mt-3 px-2 opacity-60" style={{ color: "var(--mkt-text-dim)" }}>
          {caption}
        </p>
      )}
    </div>
  );
}

