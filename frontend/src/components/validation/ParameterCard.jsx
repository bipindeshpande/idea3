import { getScoreMeta, formatDetails } from "../../pages/validation/utils.js";
import { FALLBACK_DETAIL } from "../../pages/validation/constants.js";

export default function ParameterCard({ parameter, score, details }) {
 const safeScore = typeof score === "number" ? score : 0;
 const meta = getScoreMeta(safeScore);
 const percentage = Math.max(0, Math.min(100, (safeScore / 10) * 100));
 const assessment = formatDetails(details);
 
 // For Results tab: Show summary/preview (first 200 chars), full details in Analysis tab
 const MAX_PREVIEW_LENGTH = 200;
 const isFallback = !details || details === FALLBACK_DETAIL;
 const showFullText = isFallback;
 
 let displayText = assessment;
 if (!isFallback && assessment && assessment.length > MAX_PREVIEW_LENGTH) {
   // Truncate to nearest sentence or word boundary
   const truncated = assessment.substring(0, MAX_PREVIEW_LENGTH);
   const lastSentence = truncated.lastIndexOf('.');
   const lastSpace = truncated.lastIndexOf(' ');
   const cutPoint = lastSentence > MAX_PREVIEW_LENGTH * 0.7 ? lastSentence + 1 : lastSpace;
   displayText = truncated.substring(0, cutPoint) + '...';
 }
 
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
 <p className="text-primary leading-relaxed whitespace-pre-wrap break-words">
 {displayText}
 </p>
 {!isFallback && assessment && assessment.length > MAX_PREVIEW_LENGTH && (
   <p className="mt-2 text-xs text-secondary italic">
     See full analysis in the "Detailed Analysis & Recommendations" tab →
   </p>
 )}
 </div>
 </div>
 );
}

