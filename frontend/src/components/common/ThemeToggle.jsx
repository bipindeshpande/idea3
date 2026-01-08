import { useTheme } from "../../context/ThemeContext.jsx";

export default function ThemeToggle({ variant = "icon" }) {
 const { theme, toggleTheme } = useTheme();
 const isDark = theme === "dark";

 const label = isDark ? "Switch to light mode" : "Switch to dark mode";

 if (variant === "button") {
 return (
 <button
 type="button"
 onClick={toggleTheme}
 className="ui-btn ui-btn-secondary focus-visible:outline-accent"
 aria-label={label}
 title={label}
 >
 {isDark ? "Light" : "Dark"}
 </button>
 );
 }

 return (
 <button
 type="button"
 onClick={toggleTheme}
 className="w-9 h-9 flex items-center justify-center rounded-lg border border-default hover:bg-surface-hover transition-colors text-secondary hover:text-primary focus-visible:outline-accent"
 aria-label={label}
 title={label}
 >
 {isDark ? (
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
 </svg>
 ) : (
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
 </svg>
 )}
 </button>
 );
}


