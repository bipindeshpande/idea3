import { useEffect, useState, useRef } from "react";

const discoverySteps = [
 { step: 1, total: 4, text: "Analyzing your profile", description: "Understanding your goals, skills, and constraints" },
 { step: 2, total: 4, text: "Researching market opportunities", description: "Identifying trends and viable startup ideas" },
 { step: 3, total: 4, text: "Evaluating risks & finances", description: "Assessing feasibility and financial outlook" },
 { step: 4, total: 4, text: "Preparing recommendations", description: "Creating personalized action plans and next steps" },
];

export default function DiscoveryLoadingIndicator({ 
 streamingOutput = "", 
 isCached = false,
 startTime = null,
 duration = null // Duration in milliseconds when request completes
}) {
 const [stepIndex, setStepIndex] = useState(0);
 const [elapsedSeconds, setElapsedSeconds] = useState(0);
 const [isComplete, setIsComplete] = useState(false);
 const outputRef = useRef(null);
 // Use performance.now() if startTime is provided (from ReportsContext), otherwise fallback to Date.now()
 const actualStartTime = startTime || performance.now();

 useEffect(() => {
 // If duration is provided, request is complete - stop timer
 if (duration !== null) {
 setIsComplete(true);
 setElapsedSeconds(Math.floor(duration / 1000));
 return;
 }

 // Progress through steps (don't cycle back)
 const stepInterval = setInterval(() => {
 setStepIndex((prev) => {
 if (prev < discoverySteps.length - 1) {
 return prev + 1;
 }
 return prev; // Stay on last step
 });
 }, 15000); // Change step every 15 seconds (longer for discovery)

 // Update elapsed time every second
 const timeInterval = setInterval(() => {
 if (!isComplete) {
 // Use performance.now() for consistency with ReportsContext
 const now = performance.now();
 setElapsedSeconds(Math.floor((now - actualStartTime) / 1000));
 }
 }, 1000);

 return () => {
 clearInterval(stepInterval);
 clearInterval(timeInterval);
 };
 }, [actualStartTime, duration, isComplete]);

 // Auto-scroll streaming output
 useEffect(() => {
 if (outputRef.current && streamingOutput) {
 outputRef.current.scrollTop = outputRef.current.scrollHeight;
 }
 }, [streamingOutput]);

 const currentStep = discoverySteps[stepIndex];
 // Progress bar: show 100% when complete, otherwise show based on elapsed time
 // For static engine (fast), progress will jump to 100% quickly
 // For LLM (slower), progress will gradually increase
 const progressPercent = isComplete ? 100 : Math.min(95, (elapsedSeconds / 30) * 100); // Cap at 95% until complete

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
 
 <h3 className="mb-2 text-xl font-bold text-primary">
 {isCached ? "Loading Cached Response" : "Generating Recommendations"}
 </h3>
 {isCached && (
 <div className="mb-2 inline-flex items-center rounded-full bg-surface px-3 py-1 text-xs font-semibold text-accent">
 ⚡ Cached Response
 </div>
 )}
 {!isCached && (
 <p className="mb-2 text-sm text-secondary">
 Step {currentStep.step} of {currentStep.total}
 </p>
 )}
 
 <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-surface">
 <div 
 className="h-full transition-all duration-1000"
 style={{ width: `${progressPercent}%` }}
 />
 </div>
 
 <p className="mb-1 text-base font-semibold text-accent">
 {currentStep.text}...
 </p>
 <p className="text-xs text-secondary">
 {currentStep.description}
 </p>
 
 <div className="mt-4 space-y-1">
 <p className="text-xs text-secondary">
 Time elapsed: {elapsedSeconds}s
 </p>
 {isComplete ? (
 <p className="text-xs font-medium text-success">
 ✓ Complete
 </p>
 ) : (
 <p className="text-xs font-medium text-accent">
 Generating recommendations...
 </p>
 )}
 </div>
 
 {streamingOutput && (
 <div 
 ref={outputRef}
 className="mt-6 max-h-64 overflow-y-auto rounded-lg border border-default bg-surface p-4 text-left"
 >
 <p className="mb-2 text-xs font-semibold text-accent">
 {isCached ? "Cached Output:" : "Live Output:"}
 </p>
 <pre className="whitespace-pre-wrap text-xs text-primary font-mono">
 {streamingOutput}
 </pre>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}

