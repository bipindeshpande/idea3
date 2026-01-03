import { useState, useEffect } from "react";
import UIHeading from "../ui/ui-heading.jsx";

/**
 * Loading state component for recommendation detail page
 */
export default function RecommendationLoadingState({ isEnriching }) {
  const detailSteps = [
    { step: 1, total: 3, text: "Analyzing your profile", description: "Understanding your goals, skills, and constraints" },
    { step: 2, total: 3, text: "Preparing detailed playbook", description: "Creating personalized action plans and next steps" },
    { step: 3, total: 3, text: "Finalizing recommendations", description: "Reviewing and optimizing your personalized insights" },
  ];

  const [detailStepIndex, setDetailStepIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [detailStartTime] = useState(Date.now());

  useEffect(() => {
    // Progress through steps
    const stepInterval = setInterval(() => {
      setDetailStepIndex((prev) => {
        if (prev < detailSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 10000); // Change step every 10 seconds

    // Update elapsed time every second
    const timeInterval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - detailStartTime) / 1000));
    }, 1000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(timeInterval);
    };
  }, [detailStartTime]);

  const currentDetailStep = detailSteps[detailStepIndex];
  const progressPercent = Math.min(95, (elapsedSeconds / 20) * 100); // Cap at 95% until complete

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-3xl border-2 border-default bg-surface p-8 shadow-2xl">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-default border-t-brand-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
            </div>
          </div>

          <UIHeading level="h3" className="text-primary mb-2">
            {isEnriching ? "Generating Detailed Playbook" : "Generating Recommendations"}
          </UIHeading>
          <p className="mb-2 text-sm text-secondary">
            Step {currentDetailStep.step} of {currentDetailStep.total}
          </p>

          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-surface">
            <div
              className="h-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="mb-1 text-base font-semibold text-accent">
            {currentDetailStep.text}...
          </p>
          <p className="text-xs text-secondary">
            {currentDetailStep.description}
          </p>

          <div className="mt-4 space-y-1">
            <p className="text-xs text-secondary">
              Time elapsed: {elapsedSeconds}s
            </p>
            <p className="text-xs font-medium text-accent">
              Generating recommendations...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

