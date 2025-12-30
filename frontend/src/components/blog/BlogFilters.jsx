export default function BlogFilters({ selectedTag, setSelectedTag, posts }) {
  const allTags = ["All", ...new Set(posts.flatMap(post => post.tags || []))];

  return (
    <div className="max-w-7xl mx-auto px-6 mb-8">
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-sm font-semibold" style={{ color: "var(--mkt-heading)" }}>Filter by Topic</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
              style={{
                background: tag === selectedTag ? "var(--mkt-primary)" : "var(--mkt-surface-muted)",
                color: tag === selectedTag ? "white" : "var(--mkt-heading)",
                border: "1px solid var(--mkt-outline)"
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

