import { SCORE_LEGEND } from "../../pages/validation/constants.js";

const getColorStyle = (colorClass) => {
 const colorMap = {
  "bg-coral-500": "#f97316", // coral/orange-red
  "bg-amber-500": "#f59e0b", // amber/orange
  "bg-emerald-500": "#10b981", // emerald/green
  "bg-emerald-600": "#059669", // emerald dark green
 };
 return { backgroundColor: colorMap[colorClass] || "#94a3b8" };
};

export default function ScoreLegend() {
 return (
 <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
 <h3 className="text-sm text-secondary uppercase tracking-wide mb-3">Score Legend</h3>
 <div className="space-y-2.5">
 {SCORE_LEGEND.map((item) => (
 <div key={item.range} className="flex items-center gap-2.5 min-w-0">
 <span 
  className="h-3 w-3 rounded-full flex-shrink-0" 
  style={getColorStyle(item.color)}
 />
 <p className="text-sm text-secondary leading-tight whitespace-nowrap overflow-visible">
 <span className="font-semibold text-primary">{item.range}</span> — {item.label}
 </p>
 </div>
 ))}
 </div>
 </div>
 );
}

