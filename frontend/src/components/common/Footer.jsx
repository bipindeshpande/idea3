import { NavLink } from "react-router-dom";

const footerLinks = {
 "Get Started": [
 { label: "Validate Your Idea", to: "/validate-idea" },
 { label: "Discover Ideas", to: "/advisor" },
 ],
 "Resources": [
 { label: "Startup Frameworks", to: "/frameworks" },
 { label: "Resources Library", to: "/resources" },
 { label: "Blog & Playbooks", to: "/blog" },
 ],
 "Company": [
 { label: "About Us", to: "/about" },
 { label: "Contact", to: "/contact" },
 { label: "Privacy Policy", to: "/privacy" },
 { label: "Terms", to: "/terms" },
 ],
};

export default function Footer() {
 return (
 <footer className="mt-6 border-t border-default bg-surface backdrop-blur-sm">
 <div className="mx-auto max-w-6xl px-6 pt-6 pb-8">
 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1fr] lg:gap-6 items-start">
 <div className="space-y-3">
 <p className="text-lg font-bold text-primary whitespace-nowrap">Idea Bunch</p>
 <p className="text-sm leading-relaxed text-secondary">
 An AI-powered companion that helps professionals surface, validate, and prioritize startup ideas matched to their strengths.
 </p>
 </div>
 {Object.entries(footerLinks).map(([group, links]) => (
 <div key={group} className="space-y-3 text-center">
 <p className="text-sm font-semibold uppercase tracking-wide text-secondary">{group}</p>
 <ul className="space-y-2 text-sm text-secondary">
 {links.map(({ label, to }) => (
 <li key={label}>
 <NavLink className="hover:text-accent-hover" to={to}>
 {label}
 </NavLink>
 </li>
 ))}
 </ul>
 </div>
 ))}
 <div className="space-y-3 text-center">
 <p className="text-sm font-semibold uppercase tracking-wide text-secondary">
 Stay in the loop
 </p>
 <ul className="space-y-2 text-sm text-secondary">
 <li>
 <a href="https://www.linkedin.com/company/startup-idea-advisor" target="_blank" rel="noreferrer" className="hover:text-accent-hover transition-colors">
 LinkedIn
 </a>
 </li>
 <li>
 <a href="https://twitter.com/startupideaAI" target="_blank" rel="noreferrer" className="hover:text-accent-hover transition-colors">
 X
 </a>
 </li>
 <li>
 <a href="mailto:hello@ideabunch.com" className="hover:text-accent-hover transition-colors">Email</a>
 </li>
 </ul>
 </div>
 </div>
 </div>
 <div className="border-t border-default py-5 text-center text-xs text-secondary">
 © {new Date().getFullYear()} Idea Bunch. All rights reserved.
 </div>
 </footer>
 );
}

