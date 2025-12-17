import { Link } from "react-router-dom";

const updates = [
 {
 id: 1,
 date: "2025-01-15",
 title: "Tabbed Report Interface",
 description: "Reports now use a cleaner tabbed interface for easier navigation and reduced scrolling.",
 type: "improvement",
 link: "/results/recommendations",
 },
 {
 id: 2,
 date: "2025-01-15",
 title: "Enhanced Validation Results",
 description: "Improved validation parameters display with visual cards and better organization.",
 type: "improvement",
 link: "/validate-idea",
 },
 {
 id: 3,
 date: "2025-01-15",
 title: "Profile Analysis Updates",
 description: "All sections now start folded for a cleaner view. Reports notification added.",
 type: "improvement",
 link: "/results/profile",
 },
];

export default function WhatsNew() {
 const recentUpdates = updates.slice(0, 3);

 return (
 <div className="rounded-2xl border border-default bg-surface p-6 shadow-sm">
 <div className="mb-4 flex items-center justify-between">
 <h2 className="text-lg font-semibold text-primary">What's New</h2>
 <span className="text-xs text-secondary">Recent updates</span>
 </div>
 <div className="space-y-4">
 {recentUpdates.map((update) => (
 <div key={update.id} className="border-b border-default pb-4 last:border-0 last:pb-0">
 <div className="mb-1 flex items-center gap-2">
 <span
 className={`rounded-full px-2 py-0.5 text-xs font-medium ${
 update.type === "feature"
 ? "bg-surface text-accent"
 : "bg-app text-primary"
 }`}
 >
 {update.type === "feature" ? "New" : "Update"}
 </span>
 <span className="text-xs text-secondary">{update.date}</span>
 </div>
 <h3 className="mb-1 text-sm font-semibold text-primary">{update.title}</h3>
 <p className="text-sm text-secondary">{update.description}</p>
 {update.link && (
 <Link
 to={update.link}
 className="mt-2 inline-block text-xs font-medium text-accent hover:text-accent"
 >
 Learn more →
 </Link>
 )}
 </div>
 ))}
 </div>
 </div>
 );
}

