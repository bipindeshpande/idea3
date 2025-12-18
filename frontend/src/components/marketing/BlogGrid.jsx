import BlogCard from "./BlogCard.jsx";

/**
 * BlogGrid - Responsive grid layout for blog posts
 */
export default function BlogGrid({ posts = [], className = "" }) {
  if (posts.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p style={{ color: "var(--mkt-subheading)" }}>No blog posts available.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {posts.map((post, index) => (
        <BlogCard key={post.slug || index} {...post} />
      ))}
    </div>
  );
}
