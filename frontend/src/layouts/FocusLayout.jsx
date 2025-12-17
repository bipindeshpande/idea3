import FocusTopBar from "../components/FocusTopBar.jsx";

export default function FocusLayout({
 steps = [],
 currentStep = 0,
 title,
 children,
}) {
 return (
 <div className="min-h-screen w-full bg-app text-primary font-sans">
 {/* Compact top bar (Back + Stepper + User Menu) */}
 <FocusTopBar steps={steps} currentStep={currentStep} title={title} />

 {/* Focus Mode layout canvas - reduced vertical space */}
 <main className="w-full">
 <div className="max-w-[820px] mx-auto px-4 py-6 md:py-8">
 {/* Pages own their internal spacing; FocusLayout only centers the canvas */}
 {children}
 </div>
 </main>
 </div>
 );
}


