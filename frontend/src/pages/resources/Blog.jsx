import { useState } from "react";
import { useParams } from "react-router-dom";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";
import { usePost } from "../../utils/blog/usePost.js";
import BlogArticle from "../../components/blog/BlogArticle.jsx";
import BlogList from "../../components/blog/BlogList.jsx";
import { posts } from "../../data/blog/posts.js";
import Seo from "../../components/common/Seo.jsx";
import { generateBreadcrumbs, breadcrumbPatterns } from "../../utils/seo/breadcrumbs.js";

export default function BlogPage() {
  const { slug } = useParams();
  const post = usePost(slug);
  const [selectedTag, setSelectedTag] = useState("All");

  if (post) {
    return (
      <MarketingLayout>
        <BlogArticle post={post} />
      </MarketingLayout>
    );
  }

  const breadcrumbs = generateBreadcrumbs(breadcrumbPatterns.blog);

  return (
    <MarketingLayout>
      <Seo
        title="Blog | Startup Idea Advisor"
        description="Learn how to validate startup ideas, find co-founders, and build successful startups with our comprehensive guides and frameworks."
        path="/blog"
        keywords="startup blog, entrepreneurship, idea validation, startup guides, founder resources"
        breadcrumbs={breadcrumbs}
      />
      <BlogList 
        posts={posts} 
        selectedTag={selectedTag} 
        setSelectedTag={setSelectedTag} 
      />
    </MarketingLayout>
  );
}
