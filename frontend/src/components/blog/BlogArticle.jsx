import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Seo from "../common/Seo.jsx";
import PageHeader from "../layout/PageHeader.jsx";
import Card from "../ui/Card.jsx";
import UIHeading from "../ui/ui-heading.jsx";
import FeatureCard from "../marketing/FeatureCard.jsx";
import UIButton from "../ui/ui-button.jsx";
import ShareLinks from "./ShareLinks.jsx";
import { calculateReadingTime, getRelatedPosts } from "../../utils/blog/blogUtils.js";
import { posts } from "../../data/blog/posts.js";

const tagTintMap = {
  "Validation": "blue",
  "Problem-Solution Fit": "green",
  "Guide": "orange",
  "Pricing": "purple",
  "Revenue": "yellow",
  "Interviews": "green",
  "Testing": "orange",
  "Discovery": "blue",
};

const resourceLinks = {
  "complete-guide-to-problem-validation": { text: "Problem Validation Checklist", path: "/resources/templates" },
  "how-to-test-willingness-to-pay": { text: "Pricing Validation Method", path: "/resources/templates" },
  "customer-interview-best-practices": { text: "Customer Interview Script", path: "/resources/templates" },
  "validate-a-startup-idea-in-60-minutes": { text: "Landing Page Test Framework", path: "/resources/templates" },
};

export default function BlogArticle({ post }) {
  const readingTime = calculateReadingTime(post.body);
  const relatedPosts = getRelatedPosts(post, posts, 3);
  const resourceLink = resourceLinks[post.slug];

  // Article structured data for SEO
  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: `https://ideabunch.com/og-image.jpg`, // Update with actual article images if available
    datePublished: post.date,
    dateModified: post.date, // Update if you track modification dates
    author: {
      "@type": "Organization",
      name: "Startup Idea Advisor",
      url: "https://ideabunch.com"
    },
    publisher: {
      "@type": "Organization",
      name: "Startup Idea Advisor",
      url: "https://ideabunch.com",
      logo: {
        "@type": "ImageObject",
        url: "https://ideabunch.com/logo.png"
      }
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://ideabunch.com/blog/${post.slug}`
    },
    articleSection: post.tags?.[0] || "Startup",
    keywords: post.tags?.join(", ") || "",
    timeRequired: `PT${readingTime}M`
  };

  // Breadcrumb structured data
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://ideabunch.com"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://ideabunch.com/blog"
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://ideabunch.com/blog/${post.slug}`
      }
    ]
  };

  return (
    <Card>
      <Seo
        title={`${post.title} | Startup Idea Advisor`}
        description={post.description}
        path={`/blog/${post.slug}`}
        keywords={`startup ideas, ${post.tags.join(", ")}`}
        type="article"
        structuredData={articleStructuredData}
        breadcrumbs={breadcrumbStructuredData}
      />
      <div className="mb-6">
        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-secondary">
          <span>{new Date(post.date).toLocaleDateString()}</span>
          {readingTime > 0 && (
            <>
              <span>•</span>
              <span>{readingTime} min read</span>
            </>
          )}
        </div>
        <PageHeader title={post.title} className="mt-2" />
      </div>
      <ShareLinks title={post.title} slug={post.slug} />
      
      {/* Resource Links */}
      {resourceLink && (
        <div className="mt-6 p-4 bg-surface-muted border border-default rounded-lg">
          <p className="text-base font-medium text-secondary mb-2">Use this guide with:</p>
          <Link
            to={resourceLink.path}
            className="text-base text-accent hover:text-accent-hover font-semibold"
          >
            {resourceLink.text} →
          </Link>
        </div>
      )}
      
      <div className="prose mt-8 max-w-none">
        <ReactMarkdown>{post.body}</ReactMarkdown>
      </div>
      <div className="mt-8 flex items-center justify-between border-t border-default pt-6 text-base">
        <Link
          to="/blog"
          className="font-semibold text-accent hover:text-accent"
        >
          ← Back to blog
        </Link>
        <div className="flex gap-4">
          <Link
            to="/resources/templates"
            className="font-semibold text-accent hover:text-accent"
          >
            View resources
          </Link>
          <Link
            to="/advisor"
            className="font-semibold text-accent hover:text-accent"
          >
            Run a new idea →
          </Link>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-12 pt-8 border-t border-default">
          <UIHeading level="h3" className="text-primary mb-4">Related Posts</UIHeading>
          <div className="grid gap-4 md:grid-cols-3 auto-rows-fr">
            {relatedPosts.map((relatedPost, index) => {
              const tintColors = ["blue", "green", "orange", "purple", "yellow"];
              const tint = relatedPost.tags?.find(tag => tagTintMap[tag]) 
                ? tagTintMap[relatedPost.tags.find(tag => tagTintMap[tag])]
                : tintColors[index % tintColors.length];

              return (
                <div key={relatedPost.slug} className="w-full flex">
                  <FeatureCard
                    icon="📝"
                    title={relatedPost.title}
                    description={relatedPost.description}
                    tint={tint}
                    eyebrow={relatedPost.tags?.[0] || "Article"}
                    accentBorder
                    className="flex flex-col flex-1"
                  >
                    <div className="text-xs text-secondary mb-4">
                      {new Date(relatedPost.date).toLocaleDateString()}
                    </div>
                    <div className="mt-auto">
                      <UIButton
                        as={Link}
                        to={`/blog/${relatedPost.slug}`}
                        variant="secondary"
                        className="w-full"
                        style={{
                          background: "var(--mkt-surface)",
                          color: "var(--mkt-heading)",
                          border: "1px solid var(--mkt-outline)"
                        }}
                      >
                        Read article
                      </UIButton>
                    </div>
                  </FeatureCard>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}

