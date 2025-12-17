import { useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { frameworks } from "../../templates/frameworksConfig.js";
import PageHeader from "../../components/layout/PageHeader.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";
import Card from "../../components/ui/Card.jsx";
import UIButton from "../../components/ui/ui-button.jsx";
import UIHeading from "../../components/ui/ui-heading.jsx";
import SectionHeader from "../../components/layout/SectionHeader.jsx";
import TemplatePreviewModal from "../../components/resources/TemplatePreviewModal.jsx";
import { markdownToDocx } from "../../utils/markdownToDocx.js";

// Note: Frameworks are now imported from templates/frameworksConfig.js
// Templates are stored in separate .md files in frontend/src/templates/

export default function ResourcesPage() {
 // Find the flagship resource (Problem Validation Checklist)
 const flagshipFramework = frameworks.find(f => f.id === 1) || frameworks[0];
 
 // State for template preview modal
 const [previewTemplate, setPreviewTemplate] = useState(null);
 const [previewContent, setPreviewContent] = useState(null);

 return (
 <MarketingLayout>
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
 <span className="block mt-2 text-xs text-secondary">
 All templates download as editable Word documents (.docx) that you can customize.
 </span>
 </>
 }
 className="text-center mb-8"
 />

 {/* Start Here Section */}
 <div className="mb-10">
 <Card className="border-2 border-default shadow-sm">
 <div className="mb-5">
 <UIHeading level="h2" className="text-primary mb-2">New here? Start with this path</UIHeading>
 <p className="text-base text-primary font-medium">Complete these three steps in order to validate your idea before building.</p>
 </div>
 <div className="space-y-4">
 <div className="flex items-start gap-4">
 <div className="flex-shrink-0 w-7 h-7 rounded-full bg-accent text-on-accent text-xs font-bold flex items-center justify-center shadow-sm">1</div>
 <div className="flex-1">
 <p className="text-base font-semibold text-primary">Validate the problem exists</p>
 <p className="text-xs text-secondary mt-1">Use the Problem Validation Checklist to confirm people actually have this problem.</p>
 </div>
 </div>
 <div className="flex items-start gap-4">
 <div className="flex-shrink-0 w-7 h-7 rounded-full bg-accent text-on-accent text-xs font-bold flex items-center justify-center shadow-sm">2</div>
 <div className="flex-1">
 <p className="text-base font-semibold text-primary">Test willingness to pay</p>
 <p className="text-xs text-secondary mt-1">Run pricing validation to see if customers will pay for your solution.</p>
 </div>
 </div>
 <div className="flex items-start gap-4">
 <div className="flex-shrink-0 w-7 h-7 rounded-full bg-accent text-on-accent text-xs font-bold flex items-center justify-center shadow-sm">3</div>
 <div className="flex-1">
 <p className="text-base font-semibold text-primary">Build your MVP roadmap</p>
 <p className="text-xs text-secondary mt-1">Use the MVP Prioritization Matrix to decide what to build first.</p>
 </div>
 </div>
 </div>
 </Card>
 </div>

 {/* Flagship Resource */}
 <div className="mb-10">
 <div className="mb-4">
 <span className="text-xs font-semibold uppercase tracking-wide text-accent text-accent">Most Popular</span>
 </div>
 <Card className="border-2 border-default transition hover:shadow-lg shadow-sm">
 <div className="flex flex-col md:flex-row gap-6">
 <div className="flex-1">
 <div className="mb-3 flex items-center gap-3">
 <div className="text-4xl shrink-0">{flagshipFramework.icon}</div>
 <div>
 <UIHeading level="h3" className="text-primary">{flagshipFramework.title}</UIHeading>
 <p className="text-xs text-accent mt-1 font-medium">Use this first if you haven't validated your problem yet</p>
 </div>
 </div>
 <p className="text-base text-primary mb-4">{flagshipFramework.description}</p>
 <div className="flex flex-wrap gap-2 mb-4">
 <Link
 to="/blog/complete-guide-to-problem-validation"
 className="text-xs text-accent hover:text-accent-hover font-medium"
 >
 Use with: Problem Validation Guide →
 </Link>
 </div>
 <UIButton
 variant="primary"
 onClick={() => {
 setPreviewTemplate({ title: flagshipFramework.title, downloadName: `${flagshipFramework.title.toLowerCase().replace(/\s+/g, "-")}.docx` });
 setPreviewContent(flagshipFramework.content);
 }}
 className="w-full md:w-auto"
 >
 Download checklist
 </UIButton>
 </div>
 </div>
 </Card>
 </div>

 {/* Templates Section */}
 <div className="mb-8">
 <SectionHeader
 title="Startup Templates"
 description="Ready-to-use templates for business plans, pitch decks, and customer outreach."
 className="text-center mb-4"
 />
 <div className="grid gap-4 md:grid-cols-3">
 <Card className="flex flex-col border-default bg-surface transition hover:shadow-md">
 <div className="mb-3 flex items-center gap-3">
 <div className="text-3xl shrink-0">📄</div>
 <UIHeading level="h3" className="text-primary">Business Plan Template</UIHeading>
 </div>
 <p className="mt-2 text-xs text-primary flex-1">Complete business plan template with all sections you need.</p>
 <div className="mt-auto pt-4">
 <UIButton
 variant="secondary"
 onClick={() => {
 setPreviewTemplate({ title: "Business Plan Template", downloadName: "business-plan-template.docx" });
 setPreviewContent("/templates/business-plan-template.md");
 }}
 className="w-full"
 >
 Plan your business
 </UIButton>
 </div>
 </Card>
 <Card className="flex flex-col border-aqua-200 bg-aqua-50 transition hover:shadow-md">
 <div className="mb-3 flex items-center gap-3">
 <div className="text-3xl shrink-0">🎯</div>
 <UIHeading level="h3" className="text-primary">Pitch Deck Template</UIHeading>
 </div>
 <p className="mt-2 text-xs text-primary flex-1">12-slide investor pitch deck template with design tips.</p>
 <div className="mt-auto pt-4">
 <UIButton
 variant="secondary"
 onClick={() => {
 setPreviewTemplate({ title: "Pitch Deck Template", downloadName: "pitch-deck-template.docx" });
 setPreviewContent("/templates/pitch-deck-template.md");
 }}
 className="w-full"
 >
 Create pitch deck
 </UIButton>
 </div>
 </Card>
 <Card className="flex flex-col border-coral-200 bg-coral-50 transition hover:shadow-md">
 <div className="mb-3 flex items-center gap-3">
 <div className="text-3xl shrink-0">✉️</div>
 <UIHeading level="h3" className="text-primary">Email Templates</UIHeading>
 </div>
 <p className="mt-2 text-xs text-primary flex-1">Customer outreach email templates for validation.</p>
 <div className="mt-auto pt-4">
 <UIButton
 variant="secondary"
 onClick={() => {
 setPreviewTemplate({ title: "Customer Outreach Email Templates", downloadName: "customer-outreach-email-template.docx" });
 setPreviewContent("/templates/customer-outreach-email-template.md");
 }}
 className="w-full"
 >
 Start customer outreach
 </UIButton>
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
 { border: "border-default", bg: "bg-surface" },
 { border: "border-aqua-200", bg: "bg-aqua-50" },
 { border: "border-coral-200", bg: "bg-coral-50" },
 { border: "border-sand-200", bg: "bg-sand-50" },
 { border: "border-default", bg: "bg-surface" },
 { border: "border-aqua-200", bg: "bg-aqua-50" },
 ];
 const colors = colorClasses[index % colorClasses.length];

 // Map frameworks to relevant blog articles
 const blogLinks = {
 1: { text: "Problem Validation Guide", slug: "complete-guide-to-problem-validation" },
 2: { text: "Customer Interview Best Practices", slug: "customer-interview-best-practices" },
 3: { text: "Validate in 60 Minutes", slug: "validate-a-startup-idea-in-60-minutes" },
 4: { text: "Test Willingness to Pay", slug: "how-to-test-willingness-to-pay" },
 };
 const blogLink = blogLinks[framework.id];

 // Action-oriented button text based on framework
 const actionTexts = {
 1: "Download checklist",
 2: "Conduct interviews",
 3: "Test your landing page",
 4: "Test pricing in 30 minutes",
 5: "Prioritize your MVP",
 6: "Analyze competitors",
 };
 const actionText = actionTexts[framework.id] || "Get framework";

 return (
 <Card
 key={framework.id}
 className={`flex flex-col ${colors.border} ${colors.bg} transition hover:shadow-md`}
 >
 <div className="mb-3 flex items-center gap-3">
 <div className="text-3xl shrink-0">{framework.icon}</div>
 <UIHeading level="h3" className="text-primary">{framework.title}</UIHeading>
 </div>
 <p className="mt-2 text-xs text-primary flex-1">{framework.description}</p>
 {blogLink && (
 <div className="mt-3 mb-2">
 <Link
 to={`/blog/${blogLink.slug}`}
 className="text-xs text-secondary hover:text-accent-hover font-medium"
 >
 Use with: {blogLink.text} →
 </Link>
 </div>
 )}
 <div className="mt-auto pt-4">
 <UIButton
 variant="secondary"
 onClick={() => {
 setPreviewTemplate({ title: framework.title, downloadName: `${framework.title.toLowerCase().replace(/\s+/g, "-")}.docx` });
 setPreviewContent(framework.content);
 }}
 className="w-full"
 >
 {actionText}
 </UIButton>
 </div>
 </Card>
 );
 })}
 </div>
 </div>

 {/* Progress Note */}
 <div className="mt-8 mb-6 text-center">
 <p className="text-xs text-secondary italic">
 Most founders complete steps 1–3 in under a week
 </p>
 </div>

 {/* Next Steps Section */}
 <div className="mt-12 pt-8 border-t border-default">
 <Card className="bg-app bg-surface border-default">
 <div className="text-center">
 <UIHeading level="h3" className="text-primary mb-2">Ready to validate your idea?</UIHeading>
 <p className="text-base text-secondary mb-6">
 Use these resources to test your startup idea, then get AI-powered recommendations tailored to your situation.
 </p>
 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <div className="flex flex-col items-center">
 <UIButton as={Link} to="/advisor" variant="primary" className="w-full sm:w-auto">
 Run a discovery session
 </UIButton>
 <p className="text-xs text-secondary mt-2 max-w-xs">
 Get personalized startup ideas based on your time, budget, and skills
 </p>
 </div>
 <div className="flex flex-col items-center">
 <UIButton as={Link} to="/blog" variant="secondary" className="w-full sm:w-auto">
 Read validation guides
 </UIButton>
 <p className="text-xs text-secondary mt-2 max-w-xs">
 Learn step-by-step methods to test problems, pricing, and solutions
 </p>
 </div>
 </div>
 </div>
 </Card>
 </div>

 {/* Template Preview Modal */}
 {previewTemplate && (
 <TemplatePreviewModal
 template={previewTemplate}
 content={previewContent}
 onClose={() => {
 setPreviewTemplate(null);
 setPreviewContent(null);
 }}
 onDownload={async (fetchedContent) => {
 // Use fetched content if provided (from modal), otherwise use previewContent
 let contentToDownload = fetchedContent || previewContent;
 
 // If content is a URL, fetch it first
 if (typeof previewContent === "string" && previewContent.startsWith("/templates/") && !fetchedContent) {
 try {
 const response = await fetch(previewContent);
 contentToDownload = await response.text();
 } catch (err) {
 console.error("Failed to fetch template:", err);
 return;
 }
 }
 
 // Convert markdown to DOCX and download
 try {
 const docxBlob = await markdownToDocx(contentToDownload, previewTemplate.title);
 const url = URL.createObjectURL(docxBlob);
 const a = document.createElement("a");
 a.href = url;
 a.download = previewTemplate.downloadName;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
 } catch (err) {
 console.error("Failed to generate DOCX:", err);
 }
 }}
  />
  )}
  </MarketingLayout>
  );
}

