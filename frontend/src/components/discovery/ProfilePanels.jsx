import { useMemo } from "react";
import { personalizeCopy } from "../../utils/formatters/recommendationFormatters.js";

const PANEL_THEMES = [
 {
 background: " via-white ",
 border: "border-default",
 icon: "bg-surface text-accent",
 title: "text-accent",
 label: "text-accent",
 },
 {
 background: " via-white ",
 border: "border-coral-100",
 icon: "bg-coral-100 text-coral-600",
 title: "text-coral-600",
 label: "text-coral-600",
 },
 {
 background: " via-white ",
 border: "border-aqua-100",
 icon: "bg-aqua-100 text-aqua-600",
 title: "text-aqua-600",
 label: "text-aqua-600",
 },
];

function truncateNarrative(text = "", limit = 140) {
 const normalized = text.replace(/\s+/g, " ").trim();
 if (normalized.length <= limit) return normalized;
 return `${normalized.slice(0, limit).trimEnd()}...`;
}

function buildProfilePanels(inputs = {}) {
 // Extract skills as string from structured object
 let skillsStr = "";
 if (inputs?.skills && typeof inputs.skills === "object") {
 const skillParts = [];
 if (inputs.skills.technical?.length > 0) skillParts.push(`Technical: ${inputs.skills.technical.join(", ")}`);
 if (inputs.skills.creative?.length > 0) skillParts.push(`Creative: ${inputs.skills.creative.join(", ")}`);
 if (inputs.skills.business?.length > 0) skillParts.push(`Business: ${inputs.skills.business.join(", ")}`);
 if (inputs.skills.soft?.length > 0) skillParts.push(`Soft: ${inputs.skills.soft.join(", ")}`);
 if (inputs.skills.physical?.length > 0) skillParts.push(`Physical: ${inputs.skills.physical.join(", ")}`);
 if (inputs.skills.other?.trim()) skillParts.push(inputs.skills.other);
 skillsStr = skillParts.join("; ");
 }
 
 const cleaned = {
 goal: personalizeCopy(inputs?.founder_ambition ?? ""),
 focus: personalizeCopy(inputs?.sub_interest_area ?? inputs?.industry_interest ?? ""),
 time: personalizeCopy(inputs?.time_commitment ?? ""),
 budget: personalizeCopy(inputs?.budget_range ?? ""),
 workStyle: personalizeCopy(inputs?.preferred_work_style ?? ""),
 skill: personalizeCopy(skillsStr),
 experience: personalizeCopy(inputs?.experience_summary ?? ""),
 };

 const panels = [];

 if (cleaned.goal || cleaned.focus) {
 panels.push({
 title: "Direction",
 icon: "🎯",
 theme: PANEL_THEMES[0],
 items: [
 cleaned.goal && { label: "Goal", value: cleaned.goal },
 cleaned.focus && { label: "Focus", value: cleaned.focus },
 ].filter(Boolean),
 });
 }

 if (cleaned.time || cleaned.budget) {
 panels.push({
 title: "Capacity",
 icon: "⏳",
 theme: PANEL_THEMES[1],
 items: [
 cleaned.time && { label: "Time commitment", value: cleaned.time },
 cleaned.budget && { label: "Budget", value: cleaned.budget },
 ].filter(Boolean),
 });
 }

 if (cleaned.workStyle || cleaned.skill || cleaned.experience) {
 panels.push({
 title: "Strengths",
 icon: "💪",
 theme: PANEL_THEMES[2],
 items: [
 cleaned.workStyle && { label: "Work style", value: cleaned.workStyle },
 cleaned.skill && { label: "Skill", value: cleaned.skill },
 cleaned.experience && { label: "Experience", value: truncateNarrative(cleaned.experience) },
 ].filter(Boolean),
 });
 }

 return panels.slice(0, 3);
}

export default function ProfilePanels({ inputs }) {
 const panels = useMemo(() => buildProfilePanels(inputs), [inputs]);
 if (!panels.length) return null;

 const columnClass =
 panels.length === 1 ? "md:grid-cols-1" : panels.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3";

 return (
 <div className={`mt-5 grid gap-4 ${columnClass}`}>
 {panels.map(({ title, icon, items, theme }, index) => (
 <div
 key={`${title}-${index}`}
 className={`rounded-3xl border ${theme.border} ${theme.background} p-5 shadow-[0_18px_40px_-32px_rgba(34,79,175,0.25)] transition`}
 >
 <div className="flex items-start justify-between">
 <span className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${theme.icon}`}>
 {icon}
 </span>
 <p className={`text-xs font-semibold uppercase tracking-wide ${theme.title}`}>{title}</p>
 </div>
 <ul className="mt-4 space-y-2 text-sm text-cloud-800">
 {items.map(({ label, value }) => (
 <li key={label} className="leading-relaxed">
 <span className={`font-semibold ${theme.label}`}>{label}:</span> {value}
 </li>
 ))}
 </ul>
 </div>
 ))}
 </div>
 );
}

