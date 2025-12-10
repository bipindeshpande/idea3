import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useReports } from "../../context/ReportsContext.jsx";
import { extractProfileJSON } from "../../utils/streamingParser.js";
import Seo from "../../components/common/Seo.jsx";

function useQuery() {
  return new URLSearchParams(useLocation().search);
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
  
  // Render the four fields as text sections
  const sections = [];
  
  if (profileData.core_motivations) {
    sections.push({
      title: "Core Motivations",
      level: 2,
      content: formatAsBullets(profileData.core_motivations),
      subsections: [],
    });
  }
  
  if (profileData.constraints) {
    sections.push({
      title: "Operating Constraints",
      level: 2,
      content: formatAsBullets(profileData.constraints),
      subsections: [],
    });
  }
  
  if (profileData.strengths) {
    sections.push({
      title: "Strengths and Capabilities",
      level: 2,
      content: formatAsBullets(profileData.strengths),
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
  
  return sections;
}

function getSectionTheme(title = "", index = 0) {
  const lowerTitle = title.toLowerCase();
  const isEven = index % 2 === 0;
  
  if (lowerTitle.includes("motivation") || lowerTitle.includes("goal") || lowerTitle.includes("objective")) {
    return {
      icon: "🎯",
      border: "border-brand-300 dark:border-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      headerBg: "bg-brand-100 dark:bg-brand-900/30",
      text: "text-brand-800 dark:text-brand-300",
    };
  }
  
  return {
    icon: isEven ? "📋" : "✨",
    border: "border-slate-300 dark:border-slate-600",
    bg: "bg-slate-50 dark:bg-slate-800/50",
    headerBg: "bg-slate-100 dark:bg-slate-700/50",
    text: "text-slate-800 dark:text-slate-200",
  };
}

function Section({ section, theme, sectionNumber, isOpen, onToggle }) {
  return (
    <div
      className={`rounded-2xl border-2 ${theme.border} ${theme.bg} p-0 overflow-hidden shadow-md dark:shadow-slate-900/50`}
    >
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between gap-3 px-6 py-4 ${theme.headerBg} border-b-2 ${theme.border} hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{theme.icon}</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-sm font-bold ${theme.text} opacity-70`}>
              {sectionNumber}.
            </span>
            <h2 className={`text-lg font-bold text-left ${theme.text}`}>
              {section.title}
            </h2>
          </div>
        </div>
        <span className={`text-xl transition-transform flex-shrink-0 text-slate-600 dark:text-slate-400 ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>
      
      {isOpen && (
      <div className="p-6 space-y-5 bg-white dark:bg-slate-800/50">
        {section.content && section.content.length > 0 && (
          <ul className="list-disc list-outside space-y-2.5 text-slate-700 dark:text-slate-300 ml-6">
            {section.content.map((item, idx) => (
              <li key={idx} className="leading-relaxed pl-1 text-base">
                {item.replace(/^-\s+/, "")}
              </li>
            ))}
          </ul>
        )}
        
        {(!section.content || section.content.length === 0) && (
          <p className="text-slate-500 dark:text-slate-400 text-sm italic">No content available for this section</p>
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
  "constraints": "- Time: Limited to ≤ 5 hours/week, requiring solutions that can be built and managed part-time\n- Budget: Working with a lean budget, prioritizing cost-effective tools and strategies\n- Work style: Prefer structured, systematic approaches that allow for incremental progress",
  "strengths": "- Technical skills enable rapid prototyping and iteration\n- Understanding of product development and user needs\n- Ability to work independently and systematically",
  "strategic_considerations": "- Focus on ideas that can be validated quickly with minimal investment\n- Have clear monetization paths\n- Leverage your existing skills and knowledge\n- Can scale without requiring full-time commitment initially"
}
---PROFILE_ANALYSIS_END---`;

export default function ProfileReport() {
  const { reports, loadRunById } = useReports();
  const query = useQuery();
  const runId = query.get("id");
  const isSample = query.get("sample") === "true";
  const [openSections, setOpenSections] = useState(new Set());

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
    <section className="grid gap-6">
      <Seo
        title="Profile Analysis Report | Startup Idea Advisor"
        description="Detailed analysis of your entrepreneurial profile generated by our AI advisor."
        path="/results/profile"
      />
      
      {isSample && (
        <div className="rounded-2xl border border-brand-200 dark:border-brand-700 bg-brand-50 dark:bg-brand-900/20 p-4 text-center">
          <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
            📋 Sample Profile Analysis — This is a demonstration of what you'll receive
          </p>
        </div>
      )}

      <article className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50 mb-2">Profile Analysis</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Comprehensive analysis of your entrepreneurial profile, strengths, and opportunities
            </p>
          </div>
          {isSample && (
            <Link 
              to="/product" 
              className="inline-flex items-center gap-2 text-sm text-brand-700 dark:text-brand-300 hover:text-brand-800 dark:hover:text-brand-400"
            >
              <span aria-hidden="true">←</span> Back to product
            </Link>
          )}
        </div>
        
        {!isSample && reports?.personalized_recommendations && reports.personalized_recommendations.trim() && (
          <div className="mb-6 rounded-xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50/80 dark:bg-emerald-900/20 p-4 text-emerald-800 dark:text-emerald-300 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">✨</span>
              <div>
                <p className="font-semibold text-sm mb-1 dark:text-emerald-300">Your personalized reports are ready!</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  View your <a href={`/results/recommendations${runId ? `?id=${runId}` : ''}`} className="underline font-medium hover:text-emerald-900 dark:hover:text-emerald-300">startup recommendations</a> and detailed analysis reports.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {!effectiveProfileAnalysis ? (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-900/20 p-6 text-amber-800 dark:text-amber-300">
            <p className="text-sm">No profile analysis available. Please run a new analysis first.</p>
          </div>
        ) : sections.length === 0 ? (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-900/20 p-6 text-amber-800 dark:text-amber-300">
            <p className="text-sm mb-4">Could not parse profile analysis JSON. Expected format with delimiters:</p>
            <pre className="text-xs bg-amber-100 dark:bg-amber-900/40 p-3 rounded overflow-auto max-h-64">
              ---PROFILE_ANALYSIS_START---{'\n'}
              {'{'}{'\n'}
              {'  "core_motivations": "...",'}{'\n'}
              {'  "constraints": "...",'}{'\n'}
              {'  "strengths": "...",'}{'\n'}
              {'  "strategic_considerations": "..."'}{'\n'}
              {'}'}{'\n'}
              ---PROFILE_ANALYSIS_END---
            </pre>
            <p className="text-xs mt-4 text-amber-700 dark:text-amber-400">
              Raw content length: {effectiveProfileAnalysis?.length || 0} characters
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sections.map((section, index) => {
              const theme = getSectionTheme(section.title, index);
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
      </article>
    </section>
  );
}
