import { getScoreMeta, formatDetails } from "../../pages/validation/utils.js";

export default function ParameterCard({ parameter, score, details }) {
 const safeScore = typeof score === "number" ? score : 0;
 const meta = getScoreMeta(safeScore);
 const percentage = Math.max(0, Math.min(100, (safeScore / 10) * 100));
 const assessment = formatDetails(details);
 return (
 <div className="flex flex-col rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
 <div className="mb-4 flex items-start justify-between gap-3">
 <div>
 <p className="text-lg font-semibold text-primary">{parameter}</p>
 <p className="text-xs text-secondary">{meta.label}</p>
 </div>
 <div className={`rounded-full px-3 py-1 text-xs font-medium ${meta.badge}`}>
 {safeScore.toFixed(1)} / 10
 </div>
 </div>

 <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-app">
 <div
 className={`h-full ${meta.progress}`}
 style={{ width: `${percentage}%` }}
 />
 </div>

 <div className="min-h-0">
 <p className="text-primary text-primary leading-relaxed whitespace-pre-wrap break-words">
 {assessment}
 </p>
 </div>
 </div>
 );
}

