import { useParams } from "react-router-dom";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";
import { usePost } from "../../utils/blog/usePost.js";
import BlogArticle from "../../components/blog/BlogArticle.jsx";

export default function BlogArticlePage() {
  const { slug } = useParams();
  const post = usePost(slug);

  if (!post) {
    return (
      <MarketingLayout>
        <div className="max-w-4xl mx-auto px-6 py-20">
          <h1>Article Not Found</h1>
          <p>The blog post you're looking for doesn't exist.</p>
        </div>
      </MarketingLayout>
    );
  }

  return (
    <MarketingLayout>
      <BlogArticle post={post} />
    </MarketingLayout>
  );
}
