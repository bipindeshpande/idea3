import { useEffect, useState } from "react";

/**
 * EnrichmentProgress - Visual progress indicator for AI enrichment
 * Shows animated progress bar and status messages
 */
export default function EnrichmentProgress({ isEnriching, currentStage = "analyzing" }) {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");

  // Stages of enrichment
  const stages = {
    analyzing: { label: "Analyzing your idea", icon: "🔍", progress: 25 },
    researching: { label: "Researching market insights", icon: "📊", progress: 50 },
    building: { label: "Building detailed recommendations", icon: "🏗️", progress: 75 },
    finalizing: { label: "Finalizing your report", icon: "✨", progress: 95 }
  };

  const currentStageInfo = stages[currentStage] || stages.analyzing;

  // Animate progress bar
  useEffect(() => {
    if (!isEnriching) {
      setProgress(100);
      return;
    }

    const targetProgress = currentStageInfo.progress;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= targetProgress) return targetProgress;
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isEnriching, currentStageInfo.progress]);

  // Animate dots
  useEffect(() => {
    if (!isEnriching) return;

    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, [isEnriching]);

  if (!isEnriching && progress === 100) return null;

  return (
    <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-xl p-6 mb-6 border border-accent/20">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl animate-pulse">{currentStageInfo.icon}</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-primary">
            {currentStageInfo.label}{dots}
          </p>
          <p className="text-xs text-secondary mt-1">
            This usually takes 30-45 seconds
          </p>
        </div>
        <span className="text-sm font-semibold text-accent">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-surface rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-accent/70 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Stage indicators */}
      <div className="flex justify-between mt-4">
        {Object.entries(stages).map(([key, stage]) => (
          <div
            key={key}
            className={`flex flex-col items-center gap-1 transition-opacity ${
              progress >= stage.progress ? "opacity-100" : "opacity-30"
            }`}
          >
            <span className="text-xs">{stage.icon}</span>
            <span className="text-xs text-secondary hidden sm:inline">
              {stage.label.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

