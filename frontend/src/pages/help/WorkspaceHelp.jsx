import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import UIHeading from "../../components/ui/ui-heading.jsx";
import UICard from "../../components/ui/ui-card.jsx";

export default function WorkspaceHelp() {
  return (
    <>
      <Seo
        title="How to Use Workspace | Standard Operating Procedure"
        description="Step-by-step guide to managing your workspace"
        path="/help/workspace"
      />
      <div className="max-w-4xl mx-auto space-y-6">
        <UICard className="p-6 space-y-6">
          {/* Overview */}
          <div>
            <UIHeading level="h3" className="text-lg font-semibold mb-3">
              Workspace Overview
            </UIHeading>
            <p className="text-sm text-secondary">
              Your workspace is the central hub for all your startup activities. It stores your validated ideas, 
              discovery results, and provides quick access to all features.
            </p>
          </div>

          {/* Step 1 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 1</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                View Your Content
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Open workspace from sidebar</li>
                <li>Browse tabs: Ideas, Validations, History</li>
                <li>Click on any item to view details</li>
                <li>Use filters and search to find specific items</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <p className="text-secondary">List of all your saved ideas, validations, and discovery results</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 2</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                Manage Ideas
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Select ideas to compare (up to 5)</li>
                <li>Edit idea details or notes</li>
                <li>Add action items or tasks</li>
                <li>Mark ideas as active/inactive</li>
                <li>Delete ideas you no longer need</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <p className="text-secondary">Updated idea status and metadata saved</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 3</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                Access Features
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Click "Validate Your Idea" to validate an idea</li>
                <li>Click "Discover New Ideas" to get recommendations</li>
                <li>Click "Founder Network" to find collaborators</li>
                <li>Use sidebar navigation to switch between features</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <p className="text-secondary">Navigate to respective feature pages</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 4</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                Review History
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Go to "History" tab</li>
                <li>View all past discoveries and validations</li>
                <li>Filter by date, type, or status</li>
                <li>Re-open or re-validate previous items</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <p className="text-secondary">Chronological list of all your activities</p>
            </div>
          </div>
        </UICard>

        <div className="flex justify-end">
          <Link
            to="/dashboard"
            className="ui-btn ui-btn-primary focus-visible:outline-accent"
          >
            Go to Workspace
          </Link>
        </div>
      </div>
    </>
  );
}

