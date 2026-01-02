import { useParams, Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import ArticleHeader from "../../components/marketing/ArticleHeader.jsx";
import ArticleBody from "../../components/marketing/ArticleBody.jsx";
import BlogCard from "../../components/marketing/BlogCard.jsx";
import SectionTitle from "../../components/marketing/SectionTitle.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";

// Sample blog articles - in production, this would come from an API or CMS
const blogArticles = {
  "how-to-validate-startup-idea": {
    slug: "how-to-validate-startup-idea",
    title: "How to Validate Your Startup Idea in 30 Days",
    author: "Ideabunch",
    date: "2024-01-15",
    category: "Validation",
    image: null,
    content: (
      <>
        <p>
          Validating your startup idea is crucial before investing significant time and money. Here's a comprehensive guide to validating your idea in just 30 days.
        </p>
        <h2>Week 1: Problem Validation</h2>
        <p>
          The first week is all about confirming that the problem you're solving is real and urgent. Start by identifying your target customer and conducting interviews.
        </p>
        <ul>
          <li>Interview at least 10 potential customers</li>
          <li>Ask about their current solutions and pain points</li>
          <li>Document willingness to pay</li>
        </ul>
        <h2>Week 2: Solution Validation</h2>
        <p>
          Once you've confirmed the problem exists, test whether your solution addresses it effectively. Create a simple prototype or mockup to get feedback.
        </p>
        <h2>Week 3: Market Validation</h2>
        <p>
          Assess the market size, competition, and your potential market share. Research similar products and identify your differentiation.
        </p>
        <h2>Week 4: Business Model Validation</h2>
        <p>
          Finalize your business model, pricing strategy, and unit economics. Create financial projections and test your pricing with potential customers.
        </p>
      </>
    ),
  },
  "finding-co-founder": {
    slug: "finding-co-founder",
    title: "How to Find the Right Co-Founder for Your Startup",
    author: "Mike Rodriguez",
    date: "2024-01-10",
    category: "Networking",
    image: null,
    content: (
      <>
        <p>
          Finding the right co-founder is one of the most important decisions you'll make as an entrepreneur. Here's how to find someone who complements your skills and shares your vision.
        </p>
        <h2>Know What You Need</h2>
        <p>
          Before you start looking, clearly define what skills, experience, and qualities you need in a co-founder. Be honest about your own strengths and weaknesses.
        </p>
        <h2>Where to Look</h2>
        <p>
          Explore various channels including founder networks, startup events, online communities, and professional networks. Don't limit yourself to just one source.
        </p>
        <h2>Evaluate Fit</h2>
        <p>
          Look beyond skills to assess cultural fit, work style compatibility, and shared values. Spend time working on a small project together before committing.
        </p>
        <h2>Legal Considerations</h2>
        <p>
          Once you've found a potential co-founder, establish clear agreements on equity, roles, responsibilities, and vesting schedules. Get it in writing.
        </p>
      </>
    ),
  },
};

const relatedArticles = [
  {
    slug: "how-to-validate-startup-idea",
    title: "How to Validate Your Startup Idea in 30 Days",
    excerpt: "A comprehensive guide to validating your idea quickly and effectively.",
    author: "Ideabunch",
    date: "2024-01-15",
    category: "Validation",
  },
  {
    slug: "finding-co-founder",
    title: "How to Find the Right Co-Founder",
    excerpt: "Tips for finding a co-founder who complements your skills and shares your vision.",
    author: "Mike Rodriguez",
    date: "2024-01-10",
    category: "Networking",
  },
];

export default function BlogArticlePage() {
  const { slug } = useParams();
  const article = blogArticles[slug] || blogArticles["how-to-validate-startup-idea"];

  // Filter out current article from related articles
  const filteredRelated = relatedArticles.filter(a => a.slug !== slug).slice(0, 3);

  // SEO metadata
  const seo = {
    title: `${article.title} | Startup Idea Advisor Blog`,
    description: `Read ${article.title} on the Startup Idea Advisor blog.`,
    keywords: ["startup blog", article.category.toLowerCase(), "entrepreneurship"],
    canonical: `/blog/${slug}`,
  };

  return (
    <MarketingLayout>
      <Seo {...seo} />

      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Article Header */}
        <ArticleHeader
          title={article.title}
          author={article.author}
          date={article.date}
          image={article.image}
          category={article.category}
          className="mb-16"
        />

        {/* Article Body */}
        <div className="mb-16">
          <ArticleBody>
            {article.content}
          </ArticleBody>
        </div>

        {/* Related Articles */}
        {filteredRelated.length > 0 && (
          <div className="mt-20">
            <SectionTitle
              title="Related Articles"
              subtitle="Continue reading"
              className="mb-8"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredRelated.map((related) => (
                <BlogCard key={related.slug} {...related} />
              ))}
            </div>
          </div>
        )}

        {/* Back to Blog */}
        <div className="mt-12 text-center">
          <Link
            to="/blog"
            className="text-lg font-semibold transition-colors"
            style={{ 
              color: "var(--mkt-primary)",
            }}
            onMouseEnter={(e) => e.target.style.color = "var(--mkt-primary-hover)"}
            onMouseLeave={(e) => e.target.style.color = "var(--mkt-primary)"}
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    </MarketingLayout>
  );
}
