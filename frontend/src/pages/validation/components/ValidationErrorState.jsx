import { Link } from "react-router-dom";
import Seo from "../../../components/common/Seo.jsx";
import UIHeading from "../../../components/ui/ui-heading.jsx";

/**
 * Error state component for when validation results are not available
 */
export default function ValidationErrorState() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-6">
      <Seo
        title="Idea Validation Results | Startup Idea Advisor"
        description="Review your startup idea validation results with comprehensive analysis across 10 key parameters and actionable recommendations."
        keywords="startup validation results, idea validation score, startup idea analysis, business validation report"
        path="/validate-result"
      />
      <div className="rounded-3xl border border-default bg-surface p-6 text-accent shadow-soft">
        <UIHeading level="h2" className="text-primary">Validation results not available</UIHeading>
        <p className="mt-2 text-sm">
          Unable to load validation results. Please try validating your idea again.
        </p>
        <Link
          to="/validate-idea"
          className="mt-4 inline-block ui-btn ui-btn-primary focus-visible:outline-accent"
        >
          Validate Again
        </Link>
      </div>
    </section>
  );
}

