import UIHeading from "./ui-heading.jsx";

export default function UISection({ title, description, className = "", children }) {
  return (
    <section className={["ui-section", className].filter(Boolean).join(" ")}>
      {title ? (
        <div>
          <UIHeading level="h2">{title}</UIHeading>
          {description ? <p className="text-secondary" style={{ marginTop: 8 }}>{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}


