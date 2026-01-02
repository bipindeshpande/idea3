import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useValidation } from "../../context/ValidationContext.jsx";
import { useReports } from "../../context/ReportsContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { validationQuestions } from "../../config/validationQuestions.js";
import ValidationLoadingIndicator from "../../components/validation/ValidationLoadingIndicator.jsx";
import OnboardingTooltip from "../../components/validation/OnboardingTooltip.jsx";
import FocusLayout from "../../layouts/FocusLayout.jsx";
import PageHeader from "../../components/workflow/PageHeader.jsx";
import UICard from "../../components/ui/ui-card.jsx";
import UIHeading from "../../components/ui/ui-heading.jsx";

const SCREEN1_QUESTIONS = validationQuestions.screen1_questions || validationQuestions.category_questions || [];
const SCREEN2_QUESTIONS = validationQuestions.screen2_questions || validationQuestions.idea_explanation_questions || [];
const OPTIONAL_FIELDS = validationQuestions.optional_fields || [];

export default function IdeaValidator() {
 const navigate = useNavigate();
 const [searchParams] = useSearchParams();
 
 const { validateIdea, loading, error, setError, setCategoryAnswers, setIdeaExplanation, categoryAnswers, loadValidationById } = useValidation();
 const { inputs, loadRunById } = useReports();
 const { getAuthHeaders, isAuthenticated } = useAuth();
 
 // Screen 1 state (About Your Idea - 4 dropdowns)
 const [screen1Answers, setScreen1Answers] = useState({});
 
 // Screen 2 state (How Your Idea Works - 5 dropdowns)
 const [screen2Answers, setScreen2Answers] = useState({});
 
 // Screen 3 state (Tell Us More)
 const [structuredDescription, setStructuredDescription] = useState("");
 const [optionalAnswers, setOptionalAnswers] = useState({
 initial_budget: "",
 delivery_channel: "",
 constraints: [],
 competitors: "",
 });
 
 const [step, setStep] = useState(0);
 const [loadingIntake, setLoadingIntake] = useState(true);
 const [userIntake, setUserIntake] = useState(null);
 const [dismissedTooltips, setDismissedTooltips] = useState(() => {
 const saved = localStorage.getItem("validation_tooltips_dismissed");
 return saved ? JSON.parse(saved) : [];
 });
 const [isFirstValidation, setIsFirstValidation] = useState(false);
 const [activityData, setActivityData] = useState(null); // Store activity data for reuse
 const isRevalidate = searchParams.get("revalidate") === "true";
 const editValidationIdRaw = searchParams.get("edit");
 // Strip "val_" prefix if present - backend and API return validation_id without prefix
 const editValidationId = editValidationIdRaw ? editValidationIdRaw.replace(/^val_/, '') : null;
 const [isEditMode, setIsEditMode] = useState(!!editValidationId);
 const [loadingValidationData, setLoadingValidationData] = useState(false);

 // Consolidated loader: Check first validation, load user intake, and cache activity data in one call
 useEffect(() => {
 const loadUserData = async () => {
 if (!isAuthenticated) {
 setIsFirstValidation(true);
 setLoadingIntake(false);
 return;
 }

 // Check if we already have inputs from context
 if (inputs && Object.keys(inputs).length > 0) {
 const hasValidData = inputs.goal_type || inputs.time_commitment || inputs.budget_range || inputs.interest_area;
 if (hasValidData) {
 setUserIntake(inputs);
 setLoadingIntake(false);
 }
 }

 try {
 // Single API call to get all needed data (reused by edit mode)
 const response = await fetch("/api/user/activity", {
 headers: getAuthHeaders(),
 });
 
 if (response.ok) {
 const data = await response.json();
 
 // Store activity data for reuse (including by edit mode)
 setActivityData(data.activity);
 
 // Check if first validation
 const validationCount = data.activity?.validations?.length || 0;
 setIsFirstValidation(validationCount === 0);
 
 // Load user intake from latest run (if not already set from context)
 if (!userIntake && data.success && data.activity && data.activity.runs && data.activity.runs.length > 0) {
 const latestRun = data.activity.runs[0];
 if (latestRun.inputs && Object.keys(latestRun.inputs).length > 0) {
 setUserIntake(latestRun.inputs);
 }
 }
 }
 } catch (err) {
 console.error("❌ Failed to load user data:", err);
 setIsFirstValidation(true);
 } finally {
 setLoadingIntake(false);
 }
 };

 loadUserData();
 }, [isAuthenticated, getAuthHeaders, inputs, userIntake]);

 // Load validation data when editing - uses cached activityData if available
 useEffect(() => {
 const loadValidationForEdit = async () => {
 if (!editValidationId) {
 return;
 }
 
 if (!isAuthenticated) {
 console.warn('🔒 [Edit Mode] User not authenticated, cannot load validation');
 setError("You must be logged in to edit validations. Please log in and try again.");
 return;
 }

 setLoadingValidationData(true);
 setError(null); // Clear any previous errors
 
 try {
 const searchId = String(editValidationId).trim();
 let validationToEdit = null;
 
 // Strategy 1: Try from activity data (but without status filter when include_all_statuses=true)
 // First check cache
 if (!validationToEdit && activityData?.validations) {
 validationToEdit = activityData.validations.find(v => {
 const vid = v.validation_id ? String(v.validation_id).trim() : null;
 const dbId = v.id ? String(v.id).trim() : null;
 return (vid && vid === searchId) || 
 (dbId && dbId.replace(/^val_/, '') === searchId) ||
 (vid && Number(vid) === Number(searchId)) ||
 (dbId && Number(dbId.replace(/^val_/, '')) === Number(searchId));
 });
 }
 
 // Strategy 3: Fetch from activity endpoint with larger page size and include all statuses
 // This is important for newly created validations that might not be COMPLETED yet
 if (!validationToEdit) {
 const response = await fetch(`/api/user/activity?per_page=100&include_all_statuses=true`, {
 headers: getAuthHeaders(),
 });

 if (response.ok) {
 const data = await response.json();
 const validations = data.activity?.validations || [];
 setActivityData(data.activity);
 
 validationToEdit = validations.find(v => {
 const vid = v.validation_id ? String(v.validation_id).trim() : null;
 const dbId = v.id ? String(v.id).trim() : null;
 
 if (vid && vid === searchId) return true;
 if (dbId && dbId.replace(/^val_/, '') === searchId) return true;
 
 try {
 const searchNum = Number(searchId);
 if (!isNaN(searchNum)) {
 if (vid && Number(vid) === searchNum) return true;
 if (dbId && Number(dbId.replace(/^val_/, '')) === searchNum) return true;
 }
 } catch (e) {
 // Ignore conversion errors
 }
 
 return false;
 });
 }
 }
 
 if (!validationToEdit) {
 console.warn('Validation not found for edit');
 }

 if (validationToEdit) {
 // Parse category_answers if it's a string
 let categoryAnswersData = {};
 if (validationToEdit.category_answers) {
 if (typeof validationToEdit.category_answers === 'string') {
 try {
 categoryAnswersData = JSON.parse(validationToEdit.category_answers);
 } catch (e) {
 console.error("Failed to parse category_answers", e);
 }
 } else {
 categoryAnswersData = validationToEdit.category_answers;
 }
 }

 // Pre-fill Screen 1 answers (About Your Idea - 4 dropdowns)
 // Direct mapping - use exact field names from form
 const screen1Data = {};
 const screen1Fields = ['industry', 'geography', 'stage', 'commitment'];
 
 screen1Fields.forEach(field => {
 // Try direct match first
 if (categoryAnswersData[field]) {
 screen1Data[field] = categoryAnswersData[field];
 }
 });
 
 // Set screen1 answers - set immediately even if only partial data
 // This ensures dropdowns show values as soon as they're loaded
 if (Object.keys(screen1Data).length > 0) {
 setScreen1Answers(prev => ({ ...prev, ...screen1Data }));
 }

 // Pre-fill Screen 2 answers (How Your Idea Works - 5 dropdowns)
 // Direct mapping with fallbacks for legacy field names
 const screen2Data = {};
 const screen2FieldMap = {
 'problem_category': ['problem_category', 'problem'],
 'solution_type': ['solution_type', 'solution'],
 'user_type': ['user_type', 'target_audience', 'user'],
 'revenue_model': ['revenue_model', 'business_model', 'revenue'],
 'unique_moat': ['unique_moat', 'uniqueness', 'unique_value'],
 'business_archetype': ['business_archetype', 'business_type', 'business_nature'],
 };
 
 Object.keys(screen2FieldMap).forEach(standardField => {
 const possibleNames = screen2FieldMap[standardField];
 for (const fieldName of possibleNames) {
 if (categoryAnswersData[fieldName]) {
 screen2Data[standardField] = categoryAnswersData[fieldName];
 break; // Use first match
 }
 }
 });
 
 // Set screen2 answers - set immediately even if only partial data
 if (Object.keys(screen2Data).length > 0) {
 setScreen2Answers(prev => ({ ...prev, ...screen2Data }));
 }

 // Pre-fill Screen 3 (Tell Us More)
 if (validationToEdit.idea_explanation) {
 setStructuredDescription(validationToEdit.idea_explanation);
 }

 // Pre-fill optional fields with all possible field name variations
 setOptionalAnswers({
 initial_budget: categoryAnswersData.initial_budget || categoryAnswersData.budget || categoryAnswersData.budget_range || "",
 delivery_channel: categoryAnswersData.delivery_channel || "",
 constraints: Array.isArray(categoryAnswersData.constraints) 
 ? categoryAnswersData.constraints 
 : (categoryAnswersData.constraints ? [categoryAnswersData.constraints] : []),
 competitors: categoryAnswersData.competitors || categoryAnswersData.competition || "",
 });

 // Set category answers in context
 setCategoryAnswers(categoryAnswersData);
 setIdeaExplanation(validationToEdit.idea_explanation || "");
 } else {
 console.error('Validation not found for ID:', editValidationId);
 
 // Show the original ID from URL in error message for user clarity
 const originalId = editValidationIdRaw || editValidationId;
 const availableIds = validations.map(v => v.validation_id || v.id).join(', ');
 setError(
 `Validation not found or access denied. The validation with ID "${originalId}" could not be loaded. ` +
 `This validation may have been deleted or doesn't belong to your account. ` +
 (validations.length > 0 
 ? `Available validations: ${availableIds}` 
 : 'You have no validations available to edit.')
 );
 }
 } catch (err) {
 console.error('Exception caught while loading validation:', err);
 setError("Failed to load validation data. Please try again.");
 } finally {
 setLoadingValidationData(false);
 }
 };

 if (editValidationId && isAuthenticated) {
 loadValidationForEdit();
 }
 }, [editValidationId, isAuthenticated, getAuthHeaders, setCategoryAnswers, setIdeaExplanation, activityData]);

 const handleScreen1Answer = (questionId, answer) => {
 setScreen1Answers((prev) => ({
 ...prev,
 [questionId]: answer,
 }));
 };

 const handleScreen2Answer = (questionId, answer) => {
 setScreen2Answers((prev) => ({
 ...prev,
 [questionId]: answer,
 }));
 };

 const handleOptionalAnswer = (fieldId, value) => {
 setOptionalAnswers((prev) => ({
 ...prev,
 [fieldId]: value,
 }));
 };

 const handleConstraintToggle = (constraint) => {
 setOptionalAnswers((prev) => ({
 ...prev,
 constraints: prev.constraints.includes(constraint)
 ? prev.constraints.filter((c) => c !== constraint)
 : [...prev.constraints, constraint],
 }));
 };

 const handleNext = () => {
 if (step === 0) {
 // Validate Screen 1 (4 required dropdowns)
 const allAnswered = SCREEN1_QUESTIONS.every((q) => screen1Answers[q.id]);
 if (!allAnswered) {
 setError("Please answer all questions before continuing.");
 return;
 }
 setError("");
 setStep(1);
 } else if (step === 1) {
 // Validate Screen 2 (5 required dropdowns)
 const allAnswered = SCREEN2_QUESTIONS.every((q) => screen2Answers[q.id]);
 if (!allAnswered) {
 setError("Please answer all questions before continuing.");
 return;
 }
 setError("");
 setStep(2);
 } else if (step === 2) {
 // Validate Screen 3 (structured description required)
 if (!structuredDescription.trim()) {
 setError("Please provide a structured description of your idea.");
 return;
 }
 setError("");
 handleSubmit();
 }
 };

 const handleBack = () => {
 if (step > 0) {
 setStep(step - 1);
 setError("");
 } else {
 navigate("/");
 }
 };

 // Dev-only auto-fill handler
 const handleAutoFill = () => {
 // Sample data for Screen 1 (About Your Idea)
 const sampleScreen1 = {
  industry: "SaaS / Software",
  geography: "US",
  stage: "Early Research",
  commitment: "Full-time Startup",
 };

 // Sample data for Screen 2 (How Your Idea Works)
 const sampleScreen2 = {
  problem_category: "Inefficiency",
  solution_type: "SaaS / Online Platform",
  user_type: "SMBs",
  revenue_model: "Subscription",
  unique_moat: "Superior UX",
  business_archetype: "Online software / AI product (SaaS / app / tool)",
 };

 // Sample structured description
 const sampleDescription = `1. Problem: 
Small businesses struggle to manage customer relationships effectively. They use multiple disconnected tools (email, spreadsheets, CRM) which leads to lost opportunities, poor follow-up, and inefficient workflows.

2. Solution:
An AI-powered all-in-one customer relationship platform that integrates email, CRM, task management, and automated follow-ups. Uses AI to suggest optimal contact times, personalize messages, and prioritize leads.

3. User:
Small to medium businesses (SMBs) with 5-50 employees, particularly in service industries like consulting, agencies, and professional services. They need better organization but can't afford enterprise CRM solutions.

4. Differentiation:
Unlike generic CRMs, this platform is built specifically for SMB workflows with AI that learns from their communication patterns. More affordable than enterprise solutions, more powerful than basic tools.

5. Monetization:
Freemium model with basic features free. Paid tiers starting at $29/month for advanced AI features, integrations, and team collaboration. Enterprise plans for larger teams.

6. Scope/Region:
Launch in US market first, targeting tech-savvy SMBs. Expand to English-speaking markets (Canada, UK, Australia) in year 2.`;

 // Sample optional fields
 const sampleOptional = {
  initial_budget: "$1k–$10k",
  delivery_channel: "Online only",
  constraints: ["Limited Budget", "Limited Time"],
  competitors: "HubSpot, Salesforce (too expensive), Pipedrive (lacks AI features)",
 };

 // Fill all fields
 setScreen1Answers(sampleScreen1);
 setScreen2Answers(sampleScreen2);
 setStructuredDescription(sampleDescription);
 setOptionalAnswers(sampleOptional);
 setError(""); // Clear any errors

 // Scroll to form after auto-fill
 setTimeout(() => {
  const formElement = document.getElementById("validation-form");
  if (formElement) {
   formElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }
 }, 100);
 };

 const handleSubmit = async () => {
 // Merge all answers into category_answers for backend
 const mergedCategoryAnswers = {
 ...screen1Answers,
 ...screen2Answers,
 initial_budget: optionalAnswers.initial_budget,
 delivery_channel: optionalAnswers.delivery_channel,
 constraints: optionalAnswers.constraints,
 competitors: optionalAnswers.competitors,
 };
 
 setCategoryAnswers(mergedCategoryAnswers);
 setIdeaExplanation(structuredDescription);
 
 // Use edit mode if validation ID is present
 const result = await validateIdea(mergedCategoryAnswers, structuredDescription, editValidationId || undefined);
 
 if (result.success) {
 if (isRevalidate && previousValidationData) {
 navigate(`/validate-result?id=${result.validation.id}&previous=${previousValidationData.previousValidationId}&previousScore=${previousValidationData.previousScore}`);
 localStorage.removeItem("revalidate_data");
 } else {
 navigate(`/validate-result?id=${result.validation.id}`);
 }
 }
 };

 return (
 <FocusLayout
 steps={[
 { label: "About your idea" },
 { label: "How it works" },
 { label: "Tell us more" },
 ]}
 currentStep={step}
 >
 <Seo
 title="Validate Your Startup Idea | Free AI-Powered Validation Tool | Startup Idea Advisor"
 description="Validate your startup idea with our free AI-powered tool. Get comprehensive analysis across 10 key parameters."
 keywords="startup idea validation, validate startup idea, business idea validation"
 path="/validate-idea"
 />

 {loading && <ValidationLoadingIndicator />}

 {/* Hero Section - Only show on first step and not in edit mode */}
 {step === 0 && !isEditMode && (
 <div className="mb-8">
 <UICard variant="muted" className="p-6 md:p-8">
 <div className="flex items-start justify-between gap-4 mb-6">
 <PageHeader
 title="Validate Your Startup Idea"
 subtitle="Get a comprehensive AI-powered analysis of your business idea across 10 key validation parameters. Understand market viability, risks, and opportunities before you build."
 />
 {process.env.NODE_ENV === "development" && (
 <button
 type="button"
 onClick={handleAutoFill}
 className="ui-btn ui-btn-secondary focus-visible:outline-accent whitespace-nowrap flex-shrink-0"
 >
 🔧 Auto-Fill (Dev)
 </button>
 )}
 </div>
 <div className="mt-6 grid gap-4 md:grid-cols-2">
 <div className="flex items-start gap-3">
 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-on-accent flex items-center justify-center text-xs font-bold">
 1
 </div>
 <div>
 <h3 className="text-base font-semibold text-primary">Market Analysis</h3>
 <p className="text-xs text-secondary mt-1">Assess market size, competition, and demand for your idea.</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-on-accent flex items-center justify-center text-xs font-bold">
 2
 </div>
 <div>
 <h3 className="text-base font-semibold text-primary">Risk Assessment</h3>
 <p className="text-xs text-secondary mt-1">Identify potential challenges and how to mitigate them.</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-on-accent flex items-center justify-center text-xs font-bold">
 3
 </div>
 <div>
 <h3 className="text-base font-semibold text-primary">Viability Score</h3>
 <p className="text-xs text-secondary mt-1">Get an overall score and actionable recommendations.</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-on-accent flex items-center justify-center text-xs font-bold">
 4
 </div>
 <div>
 <h3 className="text-base font-semibold text-primary">Next Steps</h3>
 <p className="text-xs text-secondary mt-1">Receive a clear roadmap for validating and launching your idea.</p>
 </div>
 </div>
 </div>
 </UICard>
 </div>
 )}

 <section>

 {loadingValidationData && (
  <div className="ui-card mb-6 rounded-[16px] p-6 text-center shadow-card bg-surface-muted">
  <p className="text-base font-semibold text-primary">Loading validation data...</p>
 </div>
 )}

 {isEditMode && editValidationId && !loadingValidationData && (
  <div className="ui-card mb-6 rounded-[16px] p-4 shadow-card">
  <p className="text-base font-semibold text-accent">Editing validation: {editValidationId}</p>
 </div>
 )}

 {error && !loading && (
  <div className="badge-danger mb-6 rounded-[16px] p-4">
  <p className="text-base font-semibold">{error}</p>
 </div>
 )}

 {/* SCREEN 1: About Your Idea */}
 {step === 0 && (
  <div id="validation-form" className="ui-card rounded-[16px] p-6 shadow-card">
  <header className="mb-6">
  <div className="flex items-center justify-between gap-4">
  <div>
  <p className="text-xs font-semibold text-secondary">Step 1 of 3</p>
  <UIHeading level="h1" className="mt-2 text-primary">About your idea</UIHeading>
  <p className="mt-2 text-base text-secondary">Set context and market boundaries.</p>
  </div>
  {process.env.NODE_ENV === "development" && (
  <button
  type="button"
  onClick={handleAutoFill}
  className="ui-btn ui-btn-secondary focus-visible:outline-accent whitespace-nowrap"
  >
  🔧 Auto-Fill (Dev)
  </button>
  )}
  </div>
  </header>

 <div className="space-y-6">
 {SCREEN1_QUESTIONS.map((question, index) => (
 <div key={question.id} className="relative">
  <label htmlFor={question.id} className="mb-2 block text-base font-semibold text-primary">
 {question.question}
 </label>
 <select
 id={question.id}
 value={screen1Answers[question.id] || ""}
 onChange={(e) => handleScreen1Answer(question.id, e.target.value)}
   className="ui-select focus-visible:outline-accent"
 >
 <option value="">Select an option...</option>
 {question.options.map((option) => (
 <option key={option} value={option}>
 {option}
 </option>
 ))}
 </select>
 </div>
 ))}
 </div>

 {error && (
  <div className="badge-danger mt-6 rounded-xl p-4 text-base font-semibold">
 {error}
 </div>
 )}

  <footer className="mt-8 flex items-center justify-between border-t border-default pt-6">
  <button type="button" className="ui-btn ui-btn-secondary focus-visible:outline-accent" disabled>
   Save Draft
  </button>
  <div className="flex items-center gap-3">
   <button type="button" onClick={handleBack} disabled={loading} className="ui-btn ui-btn-secondary focus-visible:outline-accent disabled:opacity-50">
    Back
   </button>
   <button type="button" onClick={handleNext} disabled={loading} className="ui-btn ui-btn-primary focus-visible:outline-accent disabled:opacity-50">
    Continue
   </button>
  </div>
  </footer>
 </div>
 )}

 {/* SCREEN 2: How Your Idea Works */}
 {step === 1 && (
 <div className="rounded-2xl border border-default bg-surface p-8 shadow-lg">
 <div className="flex items-center justify-between gap-4 mb-3">
 <UIHeading level="h1" className="text-primary">How Your Idea Works</UIHeading>
 {process.env.NODE_ENV === "development" && (
 <button
 type="button"
 onClick={handleAutoFill}
 className="ui-btn ui-btn-secondary focus-visible:outline-accent whitespace-nowrap"
 >
 🔧 Auto-Fill (Dev)
 </button>
 )}
 </div>
 <p className="mb-8 text-base leading-relaxed text-primary">
 Capture mechanics, value proposition, monetization.
 </p>

 <div className="space-y-6">
 {SCREEN2_QUESTIONS.map((question) => (
 <div key={question.id}>
 <label htmlFor={question.id} className="mb-2 block text-base font-semibold text-primary">
 {question.question}
 </label>
 <select
 id={question.id}
 value={screen2Answers[question.id] || ""}
 onChange={(e) => handleScreen2Answer(question.id, e.target.value)}
 className="ui-select focus-visible:outline-accent"
 >
 <option value="">Select an option...</option>
 {question.options.map((option) => (
 <option key={option} value={option}>
 {option}
 </option>
 ))}
 </select>
 </div>
 ))}
 </div>

 {error && (
 <div className="badge-danger mt-6 rounded-xl p-4 text-sm font-semibold">
 {error}
 </div>
 )}

 <div className="mt-8 flex items-center justify-between">
 <button
 type="button"
 onClick={handleBack}
 disabled={loading}
 className={`rounded-xl border border-default bg-surface px-6 py-3 text-base font-semibold text-primary text-secondary shadow-sm transition-all duration-200 hover:bg-surface hover:bg-surface hover:-translate-y-0.5 whitespace-nowrap ${loading ? "cursor-not-allowed opacity-50" : ""}`}
 >
 ← Back
 </button>
 <button
 type="button"
 onClick={handleNext}
 disabled={loading}
 className={`ui-btn ui-btn-primary focus-visible:outline-accent ${loading ? "cursor-not-allowed opacity-50" : ""}`}
 >
 Continue →
 </button>
 </div>
 </div>
 )}

 {/* SCREEN 3: Tell Us More */}
 {step === 2 && (
 <div className="rounded-2xl border border-default bg-surface p-8 shadow-lg">
 <div className="flex items-center justify-between gap-4 mb-3">
 <UIHeading level="h1" className="text-primary">Tell Us More</UIHeading>
 {process.env.NODE_ENV === "development" && (
 <button
 type="button"
 onClick={handleAutoFill}
 className="ui-btn ui-btn-secondary focus-visible:outline-accent whitespace-nowrap"
 >
 🔧 Auto-Fill (Dev)
 </button>
 )}
 </div>
 <p className="mb-8 text-base leading-relaxed text-primary">
 Capture the narrative + constraints that shape risk assessment.
 </p>

 <div className="space-y-6">
 {/* Structured Description (Required) */}
 <div className="relative">
 <label htmlFor="structuredDescription" className="mb-2 block text-base font-semibold text-primary">
 Describe your idea using the structure below:
 </label>
 <textarea
 id="structuredDescription"
 value={structuredDescription}
 onChange={(e) => setStructuredDescription(e.target.value)}
 rows={12}
  className="ui-textarea focus-visible:outline-accent resize-y"
 placeholder={`1. Problem: 
2. Solution:
3. User:
4. Differentiation:
5. Monetization:
6. Scope/Region:`}
 />
 </div>

 {/* Optional Fields */}
 {OPTIONAL_FIELDS.map((field) => {
 if (["initial_budget", "delivery_channel"].includes(field.id)) {
 return (
 <div key={field.id}>
 <label htmlFor={field.id} className="mb-2 block text-base font-semibold text-primary">
 {field.question}
 </label>
 <select
 id={field.id}
 value={optionalAnswers[field.id] || ""}
 onChange={(e) => handleOptionalAnswer(field.id, e.target.value)}
  className="ui-select focus-visible:outline-accent"
 >
 <option value="">Select an option...</option>
 {field.options.map((option) => (
 <option key={option} value={option}>
 {option}
 </option>
 ))}
 </select>
 </div>
 );
 } else if (field.id === "constraints" && field.multiSelect) {
 return (
 <div key={field.id}>
 <label className="mb-2 block text-base font-semibold text-primary">
 {field.question}
 </label>
 <div className="space-y-2">
 {field.options.map((option) => (
 <label key={option} className="flex items-center space-x-3 cursor-pointer">
 <input
 type="checkbox"
 checked={optionalAnswers.constraints.includes(option)}
 onChange={() => handleConstraintToggle(option)}
 className="h-4 w-4 rounded border-default text-accent "
 />
 <span className="text-sm text-primary">{option}</span>
 </label>
 ))}
 </div>
 </div>
 );
 }
 return null;
 })}

 {/* Competitors (Optional Textbox) */}
 <div>
 <label htmlFor="competitors" className="mb-2 block text-base font-semibold text-primary">
 Any competitors you already know? (Optional)
 </label>
 <input
 type="text"
 id="competitors"
 value={optionalAnswers.competitors || ""}
 onChange={(e) => handleOptionalAnswer("competitors", e.target.value)}
 placeholder="List websites, apps, or companies (optional)"
  className="ui-input focus-visible:outline-accent"
 />
 </div>
 </div>

 {error && (
 <div className="badge-danger mt-6 rounded-xl p-4 text-sm font-semibold">
 {error}
 </div>
 )}

 <div className="mt-8 flex items-center justify-between">
 <button
 type="button"
 onClick={handleBack}
 disabled={loading}
 className={`rounded-xl border border-default bg-surface px-6 py-3 text-base font-semibold text-primary text-secondary shadow-sm transition-all duration-200 hover:bg-surface hover:bg-surface hover:-translate-y-0.5 whitespace-nowrap ${loading ? "cursor-not-allowed opacity-50" : ""}`}
 >
 ← Back
 </button>
 <button
 type="button"
 onClick={handleNext}
 disabled={loading}
  className="ui-btn ui-btn-primary focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
 >
 {loading ? "Validating..." : "Validate Idea →"}
 </button>
 </div>
 </div>
 )}
 </section>
 </FocusLayout>
 );
}

