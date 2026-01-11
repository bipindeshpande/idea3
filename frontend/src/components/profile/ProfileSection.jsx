import UIHeading from "../ui/ui-heading.jsx";
import { getSectionTheme } from "../../utils/formatters/profileTheme.js";

/**
 * Profile section component - displays a collapsible section with theme styling
 */
export function ProfileSection({ section, theme, sectionNumber, isOpen, onToggle }) {
  return (
    <div
      className="rounded-xl border shadow-sm overflow-hidden flex flex-col gap-2 w-full border-default"
      style={{
        backgroundColor: theme.bg,
        borderColor: theme.border,
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-6 py-4 border-b-2 transition-colors"
        style={{
          backgroundColor: theme.headerBg,
          borderColor: theme.border,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.headerBgHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.headerBg;
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{theme.icon}</span>
          <UIHeading level="h2" className="text-primary flex items-center gap-2 text-left text-lg font-semibold">
            {section.title}
          </UIHeading>
        </div>
        <span className={`w-5 h-5 text-secondary transition ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>
      
      {isOpen && (
        <div className="p-6 md:p-7 space-y-5 bg-surface">
          {section.content && section.content.length > 0 && (
            <div className="text-base text-primary leading-relaxed">
              <ul className="list-disc list-outside space-y-2.5 ml-6">
                {section.content.map((item, idx) => (
                  <li key={idx} className="text-base leading-relaxed pl-1">
                    {item.replace(/^-\s+/, "")}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {(!section.content || section.content.length === 0) && (
            <p className="text-base text-secondary italic">No content available for this section</p>
          )}
        </div>
      )}
    </div>
  );
}
