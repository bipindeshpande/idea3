import { NavLink } from "react-router-dom";
import UIHeading from "../ui/ui-heading.jsx";

const footerLinks = {
 "Product": [
 { label: "Validate Your Idea", to: "/validate-idea" },
 { label: "Discover Ideas", to: "/advisor" },
 { label: "Founder Connect", to: "/founder-connect" },
 ],
 "Resources": [
 { label: "Startup Frameworks", to: "/frameworks" },
 { label: "Resources Library", to: "/resources" },
 { label: "Blog & Playbooks", to: "/blog" },
 ],
 "Company": [
 { label: "About Us", to: "/about" },
 { label: "Contact", to: "/contact" },
 { label: "Pricing", to: "/pricing" },
 ],
 "Legal": [
 { label: "Privacy Policy", to: "/privacy" },
 { label: "Terms of Service", to: "/terms" },
 ],
};

export default function Footer() {
 return (
 <footer className="mt-20 border-t border-default bg-surface backdrop-blur-sm relative overflow-hidden">
 <div className="absolute top-0 left-0 marketing-blob marketing-blob--small opacity-20" />
 <div className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-8">
 <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6 lg:gap-12">
 {/* Company Info */}
 <div className="col-span-2 lg:col-span-2 space-y-4">
 <UIHeading level="h4" className="text-primary font-bold">Idea Bunch</UIHeading>
 <p className="text-base leading-relaxed text-secondary max-w-sm">
 An AI-powered companion that helps professionals surface, validate, and prioritize startup ideas matched to their strengths.
 </p>
 <div className="flex items-center gap-4 pt-2">
 <a
 href="https://www.linkedin.com/company/startup-idea-advisor"
 target="_blank"
 rel="noreferrer"
 className="text-secondary hover:text-accent transition-colors"
 aria-label="LinkedIn"
 >
 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
 </svg>
 </a>
 <a
 href="https://twitter.com/startupideaAI"
 target="_blank"
 rel="noreferrer"
 className="text-secondary hover:text-accent transition-colors"
 aria-label="Twitter"
 >
 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
 </svg>
 </a>
 <a
 href="mailto:hello@ideabunch.com"
 className="text-secondary hover:text-accent transition-colors"
 aria-label="Email"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
 </svg>
 </a>
 </div>
 </div>
 {/* Footer Links */}
 {Object.entries(footerLinks).map(([group, links]) => (
 <div key={group} className="space-y-3">
 <UIHeading level="h4" className="text-base font-semibold text-primary mb-3">{group}</UIHeading>
 <ul className="space-y-2">
 {links.map(({ label, to }) => (
 <li key={label}>
 <NavLink
 to={to}
 className="text-base text-secondary hover:text-accent transition-colors"
 >
 {label}
 </NavLink>
 </li>
 ))} 
 </ul>
 </div>
 ))}
 </div>
 <div className="border-t border-default mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
 <p className="text-sm text-secondary">
 © {new Date().getFullYear()} Idea Bunch. All rights reserved.
 </p>
 <div className="flex items-center gap-6 text-sm text-secondary">
 <NavLink to="/privacy" className="hover:text-accent transition-colors">Privacy</NavLink>
 <NavLink to="/terms" className="hover:text-accent transition-colors">Terms</NavLink>
 </div>
 </div>
 </div>
 </footer>
 );
}

