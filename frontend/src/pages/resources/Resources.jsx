import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { frameworks } from "../../templates/frameworksConfig.js";
import PageHeader from "../../components/layout/PageHeader.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import SectionHeader from "../../components/layout/SectionHeader.jsx";

// Note: Frameworks are now imported from templates/frameworksConfig.js
// Templates are stored in separate .md files in frontend/src/templates/

export default function ResourcesPage() {
  return (
    <PageContainer>
      <Seo
        title="Resources & Guides | Startup Idea Advisor"
        description="Access AI startup guides, validation templates, and community links to accelerate your next venture."
        path="/resources"
      />

      {/* Hero Section */}
      <PageHeader
        title="Resources to go from insight to traction"
        description={
          <>
            Use these playbooks and templates alongside your reports to keep momentum—run experiments, gather signal, and generate new recommendations when you need fresh direction.
            <span className="block mt-2 text-xs text-gray-500">
              All templates download as .txt files and can be opened in any text editor or markdown viewer.
            </span>
          </>
        }
        className="text-center mb-6"
      />

      {/* Templates Section */}
      <div className="mb-6">
        <SectionHeader
          title="Startup Templates"
          description="Ready-to-use templates for business plans, pitch decks, and customer outreach."
          className="text-center mb-4"
        />
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="flex flex-col border-brand-200 bg-brand-50 transition hover:shadow-md">
            <div className="mb-3 flex items-center gap-3">
              <div className="text-3xl shrink-0">📄</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Business Plan Template</h3>
            </div>
            <p className="mt-2 text-xs text-gray-700 dark:text-slate-300 flex-1">Complete business plan template with all sections you need.</p>
            <div className="mt-auto pt-4">
              <Button
                as="a"
                href="/templates/business-plan-template.md"
                download="business-plan-template.txt"
                variant="secondary"
                className="w-full"
              >
                Download Template
              </Button>
            </div>
          </Card>
          <Card className="flex flex-col border-aqua-200 bg-aqua-50 transition hover:shadow-md">
            <div className="mb-3 flex items-center gap-3">
              <div className="text-3xl shrink-0">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Pitch Deck Template</h3>
            </div>
            <p className="mt-2 text-xs text-gray-700 dark:text-slate-300 flex-1">12-slide investor pitch deck template with design tips.</p>
            <div className="mt-auto pt-4">
              <Button
                as="a"
                href="/templates/pitch-deck-template.md"
                download="pitch-deck-template.txt"
                variant="secondary"
                className="w-full"
              >
                Download Template
              </Button>
            </div>
          </Card>
          <Card className="flex flex-col border-coral-200 bg-coral-50 transition hover:shadow-md">
            <div className="mb-3 flex items-center gap-3">
              <div className="text-3xl shrink-0">✉️</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Email Templates</h3>
            </div>
            <p className="mt-2 text-xs text-gray-700 dark:text-slate-300 flex-1">Customer outreach email templates for validation.</p>
            <div className="mt-auto pt-4">
              <Button
                as="a"
                href="/templates/customer-outreach-email-template.md"
                download="customer-outreach-email-template.txt"
                variant="secondary"
                className="w-full"
              >
                Download Template
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Frameworks & Templates Section */}
      <div className="mb-6">
        <SectionHeader
          title="Validation Frameworks & Templates"
          description="Download free, actionable frameworks to validate your startup idea, test pricing, conduct interviews, and build your MVP."
          className="text-center mb-4"
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {frameworks.map((framework, index) => {
            const colorClasses = [
              { border: "border-brand-200", bg: "bg-brand-50" },
              { border: "border-aqua-200", bg: "bg-aqua-50" },
              { border: "border-coral-200", bg: "bg-coral-50" },
              { border: "border-sand-200", bg: "bg-sand-50" },
              { border: "border-brand-200", bg: "bg-brand-50" },
              { border: "border-aqua-200", bg: "bg-aqua-50" },
            ];
            const colors = colorClasses[index % colorClasses.length];

            return (
              <Card
                key={framework.id}
                className={`flex flex-col ${colors.border} ${colors.bg} transition hover:shadow-md`}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="text-3xl shrink-0">{framework.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900">{framework.title}</h3>
                </div>
                <p className="mt-2 text-xs text-gray-700 flex-1">{framework.description}</p>
                <div className="mt-auto pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const blob = new Blob([framework.content], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${framework.title.toLowerCase().replace(/\s+/g, "-")}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full"
                  >
                    Download Framework
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}

