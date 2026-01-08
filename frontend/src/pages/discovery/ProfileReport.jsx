import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useReports } from "../../context/ReportsContext.jsx";
import { extractProfileJSON } from "../../utils/parsers/index.js";
import Seo from "../../components/common/Seo.jsx";
import UIHeading from "../../components/ui/ui-heading.jsx";
import FocusLayout from "../../layouts/FocusLayout.jsx";

function useQuery() {
 return new URLSearchParams(useLocation().search);
}

function useDarkMode() {
 const [isDark, setIsDark] = useState(false);
 
 useEffect(() => {
 const checkDarkMode = () => {
 setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
 };
 
 // Initial check
 checkDarkMode();
 
 // Watch for changes using MutationObserver
 const observer = new MutationObserver(checkDarkMode);
 observer.observe(document.documentElement, {
 attributes: true,
 attributeFilter: ['data-theme'],
 });
 
 return () => observer.disconnect();
 }, []);
 
 return isDark;
}

function parseProfileSections(text = "") {
 if (!text) return [];

 // Check if text is too short to contain complete profile data
 const MIN_PROFILE_LENGTH = 100; // Minimum reasonable length for profile JSON
 if (text.length < MIN_PROFILE_LENGTH) {
 // Data is incomplete - don't show error, just return empty
 return [];
 }

 // Use contract-compliant parser to extract profile JSON
 const profileData = extractProfileJSON(text);
 
 if (!profileData) {
 // Only log warning if we have enough data but parsing failed
 if (text.length >= MIN_PROFILE_LENGTH) {
 console.warn("parseProfileSections - Could not extract profile JSON", {
 textLength: text.length,
 hasStartDelimiter: text.includes("---PROFILE_ANALYSIS_START---"),
 hasEndDelimiter: text.includes("---PROFILE_ANALYSIS_END---"),
 });
 }
 return [];
 }
 
 // Helper function to format text as bullet points
 const formatAsBullets = (text) => {
 if (!text) return [];
 
 // If already formatted as bullets, split by newlines
 if (text.includes("- ") || text.includes("* ") || text.includes("• ")) {
 return text.split(/\n+/)
 .map(line => line.trim())
 .filter(line => line.length > 0)
 .map(line => {
 // Normalize bullet format
 line = line.replace(/^[*•]\s+/, "- ");
 if (!line.startsWith("- ")) {
 line = "- " + line;
 }
 return line;
 });
 }
 
 // Split by newlines, periods, semicolons, or commas
 const lines = text
 .split(/[\n.;]+/)
 .map(line => line.trim())
 .filter(line => line.length > 0);
 
 return lines.map(line => {
 line = line.replace(/\.$/, ""); // Remove trailing period
 return `- ${line}`;
 });
 };
 
 // Render the six fields as text sections
 const sections = [];
 
 if (profileData.core_motivations) {
 sections.push({
 title: "Core Motivations",
 level: 2,
 content: formatAsBullets(profileData.core_motivations),
 subsections: [],
 });
 }
 
 if (profileData.operating_constraints) {
 sections.push({
 title: "Operating Constraints",
 level: 2,
 content: formatAsBullets(profileData.operating_constraints),
 subsections: [],
 });
 }
 
 if (profileData.strengths_and_capabilities) {
 sections.push({
 title: "Strengths and Capabilities",
 level: 2,
 content: formatAsBullets(profileData.strengths_and_capabilities),
 subsections: [],
 });
 }
 
 if (profileData.strategic_considerations) {
 sections.push({
 title: "Strategic Considerations",
 level: 2,
 content: formatAsBullets(profileData.strategic_considerations),
 subsections: [],
 });
 }
 
 if (profileData.viability_red_flags) {
 sections.push({
 title: "Viability Red Flags",
 level: 2,
 content: formatAsBullets(profileData.viability_red_flags),
 subsections: [],
 });
 }
 
 if (profileData.pathway_recommendation) {
 sections.push({
 title: "Pathway Recommendation",
 level: 2,
 content: formatAsBullets(profileData.pathway_recommendation),
 subsections: [],
 });
 }
 
 return sections;
}

function getSectionTheme(title = "", index = 0, isDark = false) {
 const lowerTitle = title.toLowerCase();
 
 // Core Motivations (Section 1) - bg-surface
 if (lowerTitle.includes("motivation") || lowerTitle.includes("goal") || lowerTitle.includes("objective")) {
 return {
 icon: "🎯",
 bg: isDark ? "#1e1b4b" : "rgba(238, 242, 255, 0.1)", // indigo-50 with opacity-10
 bgFull: isDark ? "#312e81" : "#EEF2FF", // Full opacity for header
 border: isDark ? "#6366f1" : "#C7D2FE",
 headerBg: isDark ? "#312e81" : "rgba(238, 242, 255, 0.2)", // indigo-50 opacity-20
 headerBgHover: isDark ? "#4338ca" : "rgba(238, 242, 255, 0.3)", // opacity-30 on hover
 text: "text-secondary",
 };
 }
 
 // Operating Constraints (Section 2) - bg-surface
 if (lowerTitle.includes("constraint")) {
 return {
 icon: "📋",
 bg: isDark ? "#1e3a5f" : "rgba(239, 246, 255, 0.1)", // blue-50 with opacity-10
 bgFull: isDark ? "#1e40af" : "#EFF6FF", // Full opacity for header
 border: isDark ? "#3b82f6" : "#BFDBFE",
 headerBg: isDark ? "#1e40af" : "rgba(239, 246, 255, 0.2)", // blue-50 opacity-20
 headerBgHover: isDark ? "#2563eb" : "rgba(239, 246, 255, 0.3)", // opacity-30 on hover
 text: "text-secondary",
 };
 }
 
 // Strengths and Capabilities (Section 3) - bg-purple-50
 if (lowerTitle.includes("strength") || lowerTitle.includes("capabilit")) {
 return {
 icon: "💪",
 bg: isDark ? "#3e1b5f" : "rgba(250, 245, 255, 0.1)", // purple-50 with opacity-10
 bgFull: isDark ? "#6b21a8" : "#FAF5FF", // Full opacity for header
 border: isDark ? "#9333ea" : "#F3E8FF",
 headerBg: isDark ? "#6b21a8" : "rgba(250, 245, 255, 0.2)", // purple-50 opacity-20
 headerBgHover: isDark ? "#7c3aed" : "rgba(250, 245, 255, 0.3)", // opacity-30 on hover
 text: "text-secondary",
 };
 }
 
 // Strategic Considerations (Section 4) - bg-sky-50
 if (lowerTitle.includes("strategic") || lowerTitle.includes("consideration")) {
 return {
 icon: "🧭",
 bg: isDark ? "#0c4a6e" : "rgba(240, 249, 255, 0.1)", // sky-50 with opacity-10
 bgFull: isDark ? "#075985" : "#F0F9FF", // Full opacity for header
 border: isDark ? "#0284c7" : "#BAE6FD",
 headerBg: isDark ? "#075985" : "rgba(240, 249, 255, 0.2)", // sky-50 opacity-20
 headerBgHover: isDark ? "#0369a1" : "rgba(240, 249, 255, 0.3)", // opacity-30 on hover
 text: "text-secondary",
 };
 }
 
 // Viability Red Flags (Section 5) - bg-surface
 if (lowerTitle.includes("red flag") || lowerTitle.includes("viability")) {
 return {
 icon: "⚠️",
 bg: isDark ? "#451a03" : "rgba(255, 251, 235, 0.1)", // amber-50 with opacity-10
 bgFull: isDark ? "#78350f" : "#FFFBEB", // Full opacity for header
 border: isDark ? "#f59e0b" : "#FDE68A",
 headerBg: isDark ? "#78350f" : "rgba(255, 251, 235, 0.2)", // amber-50 opacity-20
 headerBgHover: isDark ? "#92400e" : "rgba(255, 251, 235, 0.3)", // opacity-30 on hover
 text: "text-secondary",
 };
 }
 
 // Pathway Recommendation (Section 6) - bg-green-50
 if (lowerTitle.includes("pathway") || lowerTitle.includes("recommendation")) {
 return {
 icon: "🚀",
 bg: isDark ? "#064e3b" : "rgba(240, 253, 244, 0.1)", // green-50 with opacity-10
 bgFull: isDark ? "#065f46" : "#F0FDF4", // Full opacity for header
 border: isDark ? "#10b981" : "#D1FAE5",
 headerBg: isDark ? "#065f46" : "rgba(240, 253, 244, 0.2)", // green-50 opacity-20
 headerBgHover: isDark ? "#047857" : "rgba(240, 253, 244, 0.3)", // opacity-30 on hover
 text: "text-secondary",
 };
 }
 
 // Fallback (should not be reached)
 return {
 icon: "📋",
 bg: isDark ? "#1A2333" : "rgba(239, 246, 255, 0.1)",
 bgFull: isDark ? "#1e40af" : "#EFF6FF",
 border: isDark ? "#3b82f6" : "#BFDBFE",
 headerBg: isDark ? "#1e40af" : "rgba(239, 246, 255, 0.2)",
 headerBgHover: isDark ? "#2563eb" : "rgba(239, 246, 255, 0.3)",
 text: "text-secondary",
 };
}

function SuccessBanner({ runId }) {
 const isDark = useDarkMode();
 
 const bgColor = isDark ? "#0B3A37" : "rgba(236, 253, 245, 0.8)";
 const borderColor = isDark ? "#1ABC9C" : "#10b981";
 const textColor = isDark ? "#1ABC9C" : "#065f46";
 const textColorLight = isDark ? "#4FD1B5" : "#047857";
 const linkHoverColor = isDark ? "#5FE5C8" : "#059669";
 
 return (
 <div 
 className="mb-6 rounded-xl border p-4 shadow-sm"
 style={{
 backgroundColor: bgColor,
 borderColor: borderColor,
 }}
 >
 <div className="flex items-start gap-3">
 <span className="text-xl flex-shrink-0">✨</span>
 <div>
 <p 
 className="font-semibold text-base mb-1"
 style={{ color: textColor }}
 >
 Your personalized reports are ready!
 </p>
 <p 
 className="text-xs"
 style={{ color: textColorLight }}
 >
 View your <a 
 href={`/results/recommendations${runId ? `?id=${runId}` : ''}`} 
 className="underline font-medium transition-colors"
 style={{ 
 color: textColor,
 }}
 onMouseEnter={(e) => {
 e.currentTarget.style.color = linkHoverColor;
 }}
 onMouseLeave={(e) => {
 e.currentTarget.style.color = textColor;
 }}
 >
 startup recommendations
 </a> and detailed analysis reports.
 </p>
 </div>
 </div>
 </div>
 );
}

function Section({ section, theme, sectionNumber, isOpen, onToggle }) {
 return (
 <div
 className="rounded-xl border shadow-sm overflow-hidden flex flex-col gap-2 w-full border-default"
 style={{
 backgroundColor: theme.bg,
 borderColor: theme.border,
 }}
 >
 <button
 onClick={onToggle}
 className="w-full flex items-center justify-between gap-3 px-6 py-4 border-b-2 transition-colors"
 style={{
 backgroundColor: theme.headerBg,
 borderColor: theme.border,
 }}
 onMouseEnter={(e) => {
 e.currentTarget.style.backgroundColor = theme.headerBgHover;
 }}
 onMouseLeave={(e) => {
 e.currentTarget.style.backgroundColor = theme.headerBg;
 }}
 >
 <div className="flex items-center gap-2">
 <span className="text-xl">{theme.icon}</span>
 <UIHeading level="h2" className="text-primary flex items-center gap-2 text-left text-lg font-semibold">
 {section.title}
 </UIHeading>
 </div>
 <span className={`w-5 h-5 text-secondary transition ${isOpen ? "rotate-180" : ""}`}>
 ▼
 </span>
 </button>
 
 {isOpen && (
 <div className="p-6 md:p-7 space-y-5 bg-surface">
 {section.content && section.content.length > 0 && (
 <div className="text-base text-primary leading-relaxed">
 <ul className="list-disc list-outside space-y-2.5 ml-6">
 {section.content.map((item, idx) => (
 <li key={idx} className="text-base leading-relaxed pl-1">
 {item.replace(/^-\s+/, "")}
 </li>
 ))}
 </ul>
 </div>
 )}
 
 {(!section.content || section.content.length === 0) && (
 <p className="text-base text-secondary italic">No content available for this section</p>
 )}
 </div>
 )}
 </div>
 );
}

// Sample profile analysis data (JSON format)
const SAMPLE_PROFILE_ANALYSIS = `---PROFILE_ANALYSIS_START---
{
 "core_motivations": "You're looking to generate extra income while maintaining flexibility. Your interest in technology and automation suggests you value efficiency and scalable solutions.",
 "operating_constraints": "- Time: Limited to ≤ 5 hours/week, requiring solutions that can be built and managed part-time\n- Budget: Working with a lean budget, prioritizing cost-effective tools and strategies\n- Work style: Prefer structured, systematic approaches that allow for incremental progress",
 "strengths_and_capabilities": "- Technical skills enable rapid prototyping and iteration\n- Understanding of product development and user needs\n- Ability to work independently and systematically",
 "strategic_considerations": "- Focus on ideas that can be validated quickly with minimal investment\n- Have clear monetization paths\n- Leverage your existing skills and knowledge\n- Can scale without requiring full-time commitment initially",
 "viability_red_flags": "- Limited time commitment may restrict growth potential\n- Lean budget requires careful cost management\n- Part-time approach may limit customer acquisition speed",
 "pathway_recommendation": "Start with a low-cost digital product or SaaS tool that leverages your technical skills. Validate with a minimal viable product (MVP) within your time constraints, then gradually scale based on market response."
}
---PROFILE_ANALYSIS_END---`;

export default function ProfileReport() {
 const { reports, loadRunById } = useReports();
 const query = useQuery();
 const runId = query.get("id");
 const isSample = query.get("sample") === "true";
 const [openSections, setOpenSections] = useState(new Set());
 const isDark = useDarkMode();

 useEffect(() => {
 // Only load if not in sample mode
 if (!isSample && runId) {
 loadRunById(runId);
 }
 }, [runId, isSample, loadRunById]);

 // Use sample data if in sample mode
 let effectiveProfileAnalysis = isSample ? SAMPLE_PROFILE_ANALYSIS : reports?.profile_analysis;

 const sections = useMemo(() => {
 if (!effectiveProfileAnalysis) {
 return [];
 }
 
 const parsed = parseProfileSections(effectiveProfileAnalysis);
 return parsed;
 }, [effectiveProfileAnalysis]);

 const toggleSection = (sectionIndex) => {
 setOpenSections((prev) => {
 const next = new Set(prev);
 if (next.has(sectionIndex)) {
 next.delete(sectionIndex);
 } else {
 next.add(sectionIndex);
 }
 return next;
 });
 };

 return (
 <FocusLayout title="Profile Analysis">
 <section className="grid gap-6">
 <Seo
 title="Profile Analysis Report | Startup Idea Advisor"
 description="Detailed analysis of your entrepreneurial profile generated by our AI advisor."
 path="/results/profile"
 />
 
 {isSample && (
 <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 text-center">
 <p className="text-base text-primary leading-relaxed">
 📋 Sample Profile Analysis — This is a demonstration of what you'll receive
 </p>
 </div>
 )}

 <article className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 relative">
 <div className="absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-surface opacity-[0.09] blur-2xl pointer-events-none"></div>
 <div className="relative z-10">
 <div className="flex items-center justify-between mb-4">
 <div>
 <UIHeading level="h1" className="text-primary mb-2 text-3xl md:text-4xl font-semibold">Profile Analysis</UIHeading>
 <p className="text-base text-secondary leading-relaxed mb-8">
 Comprehensive analysis of your entrepreneurial profile, strengths, and opportunities
 </p>
 </div>
 {isSample && (
 <Link 
 to="/product" 
 className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent transition-colors"
 >
 <span aria-hidden="true">←</span> Back to product
 </Link>
 )}
 </div>
 
 {!isSample && reports?.personalized_recommendations && reports.personalized_recommendations.trim() && (
 <SuccessBanner runId={runId} />
 )}
 
 {!effectiveProfileAnalysis ? (
 <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
 <p className="text-base text-primary leading-relaxed">No profile analysis available. Please run a new analysis first.</p>
 </div>
 ) : sections.length === 0 ? (
 <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
 <p className="text-base text-primary leading-relaxed mb-4">Could not parse profile analysis JSON. Expected format with delimiters:</p>
 <pre className="text-sm text-secondary bg-app p-3 rounded overflow-auto max-h-64 font-mono">
 ---PROFILE_ANALYSIS_START---{'\n'}
 {'{'}{'\n'}
 {' "core_motivations": "...",'}{'\n'}
 {' "operating_constraints": "...",'}{'\n'}
 {' "strengths_and_capabilities": "...",'}{'\n'}
 {' "strategic_considerations": "...",'}{'\n'}
 {' "viability_red_flags": "...",'}{'\n'}
 {' "pathway_recommendation": "..."'}{'\n'}
 {'}'}{'\n'}
 ---PROFILE_ANALYSIS_END---
 </pre>
 <p className="text-sm mt-4 text-secondary">
 Raw content length: {effectiveProfileAnalysis?.length || 0} characters
 </p>
 </div>
 ) : (
 <div className="grid gap-4">
 {sections.map((section, index) => {
 const theme = getSectionTheme(section.title, index, isDark);
 const sectionNumber = index + 1;
 const isSectionOpen = openSections.has(index);
 
 return (
 <Section
 key={index}
 section={section}
 theme={theme}
 sectionNumber={sectionNumber}
 isOpen={isSectionOpen}
 onToggle={() => toggleSection(index)}
 />
 );
 })}
 </div>
 )}
 </div>
 </article>
 </section>
 </FocusLayout>
 );
}
