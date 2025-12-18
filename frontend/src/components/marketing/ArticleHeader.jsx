/**
 * ArticleHeader - Premium blog article header with gradient background
 */
export default function ArticleHeader({
  title,
  author,
  date,
  image,
  category,
  className = "",
}) {
  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <header className={`relative overflow-hidden rounded-3xl mkt-pad-block ${className}`}>
      {/* Gradient background */}
      <div className="absolute inset-0 mkt-section-gradient-blue" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {category && (
          <span
            className="inline-block text-sm font-semibold uppercase tracking-wide mb-4 px-4 py-2 rounded-full"
            style={{ 
              color: "var(--mkt-primary)",
              background: "var(--mkt-card-blue)"
            }}
          >
            {category}
          </span>
        )}
        <h1
          className="mkt-h1 font-bold mb-6"
          style={{ color: "var(--mkt-heading)" }}
        >
          {title}
        </h1>
        <div className="flex items-center gap-4 mb-8">
          {author && (
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-semibold"
                style={{
                  background: "var(--mkt-primary)",
                  color: "white"
                }}
              >
                {author.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium" style={{ color: "var(--mkt-heading)" }}>
                {author}
              </span>
            </div>
          )}
          {formattedDate && (
            <>
              <span style={{ color: "var(--mkt-text-dim)" }}>•</span>
              <time style={{ color: "var(--mkt-text-dim)" }}>{formattedDate}</time>
            </>
          )}
        </div>
        {image && (
          <div className="aspect-video w-full rounded-2xl overflow-hidden" style={{ boxShadow: "var(--mkt-layer-shadow)" }}>
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </header>
  );
}
