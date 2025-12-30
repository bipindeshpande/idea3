import { useState } from "react";
import { useParams } from "react-router-dom";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";
import { usePost } from "../../utils/blog/usePost.js";
import BlogArticle from "../../components/blog/BlogArticle.jsx";
import BlogList from "../../components/blog/BlogList.jsx";
import { posts } from "../../data/blog/posts.js";

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

  return (
    <MarketingLayout>
      <BlogList 
        posts={posts} 
        selectedTag={selectedTag} 
        setSelectedTag={setSelectedTag} 
      />
    </MarketingLayout>
  );
}
