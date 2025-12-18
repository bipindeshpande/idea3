import MockupWindow from "./MockupWindow.jsx";

/**
 * MockupStack - Stacked mockup windows with offset positioning
 */
export default function MockupStack({ 
  items = [],
  className = "",
  maxItems = 3 
}) {
  const displayItems = items.slice(0, maxItems);
  
  if (displayItems.length === 0) {
    // Default placeholder items
    displayItems.push(
      { title: "Dashboard", content: null },
      { title: "Analytics", content: null },
      { title: "Settings", content: null }
    );
  }
  
  return (
    <div className={`relative ${className}`} style={{ minHeight: "400px" }}>
      {displayItems.map((item, index) => (
        <div
          key={index}
          className="absolute"
          style={{
            top: `${index * 40}px`,
            left: `${index * 40}px`,
            right: `${(displayItems.length - 1 - index) * 40}px`,
            zIndex: displayItems.length - index,
            transform: `rotate(${index * -2}deg)`,
            transition: "transform 0.3s ease"
          }}
        >
          <MockupWindow 
            title={item.title || `Window ${index + 1}`}
            className="w-full"
          >
            {item.content || (
              <div 
                className="w-full h-64 rounded-lg"
                style={{ 
                  background: "linear-gradient(135deg, #e5e7eb, #d1d5db)",
                  border: "1px solid var(--mkt-outline)"
                }}
              />
            )}
          </MockupWindow>
        </div>
      ))}
    </div>
  );
}

