/**
 * MockupMobile - Mobile device mockup with rounded corners and notch
 */
export default function MockupMobile({ 
  children, 
  className = "",
  showNotch = true 
}) {
  return (
    <div className={`mockup-device card-floating ${className}`}>
      <div 
        className="relative mx-auto"
        style={{
          width: "280px",
          maxWidth: "100%",
          background: "#1e293b",
          borderRadius: "32px",
          padding: "12px",
          boxShadow: "var(--mkt-layer-shadow)"
        }}
      >
        {/* Notch */}
        {showNotch && (
          <div 
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 rounded-b-2xl"
            style={{ background: "#1e293b" }}
          />
        )}
        
        {/* Screen */}
        <div 
          className="rounded-3xl overflow-hidden"
          style={{
            background: "var(--mkt-surface)",
            minHeight: "500px"
          }}
        >
          {children || (
            <div 
              className="w-full h-full"
              style={{ 
                background: "linear-gradient(135deg, #e5e7eb, #d1d5db)",
                minHeight: "500px"
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

