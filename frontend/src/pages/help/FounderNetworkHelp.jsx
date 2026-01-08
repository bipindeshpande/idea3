import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import UIHeading from "../../components/ui/ui-heading.jsx";
import UICard from "../../components/ui/ui-card.jsx";

export default function FounderNetworkHelp() {
  return (
    <>
      <Seo
        title="How to Use Founder Network | Standard Operating Procedure"
        description="Step-by-step guide to finding co-founders and collaborators"
        path="/help/founder-network"
      />
      <div className="max-w-4xl mx-auto space-y-6">
        <UICard className="p-6 space-y-6">
          {/* Step 1 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 1</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                Create Your Profile
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Go to "My Profile" tab</li>
                <li>Fill in your skills, experience, and work style</li>
                <li>Set your profile visibility (anonymous by default)</li>
                <li>Save profile</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <p className="text-secondary">Anonymous profile created and visible to other founders</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 2</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                Create Idea Listings
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Go to "My Listings" tab</li>
                <li>Click "Create New Listing"</li>
                <li>Select a validated idea or enter idea details</li>
                <li>Specify what you're looking for (co-founder, collaborator, etc.)</li>
                <li>Set required skills and preferences</li>
                <li>Publish listing (stays anonymous)</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <p className="text-secondary">Anonymous listing visible in "Browse Ideas" section</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 3</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                Browse & Filter
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Go to "Browse Ideas" or "Browse Founders" tab</li>
                <li>Filter by skills, interests, or idea categories</li>
                <li>Review anonymized profiles/listings</li>
                <li>Check fit scores and compatibility indicators</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <p className="text-secondary">List of matching profiles/listings with key information</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 4</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                Send Connection Request
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Click on a profile or listing you're interested in</li>
                <li>Review detailed information (still anonymous)</li>
                <li>Click "Send Connection Request"</li>
                <li>Add optional message</li>
                <li>Submit request (uses 1 connection credit)</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <p className="text-secondary">Connection request sent; appears in their "Connections" tab</p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 5</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                Accept Connection & Reveal
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Go to "Connections" tab</li>
                <li>Review incoming connection requests</li>
                <li>Accept or decline requests</li>
                <li>When both sides accept, identities are revealed</li>
                <li>Contact information becomes available</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Active connection established</li>
                <li>Full profile information visible to both parties</li>
                <li>Ability to collaborate and communicate</li>
              </ul>
            </div>
          </div>
        </UICard>

        <div className="flex justify-end">
          <Link
            to="/founder-connect"
            className="ui-btn ui-btn-primary focus-visible:outline-accent"
          >
            Go to Founder Network
          </Link>
        </div>
      </div>
    </>
  );
}

