import { useState, useEffect } from "react";

export default function OnboardingTooltip({ 
 id, 
 message, 
 position = "bottom",
 show = false,
 onDismiss 
}) {
 const [isVisible, setIsVisible] = useState(show);

 useEffect(() => {
 setIsVisible(show);
 }, [show]);

 if (!isVisible) return null;

 const positionClasses = {
 top: "bottom-full mb-2",
 bottom: "top-full mt-2",
 left: "right-full mr-2",
 right: "left-full ml-2",
 };

 return (
 <div 
 className={`absolute z-50 ${positionClasses[position]} w-64 rounded-lg border border-default bg-surface p-3 shadow-xl`}
 style={{ pointerEvents: 'auto' }}
 >
 <div className="text-sm text-primary text-secondary">
 {message}
 </div>
 <button
 onClick={() => {
 setIsVisible(false);
 if (onDismiss) onDismiss(id);
 }}
 className="mt-2 text-xs font-semibold text-accent hover:text-accent"
 >
 Got it ✓
 </button>
 </div>
 );
}

