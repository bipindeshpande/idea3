import UIHeading from "../../../components/ui/ui-heading.jsx";

/**
 * Loading state component for validation results
 */
export default function ValidationLoadingState() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-6">
      <div className="rounded-3xl border border-default bg-surface p-6 text-center">
        <UIHeading level="h3" className="text-primary">Loading validation results...</UIHeading>
      </div>
    </section>
  );
}

