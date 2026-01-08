import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import UIHeading from "../../components/ui/ui-heading.jsx";
import UICard from "../../components/ui/ui-card.jsx";

export default function DiscoverHelp() {
  return (
    <>
      <Seo
        title="How to Discover Ideas | Standard Operating Procedure"
        description="Step-by-step guide to discovering personalized startup ideas"
        path="/help/discover"
      />
      <div className="max-w-4xl mx-auto space-y-6">
        <UICard className="p-6 space-y-6">
          {/* Step 1 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 1</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                Complete Intake Form
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Select startup category and time commitment</li>
                <li>Set budget range and risk tolerance</li>
                <li>Choose work style and startup style preferences</li>
                <li>Specify location and business region</li>
                <li>Select industry interest and sub-interest area</li>
                <li>Choose business type and earnings timeline</li>
                <li>Define founder ambition</li>
                <li>Select relevant skills across categories</li>
                <li>Add experience summary (optional)</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <p className="text-secondary">Profile data saved for matching</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 2</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                Review Your Inputs
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Review all selected options</li>
                <li>Edit any fields if needed</li>
                <li>Submit to generate recommendations</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <p className="text-secondary">Discovery request queued for AI processing</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 3</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                View Recommendations
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Navigate to Profile Report (auto-redirect)</li>
                <li>Review profile analysis summary</li>
                <li>Browse ranked idea recommendations</li>
                <li>Click on ideas to see detailed analysis</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Profile analysis document</li>
                <li>Ranked list of startup ideas (top 3-10)</li>
                <li>Per-idea scoring: goal fit, time fit, budget fit, skill fit</li>
                <li>Financial analysis per idea</li>
                <li>Risk assessment per idea</li>
                <li>Market research and competitive analysis</li>
              </ul>
            </div>
          </div>

          {/* Step 4 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 4</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                Take Action on Ideas
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Validate top ideas (optional)</li>
                <li>Save ideas to workspace</li>
                <li>Compare multiple ideas</li>
                <li>Share ideas for collaboration</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <p className="text-secondary">Ideas saved in workspace for future reference</p>
            </div>
          </div>
        </UICard>

        <div className="flex justify-end">
          <Link
            to="/advisor"
            className="ui-btn ui-btn-primary focus-visible:outline-accent"
          >
            Start Discovery
          </Link>
        </div>
      </div>
    </>
  );
}

