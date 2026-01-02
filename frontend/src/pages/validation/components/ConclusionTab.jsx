import ReactMarkdown from "react-markdown";

export default function ConclusionTab({ finalConclusion }) {
  if (!finalConclusion) return null;

  return (
    <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
      <div className="prose prose-slate max-w-none">
        <ReactMarkdown
          components={{
            h2: ({ node, ...props }) => (
              <h2 className="text-lg font-semibold text-primary flex items-center gap-2 mb-4 mt-6" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2 mb-3 mt-4" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="text-primary text-primary text-secondary leading-relaxed mb-3" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc list-outside space-y-2 text-primary text-secondary mb-4 ml-6" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="leading-relaxed text-primary text-secondary" {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong className="font-semibold text-primary text-secondary" {...props} />
            ),
          }}
        >
          {finalConclusion}
        </ReactMarkdown>
      </div>
    </div>
  );
}

