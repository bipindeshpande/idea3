import { getScoreMeta, formatDetails } from "../../pages/validation/utils.js";

export default function ParameterCard({ parameter, score, details }) {
  const safeScore = typeof score === "number" ? score : 0;
  const meta = getScoreMeta(safeScore);
  const percentage = Math.max(0, Math.min(100, (safeScore / 10) * 100));
  const assessment = formatDetails(details);
  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 shadow-sm bg-white p-6 md:p-7">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-gray-900">{parameter}</p>
          <p className="text-xs text-gray-500">{meta.label}</p>
        </div>
        <div className={`rounded-full px-3 py-1 text-xs font-medium ${meta.badge}`}>
          {safeScore.toFixed(1)} / 10
        </div>
      </div>

      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full ${meta.progress}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex-1">
        <p 
          className="text-[15px] text-gray-700 leading-relaxed"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {assessment}
        </p>
      </div>
    </div>
  );
}

