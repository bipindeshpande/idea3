/**
 * ArticleBody - Premium blog article body with beautiful prose styling
 */
export default function ArticleBody({ children, className = "" }) {
  return (
    <article
      className={`prose prose-lg max-w-none ${className}`}
      style={{
        color: "var(--mkt-paragraph)",
      }}
    >
      <style>{`
        .prose h1, .prose h2, .prose h3, .prose h4 {
          color: var(--mkt-heading);
          font-weight: 700;
          margin-top: 2em;
          margin-bottom: 1em;
        }
        .prose h2 {
          font-size: var(--mkt-h2);
        }
        .prose h3 {
          font-size: var(--mkt-h3);
        }
        .prose p {
          color: var(--mkt-paragraph);
          font-size: var(--mkt-body);
          line-height: 1.7;
          margin-bottom: 1.5em;
        }
        .prose ul, .prose ol {
          color: var(--mkt-paragraph);
          margin-bottom: 1.5em;
        }
        .prose li {
          margin-bottom: 0.5em;
        }
        .prose strong {
          color: var(--mkt-heading);
          font-weight: 600;
        }
        .prose a {
          color: var(--mkt-primary);
          text-decoration: underline;
        }
        .prose a:hover {
          color: var(--mkt-primary-hover);
        }
        .prose code {
          background: var(--mkt-surface-muted);
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-size: 0.9em;
        }
        .prose pre {
          background: var(--mkt-surface-muted);
          padding: 1.5em;
          border-radius: 8px;
          overflow-x: auto;
        }
      `}</style>
      {children}
    </article>
  );
}
