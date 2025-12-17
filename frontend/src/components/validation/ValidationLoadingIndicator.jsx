import { useEffect, useState } from "react";

const validationSteps = [
 { step: 1, total: 6, text: "Analyzing your idea", description: "Understanding your concept and context" },
 { step: 2, total: 6, text: "Evaluating market opportunity", description: "Assessing market size and demand signals" },
 { step: 3, total: 6, text: "Assessing competitive landscape", description: "Identifying competitors and differentiation" },
 { step: 4, total: 6, text: "Reviewing business model viability", description: "Analyzing revenue model and unit economics" },
 { step: 5, total: 6, text: "Analyzing risks & feasibility", description: "Identifying critical risks and technical challenges" },
 { step: 6, total: 6, text: "Preparing critical feedback", description: "Compiling actionable recommendations and next steps" },
];

export default function ValidationLoadingIndicator() {
 const [stepIndex, setStepIndex] = useState(0);
 const [elapsedSeconds, setElapsedSeconds] = useState(0);
 const [startTime] = useState(Date.now());

 useEffect(() => {
 // Progress through steps (don't cycle back)
 const stepInterval = setInterval(() => {
 setStepIndex((prev) => {
 if (prev < validationSteps.length - 1) {
 return prev + 1;
 }
 return prev; // Stay on last step
 });
 }, 5000); // Change step every 5 seconds

 // Update elapsed time every second
 const timeInterval = setInterval(() => {
 setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
 }, 1000);

 return () => {
 clearInterval(stepInterval);
 clearInterval(timeInterval);
 };
 }, [startTime]);

 const currentStep = validationSteps[stepIndex];
 const estimatedTotalSeconds = 30;
 const estimatedRemaining = Math.max(0, estimatedTotalSeconds - elapsedSeconds);
 const progressPercent = Math.min(100, (elapsedSeconds / estimatedTotalSeconds) * 100);

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface backdrop-blur-sm">
 <div className="mx-4 w-full max-w-md rounded-3xl border-2 border-default bg-surface p-8 shadow-2xl">
 <div className="text-center">
 <div className="mb-6 flex justify-center">
 <div className="relative">
 <div className="h-16 w-16 animate-spin rounded-full border-4 border-default border-t-brand-600"></div>
 <div className="absolute inset-0 flex items-center justify-center">
 <span className="text-2xl">🔍</span>
 </div>
 </div>
 </div>
 
 <h3 className="mb-2 text-xl font-bold text-primary">Validating Your Idea</h3>
 <p className="mb-2 text-sm text-secondary">
 Step {currentStep.step} of {currentStep.total}
 </p>
 <p className="mb-4 text-xs text-secondary">Analyzing your brilliance... ✨</p>
 
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
 <p className="text-xs font-medium text-accent">
 Estimated time remaining: {estimatedRemaining}s
 </p>
 </div>
 </div>
 </div>
 </div>
 );
}

