import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { frameworks } from "../../templates/frameworksConfig.js";
import PageHeader from "../../components/layout/PageHeader.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";

// Note: Templates are now stored in separate .md files in frontend/src/templates/
// Edit the .md files directly to update template content

export default function FrameworksPage() {
  return (
    <PageContainer>
      <Seo
        title="Startup Validation Frameworks & Templates | Startup Idea Advisor"
        description="Download free frameworks, templates, and checklists for validating startup ideas, conducting customer interviews, testing pricing, and building MVPs."
        path="/frameworks"
        keywords="startup frameworks, validation templates, customer interview script, MVP framework, pricing validation, competitive analysis"
      />

      {/* Hero Section */}
      <PageHeader
        title="Validation Frameworks"
        description="Free, actionable frameworks and templates to validate your startup idea, test pricing, conduct interviews, and build your MVP."
        badge="Frameworks & Templates"
        className="text-center mb-16"
      />

      {/* Frameworks Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              className={`${colors.border} ${colors.bg} transition hover:shadow-md`}
            >
              <div className="mb-4 text-4xl">{framework.icon}</div>
              <div className="mb-2">
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
                  {framework.category}
                </span>
              </div>
              <h2 className="mt-3 text-xl font-semibold text-gray-900">{framework.title}</h2>
              <p className="mt-2 text-sm text-gray-700">{framework.description}</p>
              <div className="mt-6">
                <Button
                  variant="secondary"
                  onClick={() => {
                    const blob = new Blob([framework.content], { type: "text/markdown" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${framework.title.toLowerCase().replace(/\s+/g, "-")}.md`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full"
                >
                  Download Framework (.md)
                </Button>
                <p className="mt-2 text-xs text-gray-600 text-center">
                  Opens in any text editor or markdown viewer
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* CTA Section */}
      <Card className="mt-16 border-brand-200 bg-gradient-to-br from-brand-50 to-brand-100/50 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Ready to Validate Your Idea?</h2>
        <p className="mt-2 text-gray-700">
          Use these frameworks alongside our AI-powered validation tool to get comprehensive feedback on your startup idea.
        </p>
        <div className="mt-6 flex gap-4 justify-center">
          <Button as={Link} to="/validate-idea">
            Validate Your Idea
          </Button>
          <Button as={Link} to="/#intake-form" variant="secondary">
            Discover Ideas
          </Button>
        </div>
      </Card>
    </PageContainer>
  );
}
