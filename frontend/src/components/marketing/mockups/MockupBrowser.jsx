import MockupWindow from "./MockupWindow.jsx";

/**
 * MockupBrowser - Browser-style mockup with address bar
 */
export default function MockupBrowser({ 
  children, 
  className = "",
  url = "https://app.example.com",
  caption, // V6: Caption under mockup
  zIndex = 1, // V6: For layered stack effect
  offset = 0, // V6: Offset for layered stack
}) {
  return (
    <div 
      className={`mockup-device card-floating card-3d mkt-soft-glow ${className}`} 
      style={{ 
        position: "relative",
        zIndex: zIndex,
        transform: `translateY(${offset}px)`,
        boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        filter: "drop-shadow(4px 8px 16px rgba(0, 0, 0, 0.1))"
      }}
    >
      {/* V6: Enhanced glowing accent line behind top layer */}
      <div 
        className="absolute -top-2 left-0 right-0 h-1 rounded-full"
        style={{
          background: "linear-gradient(to right, var(--mkt-hero-start), var(--mkt-hero-end))",
          filter: "blur(8px)",
          opacity: 0.6
        }}
      />
      <MockupWindow title="" showTitleBar={false}>
        <div className="space-y-4">
          {/* Browser address bar - V5: Glass surface */}
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-lg glass-surface"
            style={{ 
              border: "1px solid var(--mkt-glass-border)"
            }}
          >
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#10b981" }} />
            </div>
            <div 
              className="flex-1 px-3 py-1 rounded text-xs"
              style={{ 
                background: "var(--mkt-surface)",
                color: "var(--mkt-text-dim)",
                border: "1px solid var(--mkt-outline)"
              }}
            >
              {url}
            </div>
          </div>
          
          {/* Browser content */}
          {children || (
            <div 
              className="w-full h-56 rounded-lg"
              style={{ 
                background: "linear-gradient(135deg, #e5e7eb, #d1d5db)",
                border: "1px solid var(--mkt-outline)"
              }}
            />
          )}
        </div>
      </MockupWindow>
      {/* V6: Caption under mockup */}
      {caption && (
        <p className="text-xs text-center mt-3 px-2 opacity-60" style={{ color: "var(--mkt-text-dim)" }}>
          {caption}
        </p>
      )}
    </div>
  );
}

