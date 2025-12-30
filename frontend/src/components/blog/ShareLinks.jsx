export default function ShareLinks({ title, slug }) {
  const url = `https://startupideaadvisor.com/blog/${slug}`;
  const text = encodeURIComponent(`${title} - Startup Idea Advisor`);
  return (
    <div className="flex flex-wrap items-center gap-2 text-base">
      <span className="text-secondary">Share:</span>
      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${text}`}
        target="_blank"
        rel="noreferrer"
        className="whitespace-nowrap rounded-full border border-default bg-surface px-3 py-1 text-xs font-semibold text-accent shadow-sm transition hover:bg-surface-hover"
      >
        LinkedIn
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${text}`}
        target="_blank"
        rel="noreferrer"
        className="whitespace-nowrap rounded-full border border-default bg-surface px-3 py-1 text-xs font-semibold text-accent shadow-sm transition hover:bg-surface-hover"
      >
        X
      </a>
    </div>
  );
}

