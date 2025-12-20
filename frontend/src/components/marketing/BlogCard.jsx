import { Link } from "react-router-dom";

/**
 * BlogCard - Premium blog post preview card with image placeholder, tag, date, excerpt
 */
export default function BlogCard({
  slug,
  title,
  excerpt,
  author,
  date,
  image,
  category,
  className = "",
  animate,
}) {
  const animationClass = animate === "fade" ? " mkt-anim-fade" :
                         animate === "slide" ? " mkt-anim-slide" :
                         animate === "float" ? " mkt-anim-float" : "";
  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <Link
      to={`/blog/${slug}`}
      className={`block rounded-xl overflow-hidden transition-all duration-300 card-3d max-w-sm ${animationClass || ""} ${className}`}
      style={{
        background: "var(--mkt-surface)",
        border: "1px solid var(--mkt-outline)",
        transform: "translateZ(0)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateZ(0) scale(1.02)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateZ(0) scale(1)";
      }}
    >
      {image && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {!image && (
        <div 
          className="aspect-video w-full"
          style={{
            background: "linear-gradient(135deg, var(--mkt-card-primary), var(--mkt-card-secondary))"
          }}
        />
      )}
      <div className="p-4">
        {category && (
          <span
            className="inline-block text-xs font-semibold uppercase tracking-wide mb-2 px-2 py-1 rounded-full"
            style={{ 
              color: "var(--mkt-primary)",
              background: "var(--mkt-card-primary)"
            }}
          >
            {category}
          </span>
        )}
        <h3
          className="text-lg font-semibold mb-2 line-clamp-2"
          style={{ color: "var(--mkt-heading)" }}
        >
          {title}
        </h3>
        {excerpt && (
          <p
            className="text-sm mb-3 line-clamp-3 leading-relaxed"
            style={{ color: "var(--mkt-paragraph)" }}
          >
            {excerpt}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm" style={{ color: "var(--mkt-text-dim)" }}>
          {author && <span>{author}</span>}
          {formattedDate && <span>•</span>}
          {formattedDate && <span>{formattedDate}</span>}
        </div>
      </div>
    </Link>
  );
}
