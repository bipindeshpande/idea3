import { Link } from "react-router-dom";
import FeatureCard from "../marketing/FeatureCard.jsx";
import UIButton from "../ui/ui-button.jsx";
import ShareLinks from "./ShareLinks.jsx";

const tagTintMap = {
  "Validation": "blue",
  "Problem-Solution Fit": "green",
  "Guide": "orange",
  "Pricing": "purple",
  "Revenue": "yellow",
  "Interviews": "green",
  "Testing": "orange",
  "Discovery": "blue",
  "MVP": "yellow",
  "Development": "blue",
  "Customer Research": "green",
  "Framework": "orange",
  "Finance": "purple",
  "Planning": "green",
  "Product-Market Fit": "blue",
  "Metrics": "purple",
  "Analytics": "blue",
  "Pitch Deck": "orange",
  "Fundraising": "purple",
  "Checklist": "green",
  "Marketing": "purple",
  "Growth": "orange",
  "Acquisition": "blue",
  "Productivity": "green",
  "Time Management": "orange",
  "Investors": "purple",
  "AI": "blue",
  "Product": "green",
  "Side business": "orange",
  "Playbook": "purple",
};

const resourceLinks = {
  "complete-guide-to-problem-validation": { text: "Problem Validation Checklist", path: "/resources/templates" },
  "how-to-test-willingness-to-pay": { text: "Pricing Validation Method", path: "/resources/templates" },
  "customer-interview-best-practices": { text: "Customer Interview Script", path: "/resources/templates" },
  "validate-a-startup-idea-in-60-minutes": { text: "Landing Page Test Framework", path: "/resources/templates" },
  "how-to-build-mvp-in-30-days": { text: "MVP Prioritization Matrix", path: "/resources/templates" },
  "customer-discovery-framework": { text: "Customer Journey Map", path: "/resources/templates" },
  "startup-financial-modeling": { text: "Financial Projections Template", path: "/resources/templates" },
  "product-market-fit-guide": { text: "Value Proposition Canvas", path: "/resources/templates" },
  "startup-pitch-deck-template": { text: "Pitch Deck Template", path: "/resources/templates" },
  "startup-idea-validation-checklist": { text: "Problem Validation Checklist", path: "/resources/templates" },
  "customer-acquisition-strategies": { text: "Go-to-Market Strategy Template", path: "/resources/templates" },
  "startup-metrics-that-matter": { text: "Financial Projections Template", path: "/resources/templates" },
};

export default function BlogCard({ post, index = 0 }) {
  const tintColors = ["blue", "green", "orange", "purple", "yellow"];
  const tint = post.tags?.find(tag => tagTintMap[tag]) 
    ? tagTintMap[post.tags.find(tag => tagTintMap[tag])]
    : tintColors[index % tintColors.length];

  const resourceLink = resourceLinks[post.slug];

  return (
    <div className="w-full flex">
      <FeatureCard
        icon="📝"
        title={post.title}
        description={post.description}
        tint={tint}
        eyebrow={post.tags?.[0] || "Article"}
        accentBorder
        className="flex flex-col flex-1"
      >
        <div className="flex items-center justify-between text-xs text-secondary mb-4">
          <span>{new Date(post.date).toLocaleDateString()}</span>
          {resourceLink && (
            <Link
              to={resourceLink.path}
              className="text-xs font-medium hover:opacity-80"
              style={{ color: "var(--mkt-primary)" }}
              onClick={(e) => e.stopPropagation()}
            >
              Use with: {resourceLink.text} →
            </Link>
          )}
        </div>
        <div className="flex items-center justify-between gap-4 mt-auto">
          <UIButton 
            as={Link} 
            to={`/blog/${post.slug}`} 
            variant="secondary" 
            className="flex-1"
            style={{
              background: "var(--mkt-surface)",
              color: "var(--mkt-heading)",
              border: "1px solid var(--mkt-outline)"
            }}
          >
            Read article
          </UIButton>
          <ShareLinks title={post.title} slug={post.slug} />
        </div>
      </FeatureCard>
    </div>
  );
}

