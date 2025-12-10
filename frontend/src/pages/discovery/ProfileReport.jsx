import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useReports } from "../../context/ReportsContext.jsx";
import { extractProfileJSON } from "../../utils/streamingParser.js";
import Seo from "../../components/common/Seo.jsx";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    // Initial check
    checkDarkMode();
    
    // Watch for changes using MutationObserver
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
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
  
  // Core Motivations (Section 1)
  if (lowerTitle.includes("motivation") || lowerTitle.includes("goal") || lowerTitle.includes("objective")) {
    return {
      icon: "🎯",
      bg: isDark ? "#112244" : "#E8EEFF",
      border: isDark ? "#3A6BFF" : "#CAD8FF",
      headerBg: isDark ? "#1A3A66" : "#D5E0FF", // Slightly brighter for header in dark mode
      headerBgHover: isDark ? "#254A7A" : "#C2D1FF", // Brighter for hover in dark mode
      text: "text-slate-800 dark:text-slate-200",
    };
  }
  
  // Operating Constraints (Section 2)
  if (lowerTitle.includes("constraint")) {
    return {
      icon: "📋",
      bg: isDark ? "#1A2333" : "#F4F6FA",
      border: isDark ? "#3F4B66" : "#DDE3EB",
      headerBg: isDark ? "#253344" : "#E8ECF2", // Slightly brighter for header in dark mode
      headerBgHover: isDark ? "#2F3F55" : "#DCE0E8", // Brighter for hover in dark mode
      text: "text-slate-800 dark:text-slate-200",
    };
  }
  
  // Strengths and Capabilities (Section 3)
  if (lowerTitle.includes("strength") || lowerTitle.includes("capabilit")) {
    return {
      icon: "✨",
      bg: isDark ? "#1D2840" : "#EEF3FF",
      border: isDark ? "#4860A8" : "#D5DDF7",
      headerBg: isDark ? "#2A3555" : "#E0E8FF", // Slightly brighter for header in dark mode
      headerBgHover: isDark ? "#354266" : "#D2DBF5", // Brighter for hover in dark mode
      text: "text-slate-800 dark:text-slate-200",
    };
  }
  
  // Strategic Considerations (Section 4)
  if (lowerTitle.includes("strategic") || lowerTitle.includes("consideration")) {
    return {
      icon: "💡",
      bg: isDark ? "#1D2840" : "#EEF3FF",
      border: isDark ? "#4860A8" : "#D5DDF7",
      headerBg: isDark ? "#2A3555" : "#E0E8FF", // Slightly brighter for header in dark mode
      headerBgHover: isDark ? "#354266" : "#D2DBF5", // Brighter for hover in dark mode
      text: "text-slate-800 dark:text-slate-200",
    };
  }
  
  // Viability Red Flags (Section 5)
  if (lowerTitle.includes("red flag") || lowerTitle.includes("viability")) {
    return {
      icon: "⚠️",
      bg: isDark ? "#3A1E1E" : "#FFF4D6",
      border: isDark ? "#FF7847" : "#F6C744",
      headerBg: isDark ? "#4A2E2E" : "#FFEBB8", // Slightly brighter for header in dark mode
      headerBgHover: isDark ? "#5A3E3E" : "#FFE29F", // Brighter for hover in dark mode
      text: "text-slate-800 dark:text-slate-200",
    };
  }
  
  // Pathway Recommendation (Section 6)
  if (lowerTitle.includes("pathway") || lowerTitle.includes("recommendation")) {
    return {
      icon: "🛤️",
      bg: isDark ? "#0F3A2F" : "#E9F8EE",
      border: isDark ? "#33D1A0" : "#C3EED0",
      headerBg: isDark ? "#1A4A3F" : "#D5F2E0", // Slightly brighter for header in dark mode
      headerBgHover: isDark ? "#255A4F" : "#C1ECD0", // Brighter for hover in dark mode
      text: "text-slate-800 dark:text-slate-200",
    };
  }
  
  // Fallback (should not be reached)
  return {
    icon: "📋",
    bg: isDark ? "#1A2333" : "#F4F6FA",
    border: isDark ? "#3F4B66" : "#DDE3EB",
    headerBg: isDark ? "#253344" : "#E8ECF2",
    headerBgHover: isDark ? "#2F3F55" : "#DCE0E8",
    text: "text-slate-800 dark:text-slate-200",
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
            className="font-semibold text-sm mb-1"
            style={{ color: textColor }}
          >
            Your personalized reports are ready!
          </p>
          <p 
            className="text-xs"
            style={{ color: textColorLight }}
          >
            View your             <a 
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
      className="rounded-2xl border-2 p-0 overflow-hidden shadow-md dark:shadow-slate-900/50"
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
          <SuccessBanner runId={runId} />
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
              {'  "strategic_considerations": "...",'}{'\n'}
              {'  "viability_red_flags": "...",'}{'\n'}
              {'  "pathway_recommendation": "..."'}{'\n'}
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
      </article>
    </section>
  );
}
