import { SCORE_LEGEND } from "../../pages/validation/constants.js";

export default function ScoreLegend() {
 return (
 <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
 <h3 className="text-sm text-secondary uppercase tracking-wide mb-3">Score Legend</h3>
 <div className="space-y-2">
 {SCORE_LEGEND.map((item) => (
 <div key={item.range} className="flex items-center gap-2">
 <span className={`h-2 w-2 rounded-full flex-shrink-0 ${item.color}`} />
 <p className="text-sm text-secondary leading-tight">
 <span className="font-semibold">{item.range}</span> — {item.label}
 </p>
 </div>
 ))}
 </div>
 </div>
 );
}

