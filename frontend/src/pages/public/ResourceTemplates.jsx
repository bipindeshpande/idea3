import { useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";
import SectionTitle from "../../components/marketing/SectionTitle.jsx";
import FeatureCard from "../../components/marketing/FeatureCard.jsx";
import CTASection from "../../components/marketing/CTASection.jsx";
import { HeroSection } from "../../sections/marketing/templates";
import UIButton from "../../components/ui/ui-button.jsx";
import TemplatePreviewModal from "../../components/resources/TemplatePreviewModal.jsx";
import { markdownToDocx } from "../../utils/markdownToDocx.js";
import { frameworks } from "../../templates/frameworksConfig.js";
import { templates as traditionalTemplates } from "../../templates/templatesConfig.js";
import { generateBreadcrumbs, breadcrumbPatterns } from "../../utils/seo/breadcrumbs.js";
import {
  seo,
  heroData,
  whyTemplatesMatter,
  howToUseSteps,
  ctaData
} from "../../data/marketing/templates.js";

export default function ResourceTemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);

  // Map categories to tint colors for consistent theming
  const categoryTintMap = {
    "Validation": "blue",
    "Interviews": "green",
    "Testing": "orange",
    "Pricing": "purple",
    "MVP": "yellow",
    "Strategy": "blue",
    "Planning": "green",
    "Discovery": "orange",
    "Market": "purple",
  };

  // Map frameworks to relevant blog articles
  const blogLinks = {
    1: { text: "Problem Validation Guide", slug: "complete-guide-to-problem-validation" },
    2: { text: "Customer Interview Best Practices", slug: "customer-interview-best-practices" },
    3: { text: "Validate in 60 Minutes", slug: "validate-a-startup-idea-in-60-minutes" },
    4: { text: "Test Willingness to Pay", slug: "how-to-test-willingness-to-pay" },
  };

  // Combine frameworks and traditional templates into one list
  const allTemplates = [
    ...frameworks.map(f => ({
      ...f,
      type: "framework",
      downloadName: `${f.title.toLowerCase().replace(/\s+/g, "-")}.docx`,
      tint: categoryTintMap[f.category] || "blue",
      blogLink: blogLinks[f.id]
    })),
    ...traditionalTemplates.map(t => ({
      ...t,
      type: "template",
      tint: categoryTintMap[t.category] || "purple"
    }))
  ];

  // Get unique categories from all templates
  const allCategories = ["All", ...new Set(allTemplates.map(t => t.category).filter(Boolean))];

  const filteredTemplates = selectedCategory === "All" 
    ? allTemplates 
    : allTemplates.filter(template => template.category === selectedCategory);
  
  const breadcrumbs = generateBreadcrumbs(breadcrumbPatterns.resourcesTemplates);
  
  return (
    <MarketingLayout>
      <Seo {...seo} breadcrumbs={breadcrumbs} />

      <HeroSection data={heroData} />

      <section id="templates" className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--mkt-heading)" }}>Filter by Category</h3>
                <div className="space-y-2">
                  {allCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className="w-full text-left px-4 py-2 rounded-lg text-sm transition-all hover:bg-opacity-50"
                      style={{
                        background: category === selectedCategory ? "var(--mkt-primary)" : "var(--mkt-surface-muted)",
                        color: category === selectedCategory ? "white" : "var(--mkt-heading)"
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map((template, index) => (
                  <div
                    key={template.id || index}
                    onClick={() => {
                      setPreviewTemplate({
                        title: template.title,
                        downloadName: template.downloadName || `${template.title.toLowerCase().replace(/\s+/g, "-")}.docx`
                      });
                      setPreviewContent(template.content);
                    }}
                    className="cursor-pointer"
                  >
                    <FeatureCard
                      icon={template.icon}
                      title={template.title}
                      description={template.description}
                      tint={template.tint || "blue"}
                      eyebrow={template.category}
                      accentBorder
                    >
                      {template.blogLink && (
                        <div className="mb-4">
                          <Link
                            to={`/blog/${template.blogLink.slug}`}
                            className="text-sm text-accent hover:text-accent-hover font-medium"
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: "var(--mkt-primary)" }}
                          >
                            Use with: {template.blogLink.text} →
                          </Link>
                        </div>
                      )}
                      <UIButton
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTemplate({
                            title: template.title,
                            downloadName: template.downloadName || `${template.title.toLowerCase().replace(/\s+/g, "-")}.docx`
                          });
                          setPreviewContent(template.content);
                        }}
                        className="w-full mt-4"
                        style={{
                          background: "var(--mkt-surface)",
                          color: "var(--mkt-heading)",
                          border: "1px solid var(--mkt-outline)"
                        }}
                      >
                        Download Template
                      </UIButton>
                    </FeatureCard>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p style={{ color: "var(--mkt-paragraph)" }}>No templates found in this category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-4xl mx-auto px-6">
          <SectionTitle title="Why templates matter" subtitle="The hidden value of structured frameworks" center />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {whyTemplatesMatter.map((item, i) => (
              <div key={i} className="p-5 rounded-xl" style={{ background: "var(--mkt-surface-muted)", border: "1px solid var(--mkt-outline)" }}>
                <h4 className="font-semibold mb-3 text-sm" style={{ color: "var(--mkt-heading)" }}>{item.title}</h4>
                <p className="text-xs" style={{ color: "var(--mkt-paragraph)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-section mkt-section-gradient-blue">
        <div className="max-w-4xl mx-auto px-6">
          <SectionTitle title="How to Use These Templates" subtitle="Get the most out of our resources" center />
          <div 
            className="rounded-2xl p-10 mkt-card--floating"
            style={{
              background: "var(--mkt-surface)",
              boxShadow: "var(--mkt-layer-shadow)"
            }}
          >
            <div className="space-y-8">
              {howToUseSteps.map((item, index) => (
                <div key={index}>
                  <h3 className="mkt-h3 font-semibold mb-3" style={{ color: "var(--mkt-heading)" }}>{item.title}</h3>
                  <p className="mkt-body leading-relaxed" style={{ color: "var(--mkt-paragraph)" }}>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mkt-section-lg" style={{ background: "var(--mkt-surface)" }}>
        <CTASection {...ctaData} gradient />
      </section>

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
            const contentToDownload = fetchedContent || previewContent;
            
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
