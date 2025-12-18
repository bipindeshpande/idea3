import { useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { frameworks } from "../../templates/frameworksConfig.js";
import HeroSection from "../../components/marketing/HeroSection.jsx";
import SectionHeader from "../../components/marketing/SectionHeader.jsx";
import FeatureGrid from "../../components/marketing/FeatureGrid.jsx";
import CTASection from "../../components/marketing/CTASection.jsx";
import Blob from "../../components/marketing/Blob.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";
import Card from "../../components/ui/Card.jsx";
import UIButton from "../../components/ui/ui-button.jsx";
import UIHeading from "../../components/ui/ui-heading.jsx";
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
 <HeroSection
 title="Resources to go from insight to traction"
 subtitle="Use these playbooks and templates alongside your reports to keep momentum—run experiments, gather signal, and generate new recommendations when you need fresh direction. All templates download as editable Word documents (.docx) that you can customize."
 primaryCTA={{ to: "/advisor", label: "Get Started" }}
 secondaryCTA={{ to: "/blog", label: "Read Guides" }}
 className="mb-20"
 />

 {/* Section Divider */}
 <div className="marketing-divider my-16" />

 {/* Start Here Section */}
 <section className="relative py-12 mb-16">
 <Blob size="medium" position="top-left" />
 <Card className="marketing-card-blue relative overflow-hidden">
 <div className="relative z-10 mb-6">
 <SectionHeader title="New here? Start with this path" subtitle="Complete these three steps in order to validate your idea before building." center />
 </div>
 <div className="space-y-6">
 <div className="flex items-start gap-4">
 <div className="marketing-icon-circle flex-shrink-0">
 <span className="text-lg font-bold text-accent font-mono">1</span>
 </div>
 <div className="flex-1">
 <UIHeading level="h3" className="marketing-card-title text-primary mb-2">Validate the problem exists</UIHeading>
 <p className="text-base text-secondary">Use the Problem Validation Checklist to confirm people actually have this problem.</p>
 </div>
 </div>
 <div className="flex items-start gap-4">
 <div className="marketing-icon-circle flex-shrink-0">
 <span className="text-lg font-bold text-accent font-mono">2</span>
 </div>
 <div className="flex-1">
 <UIHeading level="h3" className="marketing-card-title text-primary mb-2">Test willingness to pay</UIHeading>
 <p className="text-base text-secondary">Run pricing validation to see if customers will pay for your solution.</p>
 </div>
 </div>
 <div className="flex items-start gap-4">
 <div className="marketing-icon-circle flex-shrink-0">
 <span className="text-lg font-bold text-accent font-mono">3</span>
 </div>
 <div className="flex-1">
 <UIHeading level="h3" className="marketing-card-title text-primary mb-2">Build your MVP roadmap</UIHeading>
 <p className="text-base text-secondary">Use the MVP Prioritization Matrix to decide what to build first.</p>
 </div>
 </div>
 </div>
 </Card>
 </section>

 {/* Flagship Resource */}
 <section className="relative py-12 mb-16">
 <Blob size="small" position="top-right" />
 <div className="mb-4">
 <span className="ui-badge ui-badge--info">Most Popular</span>
 </div>
 <Card className="marketing-card-red relative overflow-hidden">
 <div className="relative z-10 flex flex-col md:flex-row gap-6">
 <div className="marketing-icon-circle flex-shrink-0">
 <span className="text-4xl">{flagshipFramework.icon}</span>
 </div>
 <div className="flex-1">
 <UIHeading level="h2" className="marketing-section-title text-primary mb-2">{flagshipFramework.title}</UIHeading>
 <p className="text-base text-accent mb-3 font-medium">Use this first if you haven't validated your problem yet</p>
 <p className="text-base text-secondary mb-6">{flagshipFramework.description}</p>
 <div className="flex flex-wrap gap-4 mb-6">
 <Link
 to="/blog/complete-guide-to-problem-validation"
 className="text-base text-accent hover:text-accent-hover font-medium"
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
 className="marketing-btn-primary"
 >
 Download checklist
 </UIButton>
 </div>
 </div>
 </Card>
 </section>

 {/* Section Divider */}
 <div className="marketing-divider my-16" />

 {/* Templates Section */}
 <section className="relative py-12 mb-16">
 <Blob size="medium" position="bottom-right" />
 <SectionHeader
 title="Startup Templates"
 subtitle="Ready-to-use templates for business plans, pitch decks, and customer outreach."
 center
 className="mb-12"
 />
 <div className="grid gap-6 md:grid-cols-3">
 <Card className="marketing-feature-card marketing-card-blue flex flex-col">
 <div className="marketing-icon-circle mb-4 mx-auto">
 <span className="text-3xl">📄</span>
 </div>
 <UIHeading level="h3" className="marketing-card-title text-primary mb-3 text-center">Business Plan Template</UIHeading>
 <p className="text-base text-secondary flex-1 text-center mb-6">Complete business plan template with all sections you need.</p>
 <div className="mt-auto">
 <UIButton
 variant="secondary"
 onClick={() => {
 setPreviewTemplate({ title: "Business Plan Template", downloadName: "business-plan-template.docx" });
 setPreviewContent("/templates/business-plan-template.md");
 }}
 className="w-full marketing-btn-secondary"
 >
 Plan your business
 </UIButton>
 </div>
 </Card>
 <Card className="marketing-feature-card marketing-card-blue flex flex-col">
 <div className="marketing-icon-circle mb-4 mx-auto">
 <span className="text-3xl">🎯</span>
 </div>
 <UIHeading level="h3" className="marketing-card-title text-primary mb-3 text-center">Pitch Deck Template</UIHeading>
 <p className="text-base text-secondary flex-1 text-center mb-6">12-slide investor pitch deck template with design tips.</p>
 <div className="mt-auto">
 <UIButton
 variant="secondary"
 onClick={() => {
 setPreviewTemplate({ title: "Pitch Deck Template", downloadName: "pitch-deck-template.docx" });
 setPreviewContent("/templates/pitch-deck-template.md");
 }}
 className="w-full marketing-btn-secondary"
 >
 Create pitch deck
 </UIButton>
 </div>
 </Card>
 <Card className="marketing-feature-card marketing-card-purple flex flex-col">
 <div className="marketing-icon-circle mb-4 mx-auto">
 <span className="text-3xl">✉️</span>
 </div>
 <UIHeading level="h3" className="marketing-card-title text-primary mb-3 text-center">Email Templates</UIHeading>
 <p className="text-base text-secondary flex-1 text-center mb-6">Customer outreach email templates for validation.</p>
 <div className="mt-auto">
 <UIButton
 variant="secondary"
 onClick={() => {
 setPreviewTemplate({ title: "Customer Outreach Email Templates", downloadName: "customer-outreach-email-template.docx" });
 setPreviewContent("/templates/customer-outreach-email-template.md");
 }}
 className="w-full marketing-btn-secondary"
 >
 Start customer outreach
 </UIButton>
 </div>
 </Card>
 </div>
 </section>

 {/* Section Divider */}
 <div className="marketing-divider my-16" />

 {/* Frameworks & Templates Section */}
 <section className="relative py-12 mb-16">
 <Blob size="large" position="center" />
 <SectionHeader
 title="Validation Frameworks & Templates"
 subtitle="Download free, actionable frameworks to validate your startup idea, test pricing, conduct interviews, and build your MVP."
 center
 className="mb-12"
 />
 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
 {frameworks.map((framework, index) => {
 const colorMap = [
 "marketing-card-red",
 "marketing-card-blue",
 "marketing-card-orange",
 "marketing-card-teal",
 "marketing-card-purple",
 "marketing-card-blue",
 ];
 const colorClass = colorMap[index % colorMap.length];

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
 className={`marketing-feature-card ${colorClass} flex flex-col marketing-fade-in`}
 style={{ animationDelay: `${index * 0.1}s` }}
 >
 <div className="marketing-icon-circle mb-4 mx-auto">
 <span className="text-3xl">{framework.icon}</span>
 </div>
 <UIHeading level="h3" className="marketing-card-title text-primary mb-3 text-center">{framework.title}</UIHeading>
 <p className="text-base text-secondary flex-1 text-center mb-4">{framework.description}</p>
 {blogLink && (
 <div className="mb-4 text-center">
 <Link
 to={`/blog/${blogLink.slug}`}
 className="text-base text-accent hover:text-accent-hover font-medium"
 >
 Use with: {blogLink.text} →
 </Link>
 </div>
 )}
 <div className="mt-auto">
 <UIButton
 variant="secondary"
 onClick={() => {
 setPreviewTemplate({ title: framework.title, downloadName: `${framework.title.toLowerCase().replace(/\s+/g, "-")}.docx` });
 setPreviewContent(framework.content);
 }}
 className="w-full marketing-btn-secondary"
 >
 {actionText}
 </UIButton>
 </div>
 </Card>
 );
 })}
 </div>
 </section>

 {/* Progress Note */}
 <div className="my-12 text-center">
 <p className="text-base text-secondary italic">
 Most founders complete steps 1–3 in under a week
 </p>
 </div>

 {/* CTA Section */}
 <CTASection
 title="Ready to validate your idea?"
 description="Use these resources to test your startup idea, then get AI-powered recommendations tailored to your situation."
 primaryCTA={{ to: "/advisor", label: "Run a discovery session" }}
 secondaryCTA={{ to: "/blog", label: "Read validation guides" }}
 gradient
 className="my-20"
 />

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

