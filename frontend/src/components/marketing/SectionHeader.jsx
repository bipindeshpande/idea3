import UIHeading from "../ui/ui-heading.jsx";

/**
 * SectionHeader - Marketing section header with optional gradient accent
 */
export default function SectionHeader({ title, subtitle, center = false, className = "" }) {
  return (
    <div className={`${center ? "text-center" : ""} ${className}`}>
      <UIHeading level="h2" className="marketing-section-title text-primary mb-3">
        {title}
      </UIHeading>
      {subtitle && (
        <p className={`text-base text-secondary ${center ? "max-w-2xl mx-auto" : ""}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

