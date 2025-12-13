/**
 * AccentGlow - Reusable accent glow effect for page headers
 */
export default function AccentGlow({ className = "" }) {
  return (
    <div 
      className={`absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-indigo-300 opacity-[0.09] blur-2xl pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}

