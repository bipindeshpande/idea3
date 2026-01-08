import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import UIHeading from "../../components/ui/ui-heading.jsx";
import UICard from "../../components/ui/ui-card.jsx";

export default function FrameworksHelp() {
  return (
    <>
      <Seo
        title="How to Use Templates & Frameworks | Standard Operating Procedure"
        description="Step-by-step guide to using templates and creating custom frameworks"
        path="/help/frameworks"
      />
      <div className="max-w-4xl mx-auto space-y-6">
        <UICard className="p-6 space-y-6">
          {/* Overview */}
          <div>
            <UIHeading level="h3" className="text-lg font-semibold mb-3">
              Templates & Frameworks Overview
            </UIHeading>
            <p className="text-sm text-secondary">
              Templates are pre-built validation frameworks you can download or customize. 
              Custom frameworks are personalized versions you create from templates to track your progress.
            </p>
          </div>

          {/* Step 1 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 1</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                Browse Templates
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Go to "Templates & Frameworks" in the sidebar</li>
                <li>Click on the "Templates" tab</li>
                <li>Browse available validation templates</li>
                <li>Review template descriptions and categories</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <p className="text-secondary">List of all available base templates you can use</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 2</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                Create Custom Framework
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Click "Create" button on any template</li>
                <li>Edit the framework title (defaults to template name)</li>
                <li>Customize the content to match your needs</li>
                <li>Click "Save" to create your custom framework</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <p className="text-secondary">A new custom framework saved in your workspace</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 3</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                Manage Your Frameworks
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Switch to "My Frameworks" tab</li>
                <li>View all your custom frameworks</li>
                <li>Use search to find specific frameworks</li>
                <li>Filter by status: Draft, In Progress, or Completed</li>
                <li>Toggle between Table and List view</li>
                <li>Click "Edit" to modify a framework</li>
                <li>Click "Delete" to remove a framework</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <p className="text-secondary">Organized list of your custom frameworks with status tracking</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 4</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                Track Progress
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Edit your framework and check off completed items</li>
                <li>Progress is automatically calculated from checkboxes</li>
                <li>Status updates based on progress (Draft → In Progress → Completed)</li>
                <li>Download your framework as a markdown file anytime</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <p className="text-secondary">Visual progress tracking with percentage completion</p>
            </div>
          </div>

          {/* Key Features */}
          <div className="border-t border-default pt-4">
            <UIHeading level="h3" className="text-lg font-semibold mb-3">
              Key Features
            </UIHeading>
            <ul className="list-disc list-inside space-y-1 text-sm text-secondary">
              <li><strong>Templates:</strong> Pre-built frameworks you can download or customize</li>
              <li><strong>Custom Frameworks:</strong> Personalized versions you create and track</li>
              <li><strong>Progress Tracking:</strong> Automatic calculation from markdown checkboxes</li>
              <li><strong>Search & Filter:</strong> Quickly find frameworks by name or status</li>
              <li><strong>Multiple Views:</strong> Table view for many items, List view for detailed browsing</li>
            </ul>
          </div>
        </UICard>

        <div className="flex justify-end">
          <Link
            to="/dashboard/frameworks"
            className="ui-btn ui-btn-primary focus-visible:outline-accent"
          >
            Go to Templates & Frameworks
          </Link>
        </div>
      </div>
    </>
  );
}

