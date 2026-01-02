import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { pdf } from "@react-pdf/renderer";
import Seo from "../../components/common/Seo.jsx";
import { useValidation } from "../../context/ValidationContext.jsx";
import { useReports } from "../../context/ReportsContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { mapValidationToIntake, getExperienceSummaryFromValidation } from "../../utils/mappers/validationToIntakeMapper.js";
import { buildValidationConclusion } from "../../utils/formatters/validationConclusion.js";
import { validationQuestions } from "../../config/validationQuestions.js";
import Celebration, { getCelebrationMessage } from "../../components/common/Celebration.jsx";
import ValidationReportPDF from "../../components/pdf/ValidationReportPDF.jsx";
import { VALIDATION_PARAMETERS, PARAMETER_GROUPS_LAYOUT, RADAR_AXES, FALLBACK_DETAIL } from "./constants.js";
import { getScoreMeta, getScoreFromScores, normalizeKey } from "./utils.js";
import RadarChart from "../../components/validation/RadarChart.jsx";
import ParameterScores from "../../components/validation/ParameterScores.jsx";
import ScoreLegend from "../../components/validation/ScoreLegend.jsx";
import ParameterCard from "../../components/validation/ParameterCard.jsx";
import ValidationHeader from "./components/ValidationHeader.jsx";
import ValidationTabs from "./components/ValidationTabs.jsx";
import InputTab from "./components/InputTab.jsx";
import ResultsTab from "./components/ResultsTab.jsx";
import AnalysisTab from "./components/AnalysisTab.jsx";
import ConclusionTab from "./components/ConclusionTab.jsx";
import NextStepsTab from "./components/NextStepsTab.jsx";


export default function ValidationResult() {
 const [searchParams] = useSearchParams();
 const navigate = useNavigate();
 const { currentValidation, loadValidationById, categoryAnswers, ideaExplanation, loading: validationLoading } = useValidation();
 const { setInputs } = useReports();
 const { subscription, user, isAuthenticated } = useAuth();
 const isPro = subscription?.subscription_type === "pro" || subscription?.subscription_type === "annual";
 const isFree = !subscription || subscription?.subscription_type === "free";
 const isStarter = subscription?.subscription_type === "starter";
 const [activeTab, setActiveTab] = useState("input"); // Default to "input" tab
 const [previousScore, setPreviousScore] = useState(null);
 const [previousValidationId, setPreviousValidationId] = useState(null);
 const [downloadingPDF, setDownloadingPDF] = useState(false);
 const [viewFilter, setViewFilter] = useState("all");
 const [sortOption, setSortOption] = useState("category");
 const downloadButtonRef = useRef(null);
 const lastLoadedValidationId = useRef(null);

 useEffect(() => {
 const validationId = searchParams.get("id");
 const prevId = searchParams.get("previous");
 const prevScore = searchParams.get("previousScore");
 
 if (validationId) {
 // Normalize IDs for comparison (strip "val_" prefix)
 const normalizeId = (id) => {
  if (!id) return "";
  return String(id).replace(/^val_/, '');
 };
 
 const normalizedUrlId = normalizeId(validationId);
 const currentId = currentValidation?.id || currentValidation?.validation_id;
 const normalizedCurrentId = normalizeId(currentId);
 const lastLoadedId = normalizeId(lastLoadedValidationId.current);
 
 // Check if we need to load a different validation
 // Load if: 
 // - no current validation OR 
 // - current validation ID doesn't match URL ID OR
 // - we haven't loaded this ID yet (to handle cases where comparison might fail)
 // - current validation exists but doesn't have validation data (scores, recommendations, etc.)
 const needsLoad = !currentValidation || 
  normalizedCurrentId !== normalizedUrlId || 
  lastLoadedId !== normalizedUrlId ||
  (currentValidation && !currentValidation.validation);
 
 if (needsLoad) {
  lastLoadedValidationId.current = validationId;
  loadValidationById(validationId).catch(err => {
   console.error("Failed to load validation:", err);
  });
 }
 }
 
 // Set previous validation data for comparison
 if (prevId && prevScore) {
 setPreviousValidationId(prevId);
 setPreviousScore(parseFloat(prevScore));
 }
 }, [searchParams, currentValidation, loadValidationById]);

 // Get validation data - the validation result is stored in currentValidation.validation
 const validation = currentValidation?.validation || null;
// 🔍 DEBUG STEP 1: Check details field (the key issue)
console.log("🔍 Step 1 - Details field:", {
  hasDetails: !!validation?.details,
  detailsIsEmpty: validation?.details ? Object.keys(validation.details).length === 0 : "no details field",
  detailsKeysCount: validation?.details ? Object.keys(validation.details).length : 0,
  detailsKeys: validation?.details ? Object.keys(validation.details).slice(0, 5) : "none" // First 5 keys only
});

 const scores = validation?.scores || {};
 const overallScore = validation?.overall_score || 0;
 const [showCelebration, setShowCelebration] = useState(false);
 
 // Show celebration for high scores
 useEffect(() => {
 if (overallScore >= 8 && validation) {
 setShowCelebration(true);
 // Auto-hide after 5 seconds
 const timer = setTimeout(() => setShowCelebration(false), 5000);
 return () => clearTimeout(timer);
 }
 }, [overallScore, validation]);
 const rawRecommendations = validation?.recommendations || "";

 const parameterLookup = useMemo(() => {
  const detailsMap = validation?.details || {};
  const lookup = {};
  VALIDATION_PARAMETERS.forEach((parameter) => {
   // Normalize parameter name to match backend keys (snake_case)
   const normalized = normalizeKey(parameter);
   // Try multiple key variations to find details
   const detailsKey = detailsMap[parameter] 
    || detailsMap[normalized]
    || detailsMap[normalized.replace(/_/g, "")]
    || detailsMap[parameter.toLowerCase()]
    || null;
   
   lookup[parameter] = {
    score: getScoreFromScores(scores, parameter),
    details: detailsKey,
   };
  });
  return lookup;
 }, [scores, validation?.details]);

 const radarData = useMemo(
 () =>
 RADAR_AXES.map((axis) => ({
 label: axis.label,
 value: parameterLookup[axis.parameter]?.score ?? 0,
 })),
 [parameterLookup]
 );

 const parameterGroups = useMemo(() => {
 return PARAMETER_GROUPS_LAYOUT.map((group) => {
 const cards = group.parameters
 .map((name, index) => {
 const data = parameterLookup[name] || { score: 0, details: null };
 return {
 name,
 score: data.score ?? 0,
 details: data.details,
 order: index,
 };
 })
 .filter((item) => (viewFilter === "red" ? item.score <= 3 : true));

 const sortedCards = [...cards];
 if (sortOption === "score-asc") {
 sortedCards.sort((a, b) => a.score - b.score);
 } else if (sortOption === "score-desc") {
 sortedCards.sort((a, b) => b.score - a.score);
 } else {
 sortedCards.sort((a, b) => a.order - b.order);
 }

 return { ...group, cards: sortedCards };
 }).filter((group) => group.cards.length > 0);
 }, [parameterLookup, viewFilter, sortOption]);

 const overallStatus = getScoreMeta(overallScore);
 const overallScorePercent = Math.round(
 Math.max(0, Math.min(100, (overallScore / 10) * 100))
 );
 
 // Format recommendations to ensure proper bullet points with sub-bullets
 const recommendations = useMemo(() => {
 if (!rawRecommendations) return "";
 
 // Ensure it's a string
 let text = typeof rawRecommendations === 'string' ? rawRecommendations : String(rawRecommendations || "");
 
 // Clean up stray ** markers that aren't part of proper markdown formatting
 // First, normalize proper bold markdown patterns, then remove any remaining stray **
 text = text
 // Replace proper bold patterns temporarily (we'll restore them)
 .replace(/\*\*([^*]+?)\*\*/g, '___BOLD___$1___BOLD___')
 // Remove any remaining stray **
 .replace(/\*\*/g, '')
 // Restore proper bold markers
 .replace(/___BOLD___/g, '**');
 
 
 // Process each line to convert numbered lists to bullets and break down descriptions
 const lines = text.split('\n');
 const processedLines = [];
 
 for (let i = 0; i < lines.length; i++) {
 const line = lines[i].trim();
 
 // Skip empty lines (but preserve them for spacing)
 if (line === '') {
 processedLines.push('');
 continue;
 }
 
 // If it's a heading, keep it as is
 if (line.startsWith('#')) {
 processedLines.push(line);
 continue;
 }
 
 // If it's a numbered list item (e.g., "1. **Title**: Description")
 const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
 if (numberedMatch) {
 const content = numberedMatch[2];
 // Check if content has a colon (title: description format)
 const colonIndex = content.indexOf(':');
 if (colonIndex > 0 && colonIndex < content.length - 10) {
 // Split title and description
 const title = content.substring(0, colonIndex).trim();
 const description = content.substring(colonIndex + 1).trim();
 
 // Add the main bullet with title (clean any stray **)
 const cleanTitle = title.replace(/\*\*/g, '').trim();
 processedLines.push(`- **${cleanTitle}**:`);
 
 // Break down description into sub-bullets for better readability
 // First, check if description contains numbered items embedded in text
 // Pattern to match: "**2. Title:** description" or "2. Title: description"
 // This handles cases where numbered items are embedded within the description text
 const numberedItemPattern = /(\*\*)?(\d+)\.\s+(\*\*)?([^:]+?)(\*\*)?:\s*([^**]+?)(?=\s*(?:\*\*)?\d+\.|$)/g;
 let numberedMatches = [];
 let match;
 const descriptionCopy = description; // Create a copy for exec
 while ((match = numberedItemPattern.exec(descriptionCopy)) !== null) {
 numberedMatches.push({
 fullMatch: match[0],
 title: (match[4] || '').trim(),
 description: (match[6] || '').trim(),
 index: match.index
 });
 }
 
 if (numberedMatches.length > 0) {
 // Extract the first part before any numbered items
 if (numberedMatches[0].index > 0) {
 const beforeText = description.substring(0, numberedMatches[0].index).trim();
 if (beforeText.length > 10) {
 // Clean any stray ** from description text
 const cleanedBeforeText = beforeText.replace(/\*\*/g, '').trim();
 processedLines.push(` - ${cleanedBeforeText}`);
 }
 }
 
 // Convert each numbered item to a main bullet point
 numberedMatches.forEach((item, idx) => {
 const itemTitle = item.title;
 let itemDescription = item.description;
 
 // Check if this description contains the next numbered item
 if (idx < numberedMatches.length - 1) {
 const nextItemIndex = itemDescription.indexOf(numberedMatches[idx + 1].fullMatch);
 if (nextItemIndex > 0) {
 itemDescription = itemDescription.substring(0, nextItemIndex).trim();
 }
 }
 
 if (itemTitle) {
 const cleanItemTitle = itemTitle.replace(/\*\*/g, '').trim();
 processedLines.push(`- **${cleanItemTitle}**:`);
 if (itemDescription && itemDescription.length > 10) {
 // Clean any stray ** from description text
 const cleanedDescription = itemDescription.replace(/\*\*/g, '').trim();
 processedLines.push(` - ${cleanedDescription}`);
 }
 }
 });
 } else if (description.length > 80) {
 // Try to split by sentences first
 const sentences = description.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(s => s.trim().length > 20);
 if (sentences.length > 1) {
 sentences.forEach(sentence => {
 // Clean any stray ** from sentence text
 const cleanedSentence = sentence.trim().replace(/\*\*/g, '');
 processedLines.push(` - ${cleanedSentence}`);
 });
 } else {
 // If single sentence, try splitting by common separators
 const separators = [';', '—', '–', '. ', ', and ', ', or '];
 let split = false;
 for (const sep of separators) {
 if (description.includes(sep)) {
 const parts = description.split(sep).filter(p => p.trim().length > 20);
 if (parts.length > 1) {
 parts.forEach(part => {
 processedLines.push(` - ${part.trim()}`);
 });
 split = true;
 break;
 }
 }
 }
 if (!split) {
 // If still can't split, try splitting by periods followed by space
 const periodSplit = description.split(/\.\s+/).filter(s => s.trim().length > 20);
 if (periodSplit.length > 1) {
 periodSplit.forEach(part => {
 // Clean any stray ** from part text
 const cleanedPart = part.trim().replace(/\*\*/g, '');
 processedLines.push(` - ${cleanedPart}.`);
 });
 } else {
 // Keep as single sub-bullet, clean any stray **
 const cleanedDescription = description.replace(/\*\*/g, '').trim();
 processedLines.push(` - ${cleanedDescription}`);
 }
 }
 }
 } else {
 // Short description, keep as single sub-bullet, clean any stray **
 const cleanedDescription = description.replace(/\*\*/g, '').trim();
 processedLines.push(` - ${cleanedDescription}`);
 }
 } else {
 // No colon, convert numbered to bullet, clean any stray **
 const cleanedContent = content.replace(/\*\*/g, '').trim();
 processedLines.push(`- ${cleanedContent}`);
 }
 continue;
 }
 
 // If it's already a bullet point, keep it but process the content
 const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
 if (bulletMatch) {
 const content = bulletMatch[1];
 // Check if content has a colon (title: description format)
 const colonIndex = content.indexOf(':');
 if (colonIndex > 0 && colonIndex < content.length - 10) {
 // Split title and description
 const title = content.substring(0, colonIndex).trim();
 const description = content.substring(colonIndex + 1).trim();
 
 // Add the main bullet with title, clean any stray **
 const cleanTitle2 = title.replace(/\*\*/g, '').trim();
 processedLines.push(`- **${cleanTitle2}**:`);
 
 // Break down description into sub-bullets if it's long
 if (description.length > 50) {
 // Try to split by sentences
 const sentences = description.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(s => s.trim().length > 15);
 if (sentences.length > 1) {
 sentences.forEach(sentence => {
 // Clean any stray ** from sentence text
 const cleanedSentence = sentence.trim().replace(/\*\*/g, '');
 processedLines.push(` - ${cleanedSentence}`);
 });
 } else {
 // If single sentence, try splitting by common separators
 const separators = [';', '—', '–', ', and', ', or'];
 let split = false;
 for (const sep of separators) {
 if (description.includes(sep)) {
 const parts = description.split(sep).filter(p => p.trim().length > 15);
 if (parts.length > 1) {
 parts.forEach(part => {
 // Clean any stray ** from part text
 const cleanedPart = part.trim().replace(/\*\*/g, '');
 processedLines.push(` - ${cleanedPart}`);
 });
 split = true;
 break;
 }
 }
 }
 if (!split) {
 // Keep as single sub-bullet, clean any stray **
 const cleanedDescription = description.replace(/\*\*/g, '').trim();
 processedLines.push(` - ${cleanedDescription}`);
 }
 }
 } else {
 // Short description, keep as single sub-bullet, clean any stray **
 const cleanedDescription = description.replace(/\*\*/g, '').trim();
 processedLines.push(` - ${cleanedDescription}`);
 }
 } else {
 // No colon, keep as is, but clean any stray **
 const cleanedContent = content.replace(/\*\*/g, '').trim();
 processedLines.push(`- ${cleanedContent}`);
 }
 continue;
 }
 
 // Regular paragraph - try to convert to bullets
 if (line.length > 50) {
 // Try splitting by sentences
 const sentences = line.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(s => s.trim().length > 20);
 if (sentences.length > 1) {
 sentences.forEach(sentence => {
 // Clean any stray ** from sentence text
 const cleanedSentence = sentence.trim().replace(/\*\*/g, '');
 processedLines.push(`- ${cleanedSentence}`);
 });
 } else {
 // Try splitting by separators
 const separators = [';', '—', '–'];
 let split = false;
 for (const sep of separators) {
 if (line.includes(sep)) {
 const parts = line.split(sep).filter(p => p.trim().length > 20);
 if (parts.length > 1) {
 parts.forEach(part => {
 // Clean any stray ** from part text
 const cleanedPart = part.trim().replace(/\*\*/g, '');
 processedLines.push(`- ${cleanedPart}`);
 });
 split = true;
 break;
 }
 }
 }
 if (!split) {
 // Clean any stray ** from line text
 const cleanedLine = line.replace(/\*\*/g, '').trim();
 processedLines.push(`- ${cleanedLine}`);
 }
 }
 } else {
 // Clean any stray ** from line text
 const cleanedLine = line.replace(/\*\*/g, '').trim();
 processedLines.push(`- ${cleanedLine}`);
 }
 }
 
 let result = processedLines.join('\n');
 
 // Final cleanup: remove any remaining stray ** that aren't part of proper markdown bold syntax
 // Match proper markdown bold: **text**, then remove any remaining **
 result = result
 // Temporarily protect proper bold patterns
 .replace(/\*\*([^*\n]+?)\*\*/g, '___BOLD_START___$1___BOLD_END___')
 // Remove any remaining stray **
 .replace(/\*\*/g, '')
 // Restore proper bold markers
 .replace(/___BOLD_START___/g, '**')
 .replace(/___BOLD_END___/g, '**');
 
 
 return result;
 }, [rawRecommendations]);
 
 // Normalize next_steps format - convert comma-separated to proper markdown list
 // IMPORTANT: All hooks must be called before any early returns
 const rawNextSteps = validation?.next_steps || "";
 const nextSteps = useMemo(() => {
 // Ensure rawNextSteps is a string - handle all edge cases
 let nextStepsStr = "";
 try {
 if (rawNextSteps === null || rawNextSteps === undefined) {
 nextStepsStr = "";
 } else if (typeof rawNextSteps === 'string') {
 nextStepsStr = rawNextSteps;
 } else if (Array.isArray(rawNextSteps)) {
 nextStepsStr = rawNextSteps.join("\n\n");
 } else {
 nextStepsStr = String(rawNextSteps);
 }
 } catch (e) {
 // Fallback to empty string if conversion fails
 nextStepsStr = "";
 }
 
 // Final safety check - ensure it's a string
 if (typeof nextStepsStr !== 'string') {
 nextStepsStr = String(nextStepsStr || "");
 }
 
 if (!nextStepsStr || nextStepsStr.length === 0) return "";
 
 // Check if it's comma-separated (common AI output format)
 // Pattern: "1. **Title**: description,2. **Title**: description"
 // Look for pattern where comma is followed by a number and period
 // Additional safety check before calling .match()
 if (typeof nextStepsStr.match === 'function' && nextStepsStr.match(/,\d+\./)) {
 // Simple approach: split on ",1.", ",2.", etc. and reconstruct
 // First, find all positions where ",1.", ",2.", etc. occur
 // Match comma followed by number and period, with optional space
 const splitPattern = /(,\d+\.\s*)/g;
 const items = [];
 let lastIndex = 0;
 let match;
 
 // Find all matches
 while ((match = splitPattern.exec(nextStepsStr)) !== null) {
 // Extract the item before this match
 if (match.index > lastIndex) {
 const item = nextStepsStr.substring(lastIndex, match.index).trim();
 if (item && item.match(/^\d+\./)) {
 items.push(item);
 }
 }
 lastIndex = match.index + match[0].length;
 }
 
 // Add the last item (after the last match)
 if (lastIndex < nextStepsStr.length) {
 const lastItem = nextStepsStr.substring(lastIndex).trim();
 if (lastItem && lastItem.match(/^\d+\./)) {
 items.push(lastItem);
 }
 }
 
 // Also get the first item (before the first match)
 // Reset regex to find first match
 const firstMatch = /,\d+\./.exec(nextStepsStr);
 if (firstMatch && firstMatch.index > 0) {
 const firstItem = nextStepsStr.substring(0, firstMatch.index).trim();
 if (firstItem && firstItem.match(/^\d+\./)) {
 // Only add if not already in items (in case our logic missed it)
 if (items.length === 0 || items[0] !== firstItem) {
 items.unshift(firstItem);
 }
 }
 } else if (items.length === 0 && 
 typeof nextStepsStr.match === 'function' && 
 nextStepsStr.match(/^\d+\./)) {
 // If no comma matches found but string starts with a number, it's a single item
 items.push(nextStepsStr.trim());
 }
 
 // If we found items, join them with newlines
 if (items.length > 0) {
 const formatted = items.join("\n\n");
 // Ensure it's a valid string
 if (typeof formatted === 'string' && formatted.length > 0) {
 return formatted;
 }
 }
 }
 
 // Fallback: try a simpler split approach if the above didn't work
 // Split on ",1.", ",2.", etc. more directly
 // Additional safety check before calling string methods
 if (typeof nextStepsStr.includes === 'function' && 
 typeof nextStepsStr.match === 'function' &&
 nextStepsStr.includes(',') && 
 nextStepsStr.match(/\d+\./)) {
 const simpleSplit = nextStepsStr.split(/(?=,\d+\.)/);
 if (simpleSplit.length > 1) {
 const cleaned = simpleSplit
 .map(item => item.trim().replace(/^,\s*/, ''))
 .filter(item => item && item.match(/^\d+\./))
 .join("\n\n");
 if (cleaned && cleaned.length > 0) {
 return cleaned;
 }
 }
 }
 
 // If it already looks like proper markdown, return as-is
 // But ensure it's a string
 return nextStepsStr;
 }, [rawNextSteps]);

 // Generate final conclusion
 // IMPORTANT: All hooks must be called before any early returns
 const finalConclusion = useMemo(() => 
 buildValidationConclusion(validation, categoryAnswers, ideaExplanation),
 [validation, categoryAnswers, ideaExplanation]
 );

 const effectiveCategoryAnswers = useMemo(() => {
 if (categoryAnswers && Object.keys(categoryAnswers).length > 0) {
 return categoryAnswers;
 }
 if (currentValidation?.categoryAnswers && Object.keys(currentValidation.categoryAnswers).length > 0) {
 return currentValidation.categoryAnswers;
 }
 return {};
 }, [categoryAnswers, currentValidation]);
 const businessArchetypeLabel = effectiveCategoryAnswers?.business_archetype;
 const deliveryChannelLabel = effectiveCategoryAnswers?.delivery_channel;

 // Early return AFTER all hooks have been called
 // Show loading state if validation is being loaded
 if (validationLoading) {
 return (
 <section className="mx-auto max-w-6xl px-6 py-6">
 <div className="rounded-3xl border border-default bg-surface p-6 text-center">
 <p className="text-lg font-semibold text-primary">Loading validation results...</p>
 </div>
 </section>
 );
 }

 if (!validation) {
 return (
 <section className="mx-auto max-w-6xl px-6 py-6">
 <Seo
 title="Idea Validation Results | Startup Idea Advisor"
 description="Review your startup idea validation results with comprehensive analysis across 10 key parameters and actionable recommendations."
 keywords="startup validation results, idea validation score, startup idea analysis, business validation report"
 path="/validate-result"
 />
 <div className="rounded-3xl border border-default bg-surface p-6 text-accent shadow-soft">
 <h2 className="text-lg font-semibold">Validation results not available</h2>
 <p className="mt-2 text-sm">
 Unable to load validation results. Please try validating your idea again.
 </p>
 <Link
 to="/validate-idea"
  className="mt-4 inline-block ui-btn ui-btn-primary focus-visible:outline-accent"
 >
 Validate Again
 </Link>
 </div>
 </section>
 );
 }

 const scoreDescription = overallScore >= 8
 ? "Your idea shows strong potential with excellent scores across key validation parameters."
 : overallScore >= 6
 ? "Your idea has good potential with some areas that need strengthening."
 : "Your idea requires refinement in several key areas before moving forward.";

 const dynamicTitle = validation
 ? `Idea Validation Results - Score: ${overallScore}/10 | Startup Idea Advisor`
 : "Idea Validation Results | Startup Idea Advisor";

 const dynamicDescription = validation
 ? `${scoreDescription} Review detailed analysis across 10 parameters: market opportunity, problem-solution fit, competitive landscape, target audience clarity, business model viability, technical feasibility, financial sustainability, scalability potential, risk assessment, and go-to-market strategy. Get actionable recommendations to strengthen your startup concept.`
 : "Review your startup idea validation results with comprehensive analysis across 10 key parameters and actionable recommendations to improve your startup concept.";

 return (
 <React.Fragment>
 <Seo
 title={dynamicTitle}
 description={dynamicDescription}
 keywords="startup validation results, idea validation score, startup idea analysis, business validation report, startup feasibility report, idea evaluation results, startup assessment, business idea score, validation feedback, startup recommendations"
 path="/validate-result"
 />
 <section className="mx-auto max-w-6xl px-6 py-12">

 <ValidationHeader
 isAuthenticated={isAuthenticated}
 currentValidation={currentValidation}
 ideaExplanation={ideaExplanation}
 categoryAnswers={categoryAnswers}
 downloadButtonRef={downloadButtonRef}
 downloadingPDF={downloadingPDF}
 onDownloadPDF={async () => {
 if (downloadingPDF) return;
 try {
 setDownloadingPDF(true);
 const allParameterCards = parameterGroups.flatMap(group => group.cards);
 const pdfProps = {
 validation: validation,
 overallScore: overallScore,
 scores: scores,
 parameterCards: allParameterCards,
 recommendations: recommendations,
 nextSteps: nextSteps,
 categoryAnswers: effectiveCategoryAnswers || categoryAnswers,
 ideaExplanation: ideaExplanation,
 userName: user?.name || user?.email?.split('@')[0] || 'User',
 userEmail: user?.email || '',
 finalConclusion: finalConclusion
 };
 const pdfBlob = await pdf(<ValidationReportPDF {...pdfProps} />).toBlob();
 const url = URL.createObjectURL(pdfBlob);
 const link = document.createElement('a');
 link.href = url;
 const validationId = validation?.id || validation?.validation_id || currentValidation?.id || Date.now();
 link.download = `idea-validation-report-${validationId}.pdf`;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 URL.revokeObjectURL(url);
 } catch (err) {
 console.error("Failed to generate PDF:", err);
 alert("Failed to generate PDF: " + (err.message || "Please check the console for details."));
 } finally {
 setDownloadingPDF(false);
 }
 }}
 parameterGroups={parameterGroups}
 validation={validation}
 overallScore={overallScore}
 scores={scores}
 recommendations={recommendations}
 nextSteps={nextSteps}
 user={user}
 finalConclusion={finalConclusion}
 />

 <ValidationTabs 
 activeTab={activeTab}
 setActiveTab={setActiveTab}
 recommendations={recommendations}
 finalConclusion={finalConclusion}
 />

 {/* Tab Content: Your Input */}
 {activeTab === "input" && (
 <InputTab categoryAnswers={categoryAnswers} ideaExplanation={ideaExplanation} />
 )}

 {/* Tab Content: Validation Results */}
 {activeTab === "results" && (
 <ResultsTab
  overallScore={overallScore}
  showCelebration={showCelebration}
  previousScore={previousScore}
  overallStatus={overallStatus}
  radarData={radarData}
  parameterGroups={parameterGroups}
  parameterLookup={parameterLookup}
  viewFilter={viewFilter}
  setViewFilter={setViewFilter}
  sortOption={sortOption}
  setSortOption={setSortOption}
  setActiveTab={setActiveTab}
  downloadButtonRef={downloadButtonRef}
 />
 )}

 {/* Tab Content: Detailed Analysis & Recommendations */}
 {activeTab === "analysis" && (
 <AnalysisTab parameterLookup={parameterLookup} recommendations={recommendations} />
 )}

 {/* Tab Content: Final Validation Conclusion & Decision */}
 {activeTab === "conclusion" && (
 <ConclusionTab finalConclusion={finalConclusion} />
 )}

 {/* Tab Content: Next Steps */}
 {activeTab === "nextsteps" && (
 <NextStepsTab
  overallScore={overallScore}
  isFree={isFree}
  isStarter={isStarter}
  subscription={subscription}
  nextSteps={nextSteps}
  validation={validation}
  currentValidation={currentValidation}
  scores={scores}
  categoryAnswers={categoryAnswers}
  ideaExplanation={ideaExplanation}
  setInputs={setInputs}
 />
 )}
 </section>
 </React.Fragment>
 );
}
