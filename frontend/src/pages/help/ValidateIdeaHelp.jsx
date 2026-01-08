import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import UIHeading from "../../components/ui/ui-heading.jsx";
import UICard from "../../components/ui/ui-card.jsx";

export default function ValidateIdeaHelp() {
  return (
    <>
      <Seo
        title="How to Validate Your Idea | Standard Operating Procedure"
        description="Step-by-step guide to validating your startup idea"
        path="/help/validate-idea"
      />
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <UIHeading level="h1" className="text-2xl font-bold mb-2">
            How to Validate Your Idea
          </UIHeading>
          <p className="text-secondary">
            Standard operating procedure for validating startup ideas
          </p>
        </div>

        <UICard className="p-6 space-y-6">
          {/* Step 1 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 1</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                Provide Idea Context
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Select industry category</li>
                <li>Choose time commitment level</li>
                <li>Set budget range</li>
                <li>Specify work style preference</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <p className="text-secondary">Form data saved for analysis</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 2</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                Describe How It Works
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Select business type</li>
                <li>Choose customer interaction level</li>
                <li>Set location context</li>
                <li>Specify earnings timeline</li>
                <li>Define founder ambition</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <p className="text-secondary">Operational parameters captured</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 3</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                Write Idea Description
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Write structured description (required)</li>
                <li>Add optional constraints or preferences</li>
                <li>Submit for validation</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <p className="text-secondary">Validation request queued for processing</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 4</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                Review Results
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Navigate to Validation Results page</li>
                <li>Review scores across 10 parameters</li>
                <li>Read detailed analysis and recommendations</li>
                <li>Check next steps roadmap</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Overall viability score (0-10)</li>
                <li>Parameter-specific scores and analysis</li>
                <li>Actionable recommendations per parameter</li>
                <li>Next steps roadmap</li>
                <li>Downloadable PDF report</li>
              </ul>
            </div>
          </div>
        </UICard>

        <div className="flex justify-end">
          <Link
            to="/validate-idea"
            className="ui-btn ui-btn-primary focus-visible:outline-accent"
          >
            Start Validation
          </Link>
        </div>
      </div>
    </>
  );
}

