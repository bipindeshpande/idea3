import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { validationQuestions } from "../../config/validationQuestions.js";
import { formFieldsConfig } from "../../config/formFieldsConfig.js";

const ADMIN_PASSWORD = "admin2024"; // Change this to your desired password
const ADMIN_STORAGE_KEY = "sia_admin_authenticated";
const ADMIN_MFA_SECRET = "JBSWY3DPEHPK3PXP"; // Base32 encoded secret for TOTP

export default function Admin() {
 const navigate = useNavigate();
 const [authenticated, setAuthenticated] = useState(false);
 const [password, setPassword] = useState("");
 const [mfaCode, setMfaCode] = useState("");
 const [showMfa, setShowMfa] = useState(false);
 const [error, setError] = useState("");
 const [activeTab, setActiveTab] = useState("validation");
 const [checkingAuth, setCheckingAuth] = useState(true);

 // Always require fresh authentication - always show login screen first
 useEffect(() => {
 // Always start with login screen - don't auto-authenticate
 // This ensures admin must authenticate every time they visit /admin
 setCheckingAuth(false);
 setAuthenticated(false);
 // Clear any stale authentication to force fresh login
 localStorage.removeItem(ADMIN_STORAGE_KEY);
 }, []);

 const verifyAdminSession = async () => {
 try {
 // Check if admin session is still valid by trying to access a protected endpoint
 const authToken = localStorage.getItem(ADMIN_STORAGE_KEY) === "true" ? ADMIN_PASSWORD : "";
 const response = await fetch("/api/admin/stats", {
 headers: {
 "Authorization": `Bearer ${authToken}`,
 },
 });

 if (response.ok) {
 // Session is valid
 return true;
 } else {
 // Session invalid, clear and show login
 localStorage.removeItem(ADMIN_STORAGE_KEY);
 setAuthenticated(false);
 return false;
 }
 } catch (error) {
 // On error, clear and show login
 localStorage.removeItem(ADMIN_STORAGE_KEY);
 setAuthenticated(false);
 return false;
 }
 };

 const handleLogin = async (e) => {
 e.preventDefault();
 setError("");
 
 if (!showMfa) {
 // First step: verify password via API
 try {
 const response = await fetch("/api/admin/login", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 },
 body: JSON.stringify({ password }),
 });

 const data = await response.json();
 if (data.success) {
 setShowMfa(true);
 setPassword("");
 } else {
 setError(data.error || "Incorrect password");
 setPassword("");
 }
 } catch (err) {
 // Fallback to local check for backward compatibility
 if (password === ADMIN_PASSWORD) {
 setShowMfa(true);
 setPassword("");
 } else {
 setError("Incorrect password");
 setPassword("");
 }
 }
 } else {
 // Second step: verify MFA code
 // Development mode: Accept hardcoded code "2538"
 // Production: Will use proper TOTP validation
 if (mfaCode === "2538") {
 localStorage.setItem(ADMIN_STORAGE_KEY, "true");
 setAuthenticated(true);
 setError("");
 setMfaCode("");
 setShowMfa(false);
 } else {
 setError("Invalid MFA code. Please enter the correct code.");
 setMfaCode("");
 }
 }
 };

 const handleLogout = () => {
 localStorage.removeItem(ADMIN_STORAGE_KEY);
 setAuthenticated(false);
 setShowMfa(false);
 setPassword("");
 setMfaCode("");
 setError("");
 // Redirect to admin login (not home page)
 navigate("/admin");
 };

 // Verify authentication on mount and when authenticated state changes
 useEffect(() => {
 if (authenticated) {
 // Periodically verify session is still valid
 const interval = setInterval(() => {
 verifyAdminSession();
 }, 5 * 60 * 1000); // Check every 5 minutes

 return () => clearInterval(interval);
 }
 }, [authenticated]);

 // Show loading while checking authentication
 if (checkingAuth) {
 return (
 <section className="mx-auto max-w-md px-6 py-12">
 <Seo title="Admin Login | Startup Idea Advisor" description="Admin access" path="/admin" />
 <div className="ui-card rounded-[16px] p-6 shadow-card">
 <div className="flex items-center justify-center py-8">
 <div className="text-secondary">Checking authentication...</div>
 </div>
 </div>
 </section>
 );
 }

 // Always show login screen first - require authentication
 if (!authenticated) {
 return (
 <section className="mx-auto max-w-md px-6 py-12">
 <Seo title="Admin Login | Startup Idea Advisor" description="Admin access" path="/admin" />
 <div className="ui-card rounded-[16px] p-6 shadow-card">
 <h1 className="mb-6 text-2xl font-bold text-primary">Admin Login</h1>
 <form onSubmit={handleLogin}>
 {!showMfa ? (
 <>
 <div className="mb-4">
 <label htmlFor="password" className="mb-2 block text-sm font-semibold text-primary">
 Password
 </label>
 <input
 type="password"
 id="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 autoComplete="current-password"
 className="ui-input focus-visible:outline-accent"
 placeholder="Enter admin password"
 autoFocus
 />
 </div>
 {error && (
 <div className="badge-danger mb-4 rounded-xl p-3 text-sm">
 {error}
 </div>
 )}
 <button
 type="submit"
 className="ui-btn ui-btn-primary w-full focus-visible:outline-accent"
 >
 Continue
 </button>
 <div className="mt-4 text-center">
 <button
 type="button"
 onClick={() => navigate("/admin/forgot-password")}
 className="text-sm text-accent hover:text-accent-hover"
 >
 Forgot Password?
 </button>
 </div>
 </>
 ) : (
 <>
 <div className="mb-4">
 <label htmlFor="mfaCode" className="mb-2 block text-sm font-semibold text-primary">
 Two-Factor Authentication Code
 </label>
 <input
 type="text"
 id="mfaCode"
 value={mfaCode}
 onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
 className="ui-input text-center text-2xl tracking-widest font-mono focus-visible:outline-accent"
 placeholder="Enter MFA code"
 autoFocus
 />
 <p className="mt-2 text-xs text-secondary text-center">
 Development mode: Enter MFA code
 </p>
 </div>
 {error && (
 <div className="badge-danger mb-4 rounded-xl p-3 text-sm">
 {error}
 </div>
 )}
 <div className="flex gap-3">
 <button
 type="button"
 onClick={() => {
 setShowMfa(false);
 setMfaCode("");
 setError("");
 }}
 className="ui-btn ui-btn-secondary flex-1 focus-visible:outline-accent"
 >
 Back
 </button>
 <button
 type="submit"
 className="ui-btn ui-btn-primary flex-1 focus-visible:outline-accent"
 >
 Verify & Login
 </button>
 </div>
 </>
 )}
 </form>
 </div>
 </section>
 );
 }

 return (
 <section className="mx-auto max-w-5xl px-6 py-12">
 <Seo title="Admin Panel | Startup Idea Advisor" description="Content management" path="/admin" />
 
 <div className="mb-6 flex items-center justify-between">
 <h1 className="text-3xl font-bold text-primary">Admin Panel</h1>
 <button
 onClick={handleLogout}
 className="ui-btn ui-btn-secondary focus-visible:outline-accent"
 >
 Logout
 </button>
 </div>

 {/* Tabs */}
 <div className="mb-6 flex gap-2 border-b border-default overflow-x-auto">
 <button
 onClick={() => setActiveTab("dashboard")}
 className={`px-4 py-2 text-sm font-semibold transition whitespace-nowrap ${
 activeTab === "dashboard"
 ? "border-b-2 border-default border-default text-accent text-accent"
 : "text-secondary text-secondary hover:text-primary hover:text-primary"
 }`}
 >
 Dashboard
 </button>
 <button
 onClick={() => setActiveTab("reports")}
 className={`px-4 py-2 text-sm font-semibold transition whitespace-nowrap ${
 activeTab === "reports"
 ? "border-b-2 border-default border-default text-accent text-accent"
 : "text-secondary text-secondary hover:text-primary hover:text-primary"
 }`}
 >
 Reports
 </button>
 <button
 onClick={() => setActiveTab("stats")}
 className={`px-4 py-2 text-sm font-semibold transition whitespace-nowrap ${
 activeTab === "stats"
 ? "border-b-2 border-default border-default text-accent text-accent"
 : "text-secondary text-secondary hover:text-primary hover:text-primary"
 }`}
 >
 Statistics
 </button>
 <button
 onClick={() => setActiveTab("users")}
 className={`px-4 py-2 text-sm font-semibold transition whitespace-nowrap ${
 activeTab === "users"
 ? "border-b-2 border-default border-default text-accent text-accent"
 : "text-secondary text-secondary hover:text-primary hover:text-primary"
 }`}
 >
 Users
 </button>
 <button
 onClick={() => setActiveTab("payments")}
 className={`px-4 py-2 text-sm font-semibold transition whitespace-nowrap ${
 activeTab === "payments"
 ? "border-b-2 border-default border-default text-accent text-accent"
 : "text-secondary text-secondary hover:text-primary hover:text-primary"
 }`}
 >
 Payments
 </button>
 <button
 onClick={() => setActiveTab("validation")}
 className={`px-4 py-2 text-sm font-semibold transition whitespace-nowrap ${
 activeTab === "validation"
 ? "border-b-2 border-default border-default text-accent text-accent"
 : "text-secondary text-secondary hover:text-primary hover:text-primary"
 }`}
 >
 Validation Questions
 </button>
 <button
 onClick={() => setActiveTab("intake")}
 className={`px-4 py-2 text-sm font-semibold transition whitespace-nowrap ${
 activeTab === "intake"
 ? "border-b-2 border-default border-default text-accent text-accent"
 : "text-secondary text-secondary hover:text-primary hover:text-primary"
 }`}
 >
 Intake Form Fields
 </button>
 </div>

 {/* Content Management */}
 {activeTab === "dashboard" && <AdminDashboard />}
 {activeTab === "reports" && <AdminReports />}
 {activeTab === "stats" && <AdminStats />}
 {activeTab === "users" && <UsersManagement />}
 {activeTab === "payments" && <PaymentsManagement />}
 {activeTab === "validation" && <ValidationQuestionsEditor />}
 {activeTab === "intake" && <IntakeFieldsEditor />}
 </section>
 );
}

function ValidationQuestionsEditor() {
 const [questions, setQuestions] = useState(validationQuestions.category_questions);
 const [ideaQuestions, setIdeaQuestions] = useState(validationQuestions.idea_explanation_questions || []);
 const [saved, setSaved] = useState(false);

 const handleSave = async () => {
 try {
 const authToken = localStorage.getItem(ADMIN_STORAGE_KEY) === "true" ? ADMIN_PASSWORD : "";
 const response = await fetch("/api/admin/save-validation-questions", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 "Authorization": `Bearer ${authToken}`,
 },
 body: JSON.stringify({
 questions: {
 category_questions: questions,
 idea_explanation_questions: ideaQuestions,
 },
 }),
 });

 if (!response.ok) {
 const errorText = await response.text();
 let errorMessage = `Failed to save (${response.status})`;
 try {
 const errorData = JSON.parse(errorText);
 errorMessage = errorData.error || errorMessage;
 } catch {
 errorMessage = errorText.includes("<!doctype") 
 ? "Backend route not found. Please check server configuration."
 : errorText || errorMessage;
 }
 alert(errorMessage);
 return;
 }

 const data = await response.json();
 if (data.success) {
 setSaved(true);
 setTimeout(() => setSaved(false), 3000);
 // Also save to localStorage as backup
 localStorage.setItem("sia_validation_questions", JSON.stringify({ category_questions: questions, idea_explanation_questions: ideaQuestions }));
 } else {
 alert(`Failed to save: ${data.error || "Unknown error"}`);
 }
 } catch (error) {
 console.error("Save error:", error);
 const errorMessage = error.message || "Network error";
 alert(`Backend save failed: ${errorMessage}. Data saved to localStorage as backup.`);
 // Fallback to localStorage
 localStorage.setItem("sia_validation_questions", JSON.stringify({ category_questions: questions, idea_explanation_questions: ideaQuestions }));
 setSaved(true);
 setTimeout(() => setSaved(false), 3000);
 }
 };

 const addQuestion = () => {
 setQuestions([
 ...questions,
 {
 id: `question_${Date.now()}`,
 question: "New Question",
 options: ["Option 1", "Option 2"],
 },
 ]);
 };

 const updateQuestion = (index, field, value) => {
 const updated = [...questions];
 updated[index] = { ...updated[index], [field]: value };
 setQuestions(updated);
 };

 const deleteQuestion = (index) => {
 if (confirm("Are you sure you want to delete this question?")) {
 setQuestions(questions.filter((_, i) => i !== index));
 }
 };

 const addOption = (questionIndex) => {
 const updated = [...questions];
 updated[questionIndex].options = [...updated[questionIndex].options, "New Option"];
 setQuestions(updated);
 };

 const updateOption = (questionIndex, optionIndex, value) => {
 const updated = [...questions];
 updated[questionIndex].options[optionIndex] = value;
 setQuestions(updated);
 };

 const deleteOption = (questionIndex, optionIndex) => {
 const updated = [...questions];
 updated[questionIndex].options = updated[questionIndex].options.filter((_, i) => i !== optionIndex);
 setQuestions(updated);
 };

 return (
 <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
 <div className="mb-6 flex items-center justify-between">
 <h2 className="text-2xl font-semibold text-primary text-secondary">Validation Questions</h2>
 <button
 onClick={handleSave}
 className="ui-btn ui-btn-primary focus-visible:outline-accent"
 >
 {saved ? "✓ Saved" : "Save Changes"}
 </button>
 </div>

 {/* Category Questions */}
 <div className="mb-8">
 <div className="mb-4 flex items-center justify-between">
 <h3 className="text-xl font-semibold text-primary">Category Questions</h3>
 <button
 onClick={addQuestion}
 className="rounded-xl border border-default bg-surface px-4 py-2 text-sm font-semibold text-accent transition hover:bg-surface"
 >
 + Add Question
 </button>
 </div>

 <div className="space-y-6">
 {questions.map((question, qIndex) => (
 <div key={question.id} className="rounded-2xl border border-default bg-app p-6">
 <div className="mb-4 flex items-start justify-between gap-4">
 <div className="flex-1">
 <label className="mb-2 block text-sm font-semibold text-primary">Question ID</label>
 <input
 type="text"
 value={question.id}
 onChange={(e) => updateQuestion(qIndex, "id", e.target.value)}
 className="mb-3 w-full rounded-lg border border-default bg-surface p-2 text-sm"
 />
 <label className="mb-2 block text-sm font-semibold text-primary">Question Text</label>
 <input
 type="text"
 value={question.question}
 onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
 className="w-full rounded-lg border border-default bg-surface p-2 text-sm"
 />
 </div>
 <button
 onClick={() => deleteQuestion(qIndex)}
 className="ui-btn badge-danger focus-visible:outline-accent"
 >
 Delete
 </button>
 </div>

 <div className="mt-4">
 <div className="mb-2 flex items-center justify-between">
 <label className="text-sm font-semibold text-primary">Options</label>
 <button
 onClick={() => addOption(qIndex)}
 className="rounded-lg border border-default bg-surface px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-surface"
 >
 + Add Option
 </button>
 </div>
 <div className="space-y-2">
 {question.options.map((option, oIndex) => (
 <div key={oIndex} className="flex gap-2">
 <input
 type="text"
 value={option}
 onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
 className="flex-1 rounded-lg border border-default bg-surface p-2 text-sm"
 />
 <button
 onClick={() => deleteOption(qIndex, oIndex)}
 className="rounded-lg border border-default bg-surface px-3 py-2 text-sm text-secondary transition hover:bg-surface"
 >
 ×
 </button>
 </div>
 ))}
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Idea Explanation Questions */}
 <div>
 <h3 className="mb-4 text-xl font-semibold text-primary">Idea Explanation Questions</h3>
 <div className="space-y-6">
 {ideaQuestions.map((q, index) => (
 <div key={q.id || index} className="rounded-lg border border-default bg-surface p-4">
 <input
 type="text"
 value={q.question}
 onChange={(e) => {
 const updated = [...ideaQuestions];
 updated[index] = { ...updated[index], question: e.target.value };
 setIdeaQuestions(updated);
 }}
 placeholder="Question text"
 className="mb-3 w-full rounded-lg border border-default bg-surface p-2 text-sm font-semibold"
 />
 <div className="space-y-2">
 {q.options.map((opt, optIndex) => (
 <input
 key={optIndex}
 type="text"
 value={opt}
 onChange={(e) => {
 const updated = [...ideaQuestions];
 updated[index].options[optIndex] = e.target.value;
 setIdeaQuestions(updated);
 }}
 className="w-full rounded-lg border border-default bg-surface p-2 text-sm"
 placeholder={`Option ${optIndex + 1}`}
 />
 ))}
 <button
 onClick={() => {
 const updated = [...ideaQuestions];
 updated[index].options.push("New Option");
 setIdeaQuestions(updated);
 }}
 className="mt-2 rounded-lg border border-default bg-surface px-3 py-1 text-xs font-semibold text-accent transition hover:bg-surface"
 >
 + Add Option
 </button>
 </div>
 </div>
 ))}
 <button
 onClick={() => setIdeaQuestions([...ideaQuestions, { id: `idea_${Date.now()}`, question: "New Question", options: ["Option 1", "Option 2"] }])}
 className="mt-2 rounded-lg border border-default bg-surface px-4 py-2 text-sm font-semibold text-accent transition hover:bg-surface"
 >
 + Add Question
 </button>
 </div>
 </div>
 </div>
 );
}

function IntakeFieldsEditor() {
 const [screenTitle, setScreenTitle] = useState(formFieldsConfig.screen_title);
 const [screenDescription, setScreenDescription] = useState(formFieldsConfig.description);
 const [fields, setFields] = useState(formFieldsConfig.fields);
 const [saved, setSaved] = useState(false);

 const handleSave = async () => {
 try {
 const authToken = localStorage.getItem(ADMIN_STORAGE_KEY) === "true" ? ADMIN_PASSWORD : "";
 const response = await fetch("/api/admin/save-intake-fields", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 "Authorization": `Bearer ${authToken}`,
 },
 body: JSON.stringify({
 screen_id: formFieldsConfig.screen_id,
 screen_title: screenTitle,
 description: screenDescription,
 fields: fields,
 }),
 });

 if (!response.ok) {
 const errorText = await response.text();
 let errorMessage = `Failed to save (${response.status})`;
 try {
 const errorData = JSON.parse(errorText);
 errorMessage = errorData.error || errorMessage;
 } catch {
 errorMessage = errorText.includes("<!doctype") 
 ? "Backend route not found. Please check server configuration."
 : errorText || errorMessage;
 }
 alert(errorMessage);
 return;
 }

 const data = await response.json();
 if (data.success) {
 setSaved(true);
 setTimeout(() => setSaved(false), 3000);
 // Also save to localStorage as backup
 localStorage.setItem("sia_intake_fields", JSON.stringify(fields));
 } else {
 alert(`Failed to save: ${data.error || "Unknown error"}`);
 }
 } catch (error) {
 console.error("Save error:", error);
 const errorMessage = error.message || "Network error";
 alert(`Backend save failed: ${errorMessage}. Data saved to localStorage as backup.`);
 // Fallback to localStorage
 localStorage.setItem("sia_intake_fields", JSON.stringify(fields));
 setSaved(true);
 setTimeout(() => setSaved(false), 3000);
 }
 };

 const addField = () => {
 setFields([
 ...fields,
 {
 id: `field_${Date.now()}`,
 label: "New Field",
 type: "picklist",
 options: ["Option 1"],
 required: false,
 },
 ]);
 };

 const updateField = (index, field, value) => {
 const updated = [...fields];
 updated[index] = { ...updated[index], [field]: value };
 setFields(updated);
 };

 const deleteField = (index) => {
 if (confirm("Are you sure you want to delete this field?")) {
 setFields(fields.filter((_, i) => i !== index));
 }
 };

 return (
 <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
 <div className="mb-6 flex items-center justify-between">
 <h2 className="text-2xl font-semibold text-primary text-secondary">Intake Form Fields</h2>
 <button
 onClick={handleSave}
 className="ui-btn ui-btn-primary focus-visible:outline-accent"
 >
 {saved ? "✓ Saved" : "Save Changes"}
 </button>
 </div>

 <div className="mb-6 space-y-4">
 <div>
 <label className="mb-2 block text-sm font-semibold text-primary">Screen Title</label>
 <input
 type="text"
 value={screenTitle}
 onChange={(e) => setScreenTitle(e.target.value)}
 className="w-full rounded-lg border border-default bg-surface p-2 text-sm"
 />
 </div>
 <div>
 <label className="mb-2 block text-sm font-semibold text-primary">Screen Description</label>
 <textarea
 value={screenDescription}
 onChange={(e) => setScreenDescription(e.target.value)}
 rows={3}
 className="w-full rounded-lg border border-default bg-surface p-2 text-sm"
 />
 </div>
 </div>

 <div className="mb-4 flex items-center justify-between">
 <h3 className="text-xl font-semibold text-primary">Form Fields</h3>
 <button
 onClick={addField}
 className="rounded-xl border border-default bg-surface px-4 py-2 text-sm font-semibold text-accent transition hover:bg-surface"
 >
 + Add Field
 </button>
 </div>

 <div className="space-y-6">
 {fields.map((field, index) => (
 <div key={field.id} className="rounded-2xl border border-default bg-app p-6">
 <div className="mb-4 grid grid-cols-2 gap-4">
 <div>
 <label className="mb-2 block text-sm font-semibold text-primary">Field ID</label>
 <input
 type="text"
 value={field.id}
 onChange={(e) => updateField(index, "id", e.target.value)}
 className="w-full rounded-lg border border-default bg-surface p-2 text-sm"
 />
 </div>
 <div>
 <label className="mb-2 block text-sm font-semibold text-primary">Label</label>
 <input
 type="text"
 value={field.label}
 onChange={(e) => updateField(index, "label", e.target.value)}
 className="w-full rounded-lg border border-default bg-surface p-2 text-sm"
 />
 </div>
 </div>

 <div className="mb-4 grid grid-cols-2 gap-4">
 <div>
 <label className="mb-2 block text-sm font-semibold text-primary">Type</label>
 <select
 value={field.type}
 onChange={(e) => updateField(index, "type", e.target.value)}
 className="w-full rounded-lg border border-default bg-surface p-2 text-sm"
 >
 <option value="picklist">Picklist</option>
 <option value="short_text">Short Text</option>
 <option value="long_text">Long Text</option>
 </select>
 </div>
 <div className="flex items-center pt-8">
 <label className="flex items-center gap-2">
 <input
 type="checkbox"
 checked={field.required || false}
 onChange={(e) => updateField(index, "required", e.target.checked)}
 className="rounded border-default"
 />
 <span className="text-sm font-semibold text-primary">Required</span>
 </label>
 </div>
 </div>

 {field.type === "picklist" && (
 <div className="mt-4">
 <label className="mb-2 block text-sm font-semibold text-primary">Options</label>
 <div className="space-y-2">
 {(field.options || []).map((option, oIndex) => (
 <div key={oIndex} className="flex gap-2">
 <input
 type="text"
 value={option}
 onChange={(e) => {
 const updated = [...fields];
 updated[index].options[oIndex] = e.target.value;
 setFields(updated);
 }}
 className="flex-1 rounded-lg border border-default bg-surface p-2 text-sm"
 />
 <button
 onClick={() => {
 const updated = [...fields];
 updated[index].options = updated[index].options.filter((_, i) => i !== oIndex);
 setFields(updated);
 }}
 className="rounded-lg border border-default bg-surface px-3 py-2 text-sm text-secondary transition hover:bg-surface"
 >
 ×
 </button>
 </div>
 ))}
 <button
 onClick={() => {
 const updated = [...fields];
 if (!updated[index].options) updated[index].options = [];
 updated[index].options.push("New Option");
 setFields(updated);
 }}
 className="rounded-lg border border-default bg-surface px-4 py-2 text-sm font-semibold text-accent transition hover:bg-surface"
 >
 + Add Option
 </button>
 </div>
 </div>
 )}

 <div className="mt-4 flex justify-end">
 <button
 onClick={() => deleteField(index)}
 className="ui-btn badge-danger focus-visible:outline-accent"
 >
 Delete Field
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}

function AdminStats() {
 const [stats, setStats] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 useEffect(() => {
 const loadStats = async () => {
 // Only load if authenticated
 if (localStorage.getItem(ADMIN_STORAGE_KEY) !== "true") {
 setError("Not authenticated");
 setLoading(false);
 return;
 }

 try {
 const authToken = ADMIN_PASSWORD;
 const response = await fetch("/api/admin/stats", {
 headers: {
 "Authorization": `Bearer ${authToken}`,
 },
 });

 if (response.ok) {
 const data = await response.json();
 if (data.success && data.stats) {
 setStats(data.stats);
 setError(null);
 } else {
 setError(data.error || "Invalid response format");
 console.error("Invalid response format:", data);
 }
 } else {
 const errorData = await response.json().catch(() => ({}));
 setError(errorData.error || `Failed to load statistics (${response.status})`);
 console.error("Failed to load stats:", response.status, errorData);
 }
 } catch (error) {
 setError(`Network error: ${error.message}`);
 console.error("Failed to load stats:", error);
 } finally {
 setLoading(false);
 }
 };

 loadStats();
 }, []);

 if (loading) {
 return (
 <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
 <p className="text-secondary text-secondary">Loading statistics...</p>
 </div>
 );
 }

 if (error) {
 return (
 <div className="ui-card badge-danger rounded-[16px] p-6 shadow-card">
 <p className="font-semibold">Error loading statistics</p>
 <p className="mt-2 text-sm">{error}</p>
 </div>
 );
 }

 if (!stats) {
 return (
 <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
 <p className="text-secondary text-secondary">No statistics available</p>
 </div>
 );
 }

 return (
 <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
 <h2 className="mb-6 text-2xl font-semibold text-primary text-secondary">Statistics</h2>
 
 <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
 <div className="rounded-2xl border border-default bg-surface p-6">
 <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">Total Users</h3>
 <p className="text-3xl font-bold text-accent">{stats.total_users || 0}</p>
 <p className="mt-2 text-xs text-accent">Registered users</p>
 </div>

 <div className="ui-card rounded-[16px] p-6 shadow-card">
 <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-secondary">Total Runs</h3>
 <p className="text-3xl font-bold text-primary font-mono">{stats.total_runs || 0}</p>
 <p className="mt-2 text-xs text-secondary">Idea discovery sessions</p>
 </div>

 <div className="ui-card rounded-[16px] p-6 shadow-card">
 <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-secondary">Total Validations</h3>
 <p className="text-3xl font-bold text-primary font-mono">{stats.total_validations || 0}</p>
 <p className="mt-2 text-xs text-secondary">Idea validations completed</p>
 </div>

 <div className="rounded-2xl border border-default bg-surface p-6">
 <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">Total Revenue</h3>
 <p className="text-3xl font-bold text-accent">${(stats.total_revenue || 0).toFixed(2)}</p>
 <p className="mt-2 text-xs text-accent">From completed payments</p>
 </div>
 </div>

 <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
 <div className="rounded-2xl border border-default bg-app bg-surface p-4">
 <h3 className="mb-2 text-sm font-semibold text-primary text-secondary">Active Subscriptions</h3>
 <p className="text-2xl font-bold text-primary text-secondary">{stats.active_subscriptions || 0}</p>
 </div>

 <div className="rounded-2xl border border-default bg-app bg-surface p-4">
 <h3 className="mb-2 text-sm font-semibold text-primary text-secondary">Free Trial Users</h3>
 <p className="text-2xl font-bold text-primary text-secondary">{stats.free_trial_users || 0}</p>
 </div>

 <div className="rounded-2xl border border-default bg-app bg-surface p-4">
 <h3 className="mb-2 text-sm font-semibold text-primary text-secondary">Weekly Subscribers</h3>
 <p className="text-2xl font-bold text-primary text-secondary">{stats.weekly_subscribers || 0}</p>
 </div>

 <div className="rounded-2xl border border-default bg-app bg-surface p-4">
 <h3 className="mb-2 text-sm font-semibold text-primary text-secondary">Monthly Subscribers</h3>
 <p className="text-2xl font-bold text-primary text-secondary">{stats.monthly_subscribers || 0}</p>
 </div>
 </div>

 <div className="mt-8">
 <div className="rounded-2xl border border-default bg-app bg-surface p-4">
 <h3 className="mb-2 text-sm font-semibold text-primary text-secondary">Completed Payments</h3>
 <p className="text-2xl font-bold text-primary text-secondary">{stats.total_payments || 0}</p>
 </div>
 </div>
 </div>
 );
}

function UsersManagement() {
 const [users, setUsers] = useState([]);
 const [loading, setLoading] = useState(true);
 const [selectedUser, setSelectedUser] = useState(null);
 const [userDetail, setUserDetail] = useState(null);

 useEffect(() => {
 loadUsers();
 }, []);

 const loadUsers = async () => {
 try {
 const authToken = localStorage.getItem(ADMIN_STORAGE_KEY) === "true" ? ADMIN_PASSWORD : "";
 const response = await fetch("/api/admin/users", {
 headers: {
 "Authorization": `Bearer ${authToken}`,
 },
 });

 if (response.ok) {
 const data = await response.json();
 setUsers(data.users || []);
 }
 } catch (error) {
 console.error("Failed to load users:", error);
 } finally {
 setLoading(false);
 }
 };

 const loadUserDetail = async (userId) => {
 try {
 const authToken = localStorage.getItem(ADMIN_STORAGE_KEY) === "true" ? ADMIN_PASSWORD : "";
 const response = await fetch(`/api/admin/user/${userId}`, {
 headers: {
 "Authorization": `Bearer ${authToken}`,
 },
 });

 if (response.ok) {
 const data = await response.json();
 setUserDetail(data);
 setSelectedUser(userId);
 }
 } catch (error) {
 console.error("Failed to load user detail:", error);
 }
 };

 const getStatusBadge = (user) => {
 if (user.is_subscription_active) {
 return (
 <span className="inline-block rounded-full bg-surface bg-surface px-2 py-1 text-xs font-semibold text-accent text-accent">
 Active
 </span>
 );
 } else if (user.subscription_type === "free_trial") {
 return (
 <span className="inline-block rounded-full bg-surface bg-surface px-2 py-1 text-xs font-semibold text-accent text-accent">
 Free Trial
 </span>
 );
 } else {
 return (
 <span className="inline-block rounded-full bg-app bg-surface px-2 py-1 text-xs font-semibold text-primary text-secondary">
 Expired
 </span>
 );
 }
 };

 if (loading) {
 return (
 <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
 <p className="text-secondary text-secondary">Loading users...</p>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
 <div className="mb-6 flex items-center justify-between">
 <h2 className="text-2xl font-semibold text-primary text-secondary">Users ({users.length})</h2>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-default">
 <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">Email</th>
 <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">Subscription</th>
 <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">Status</th>
 <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">Days Remaining</th>
 <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">Created</th>
 <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">Actions</th>
 </tr>
 </thead>
 <tbody>
 {users.map((user) => (
 <tr key={user.id} className="border-b border-default hover:bg-surface hover:bg-surface">
 <td className="px-4 py-3 text-primary text-secondary">{user.email}</td>
 <td className="px-4 py-3 text-secondary text-secondary">{user.subscription_type || "N/A"}</td>
 <td className="px-4 py-3">{getStatusBadge(user)}</td>
 <td className="px-4 py-3 text-secondary text-secondary">{user.days_remaining || 0}</td>
 <td className="px-4 py-3 text-secondary text-secondary">
 {user.subscription_started_at ? new Date(user.subscription_started_at).toLocaleDateString() : "N/A"}
 </td>
 <td className="px-4 py-3">
 <button
 onClick={() => loadUserDetail(user.id)}
 className="rounded-lg border border-default bg-surface px-3 py-1 text-xs font-semibold text-accent transition hover:bg-surface-hover"
 >
 View Details
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {userDetail && (
 <UserDetailModal
 userDetail={userDetail}
 onClose={() => {
 setUserDetail(null);
 setSelectedUser(null);
 }}
 onUpdate={loadUsers}
 />
 )}
 </div>
 );
}

function UserDetailModal({ userDetail, onClose, onUpdate }) {
 const [subscriptionType, setSubscriptionType] = useState(userDetail.user.subscription_type || "free_trial");
 const [durationDays, setDurationDays] = useState(7);
 const [saving, setSaving] = useState(false);

 const handleUpdateSubscription = async () => {
 setSaving(true);
 try {
 const authToken = localStorage.getItem(ADMIN_STORAGE_KEY) === "true" ? ADMIN_PASSWORD : "";
 const response = await fetch(`/api/admin/user/${userDetail.user.id}/subscription`, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 "Authorization": `Bearer ${authToken}`,
 },
 body: JSON.stringify({
 subscription_type: subscriptionType,
 duration_days: durationDays,
 }),
 });

 if (response.ok) {
 alert("Subscription updated successfully");
 onUpdate();
 onClose();
 } else {
 const data = await response.json();
 alert(`Failed to update: ${data.error}`);
 }
 } catch (error) {
 alert(`Error: ${error.message}`);
 } finally {
 setSaving(false);
 }
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface backdrop-blur-sm">
 <div className="mx-4 w-full max-w-2xl rounded-3xl border border-default bg-surface p-8 shadow-xl">
 <div className="mb-6 flex items-center justify-between">
 <h2 className="text-2xl font-bold text-primary text-secondary">User Details</h2>
 <button
 onClick={onClose}
 className="rounded-lg p-1 text-secondary text-secondary transition hover:bg-surface hover:bg-surface hover:text-primary hover:text-primary"
 >
 ×
 </button>
 </div>

 <div className="space-y-4">
 <div>
 <h3 className="mb-2 font-semibold text-primary text-secondary">Email</h3>
 <p className="text-secondary text-secondary">{userDetail.user.email}</p>
 </div>

 <div>
 <h3 className="mb-2 font-semibold text-primary text-secondary">Current Subscription</h3>
 <p className="text-secondary text-secondary">
 {userDetail.user.subscription_type || "N/A"} - {userDetail.user.days_remaining || 0} days remaining
 </p>
 </div>

 <div>
 <h3 className="mb-2 font-semibold text-primary text-secondary">Update Subscription</h3>
 <div className="space-y-3">
 <select
 value={subscriptionType}
 onChange={(e) => setSubscriptionType(e.target.value)}
 className="w-full rounded-lg border border-default bg-surface p-2 text-sm text-primary text-secondary"
 >
 <option value="free_trial">Free Trial</option>
 <option value="weekly">Weekly ($5)</option>
 <option value="starter">Starter ($7/month)</option>
 <option value="pro">Pro ($15/month)</option>
 </select>
 <input
 type="number"
 value={durationDays}
 onChange={(e) => setDurationDays(parseInt(e.target.value) || 0)}
 placeholder="Duration in days"
 className="w-full rounded-lg border border-default bg-surface p-2 text-sm text-primary text-secondary"
 />
 <button
 onClick={handleUpdateSubscription}
 disabled={saving}
 className="ui-btn ui-btn-primary w-full focus-visible:outline-accent disabled:opacity-50"
 >
 {saving ? "Updating..." : "Update Subscription"}
 </button>
 </div>
 </div>

 <div>
 <h3 className="mb-2 font-semibold text-primary text-secondary">Runs ({userDetail.runs?.length || 0})</h3>
 <div className="max-h-40 space-y-1 overflow-y-auto">
 {userDetail.runs?.map((run) => (
 <div key={run.id} className="rounded-lg border border-default bg-app bg-surface p-2 text-xs text-primary text-secondary">
 {run.run_id} - {run.created_at ? new Date(run.created_at).toLocaleString() : "N/A"}
 </div>
 ))}
 </div>
 </div>

 <div>
 <h3 className="mb-2 font-semibold text-primary text-secondary">Validations ({userDetail.validations?.length || 0})</h3>
 <div className="max-h-40 space-y-1 overflow-y-auto">
 {userDetail.validations?.map((validation) => (
 <div key={validation.id} className="rounded-lg border border-default bg-app bg-surface p-2 text-xs text-primary text-secondary">
 {validation.validation_id} - {validation.created_at ? new Date(validation.created_at).toLocaleString() : "N/A"}
 </div>
 ))}
 </div>
 </div>

 <div>
 <h3 className="mb-2 font-semibold text-primary text-secondary">Payments ({userDetail.payments?.length || 0})</h3>
 <div className="max-h-40 space-y-1 overflow-y-auto">
 {userDetail.payments?.map((payment) => (
 <div key={payment.id} className="rounded-lg border border-default bg-app bg-surface p-2 text-xs text-primary text-secondary">
 ${payment.amount} {payment.currency} - {payment.subscription_type} - {payment.status} -{" "}
 {payment.created_at ? new Date(payment.created_at).toLocaleString() : "N/A"}
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

function PaymentsManagement() {
 const [payments, setPayments] = useState([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 loadPayments();
 }, []);

 const loadPayments = async () => {
 try {
 const authToken = localStorage.getItem(ADMIN_STORAGE_KEY) === "true" ? ADMIN_PASSWORD : "";
 const response = await fetch("/api/admin/payments", {
 headers: {
 "Authorization": `Bearer ${authToken}`,
 },
 });

 if (response.ok) {
 const data = await response.json();
 setPayments(data.payments || []);
 }
 } catch (error) {
 console.error("Failed to load payments:", error);
 } finally {
 setLoading(false);
 }
 };

 const getStatusBadge = (status) => {
 const colors = {
 completed: "bg-surface text-accent",
 pending: "bg-surface text-accent",
 failed: "badge-danger",
 };
 return (
 <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${colors[status] || "bg-surface-muted text-primary"}`}>
 {status}
 </span>
 );
 };

 if (loading) {
 return (
 <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
 <p className="text-secondary text-secondary">Loading payments...</p>
 </div>
 );
 }

 return (
 <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
 <div className="mb-6 flex items-center justify-between">
 <h2 className="text-2xl font-semibold text-primary text-secondary">Payments ({payments.length})</h2>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-default">
 <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">User</th>
 <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">Amount</th>
 <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">Type</th>
 <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">Status</th>
 <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">Payment ID</th>
 <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">Date</th>
 </tr>
 </thead>
 <tbody>
 {payments.map((payment) => (
 <tr key={payment.id} className="border-b border-default hover:bg-surface hover:bg-surface">
 <td className="px-4 py-3 text-primary text-secondary">{payment.user_email}</td>
 <td className="px-4 py-3 font-semibold text-primary text-secondary">
 ${payment.amount} {payment.currency}
 </td>
 <td className="px-4 py-3 text-secondary text-secondary">{payment.subscription_type}</td>
 <td className="px-4 py-3">{getStatusBadge(payment.status)}</td>
 <td className="px-4 py-3 text-xs text-secondary text-secondary font-mono">{payment.stripe_payment_intent_id}</td>
 <td className="px-4 py-3 text-secondary text-secondary">
 {payment.created_at ? new Date(payment.created_at).toLocaleString() : "N/A"}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
}

function AdminDashboard() {
 const [stats, setStats] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [timeRange, setTimeRange] = useState("all");

 useEffect(() => {
 loadDashboardData();
 }, [timeRange]);

 const loadDashboardData = async () => {
 // Only load if authenticated
 if (localStorage.getItem(ADMIN_STORAGE_KEY) !== "true") {
 setError("Not authenticated");
 setLoading(false);
 return;
 }

 setLoading(true);
 setError(null);
 try {
 const authToken = ADMIN_PASSWORD;
 const response = await fetch(`/api/admin/stats?time_range=${timeRange}`, {
 headers: {
 "Authorization": `Bearer ${authToken}`,
 },
 });

 if (response.ok) {
 const data = await response.json();
 if (data.success && data.stats) {
 setStats(data.stats);
 setError(null);
 } else {
 setError(data.error || "Invalid response format");
 console.error("Invalid response format:", data);
 }
 } else {
 const errorData = await response.json().catch(() => ({}));
 setError(errorData.error || `Failed to load dashboard data (${response.status})`);
 console.error("Failed to load dashboard data:", response.status, errorData);
 }
 } catch (error) {
 setError(`Network error: ${error.message}`);
 console.error("Failed to load dashboard data:", error);
 } finally {
 setLoading(false);
 }
 };

 if (loading) {
 return (
 <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
 <p className="text-secondary text-secondary">Loading dashboard...</p>
 </div>
 );
 }

 if (error) {
 return (
 <div className="ui-card badge-danger rounded-[16px] p-6 shadow-card">
 <p className="font-semibold">Error loading dashboard</p>
 <p className="mt-2 text-sm">{error}</p>
 <button
 onClick={loadDashboardData}
 className="ui-btn ui-btn-primary mt-4 focus-visible:outline-accent"
 >
 Retry
 </button>
 </div>
 );
 }

 if (!stats) {
 return (
 <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
 <p className="text-secondary text-secondary">No dashboard data available</p>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div className="rounded-3xl border border-default bg-surface p-6 shadow-soft">
 <div className="mb-4 flex items-center justify-between">
 <h2 className="text-2xl font-semibold text-primary text-secondary">Dashboard Overview</h2>
 <select
 value={timeRange}
 onChange={(e) => setTimeRange(e.target.value)}
 className="rounded-lg border border-default bg-surface px-4 py-2 text-sm font-semibold text-primary text-secondary"
 >
 <option value="all">All Time</option>
 <option value="7d">Last 7 Days</option>
 <option value="30d">Last 30 Days</option>
 <option value="90d">Last 90 Days</option>
 </select>
 </div>

 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
 <div className="rounded-2xl border border-default p-6">
 <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">Total Users</h3>
 <p className="text-4xl font-bold text-accent">{stats.total_users || 0}</p>
 <p className="mt-2 text-xs text-accent">Registered accounts</p>
 </div>

 <div className="ui-card rounded-[16px] p-6 shadow-card">
 <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-secondary">Total Revenue</h3>
 <p className="text-4xl font-bold text-primary font-mono">${(stats.total_revenue || 0).toFixed(2)}</p>
 <p className="mt-2 text-xs text-secondary">From completed payments</p>
 </div>

 <div className="ui-card rounded-[16px] p-6 shadow-card">
 <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-secondary">Active Subscriptions</h3>
 <p className="text-4xl font-bold text-primary font-mono">{stats.active_subscriptions || 0}</p>
 <p className="mt-2 text-xs text-secondary">Currently active</p>
 </div>

 <div className="rounded-2xl border border-default p-6">
 <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">Total Runs</h3>
 <p className="text-4xl font-bold text-accent">{stats.total_runs || 0}</p>
 <p className="mt-2 text-xs text-accent">Discovery sessions</p>
 </div>
 </div>

 <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
 <div className="rounded-xl border border-default bg-app bg-surface p-4">
 <h3 className="mb-2 text-sm font-semibold text-primary text-secondary">Free Users</h3>
 <p className="text-2xl font-bold text-primary text-secondary">{stats.free_trial_users || 0}</p>
 </div>
 <div className="rounded-xl border border-default bg-app bg-surface p-4">
 <h3 className="mb-2 text-sm font-semibold text-primary text-secondary">Weekly Subscribers</h3>
 <p className="text-2xl font-bold text-primary text-secondary">{stats.weekly_subscribers || 0}</p>
 </div>
 <div className="rounded-xl border border-default bg-app bg-surface p-4">
 <h3 className="mb-2 text-sm font-semibold text-primary text-secondary">Starter Subscribers</h3>
 <p className="text-2xl font-bold text-primary text-secondary">{stats.starter_subscribers || 0}</p>
 </div>
 <div className="rounded-xl border border-default bg-app bg-surface p-4">
 <h3 className="mb-2 text-sm font-semibold text-primary text-secondary">Pro Subscribers</h3>
 <p className="text-2xl font-bold text-primary text-secondary">{stats.pro_subscribers || 0}</p>
 </div>
 </div>

 <div className="mt-6 grid gap-6 md:grid-cols-2">
 <div className="rounded-xl border border-default bg-app bg-surface p-6">
 <h3 className="mb-4 text-lg font-semibold text-primary text-secondary">Activity Summary</h3>
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-sm text-secondary text-secondary">Total Validations</span>
 <span className="text-lg font-bold text-primary text-secondary">{stats.total_validations || 0}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-sm text-secondary text-secondary">Completed Payments</span>
 <span className="text-lg font-bold text-primary text-secondary">{stats.total_payments || 0}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-sm text-secondary text-secondary">Conversion Rate</span>
 <span className="text-lg font-bold text-primary text-secondary">
 {stats.total_users > 0 ? ((stats.active_subscriptions / stats.total_users) * 100).toFixed(1) : 0}%
 </span>
 </div>
 </div>
 </div>

 <div className="rounded-xl border border-default bg-app bg-surface p-6">
 <h3 className="mb-4 text-lg font-semibold text-primary text-secondary">Revenue Metrics</h3>
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-sm text-secondary text-secondary">Average Revenue per User</span>
 <span className="text-lg font-bold text-primary text-secondary">
 ${stats.total_users > 0 ? (stats.total_revenue / stats.total_users).toFixed(2) : 0}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-sm text-secondary text-secondary">Monthly Recurring Revenue</span>
 <span className="text-lg font-bold text-primary text-secondary">
 ${((stats.pro_subscribers || 0) * 15 + (stats.starter_subscribers || 0) * 7).toFixed(2)}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-sm text-secondary text-secondary">Weekly Recurring Revenue</span>
 <span className="text-lg font-bold text-primary text-secondary">
 ${((stats.weekly_subscribers || 0) * 5).toFixed(2)}
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* System Settings */}
 <div className="mt-6 rounded-xl border border-default bg-app bg-surface p-6">
 <SystemSettingsPanel />
 </div>
 </div>
 </div>
 );
}

function SystemSettingsPanel() {
 const [debugMode, setDebugMode] = useState(false);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [message, setMessage] = useState("");

 useEffect(() => {
 loadSettings();
 }, []);

 const loadSettings = async () => {
 try {
 const authToken = localStorage.getItem(ADMIN_STORAGE_KEY) === "true" ? ADMIN_PASSWORD : "";
 const response = await fetch("/api/admin/settings", {
 headers: {
 "Authorization": `Bearer ${authToken}`,
 },
 });

 if (response.ok) {
 const data = await response.json();
 if (data.success && data.settings) {
 setDebugMode(data.settings.debug_mode || false);
 }
 }
 } catch (error) {
 if (process.env.NODE_ENV === 'development') {
 console.error("Failed to load settings:", error);
 }
 } finally {
 setLoading(false);
 }
 };

 const handleToggleDebug = async () => {
 setSaving(true);
 setMessage("");
 try {
 const authToken = localStorage.getItem(ADMIN_STORAGE_KEY) === "true" ? ADMIN_PASSWORD : "";
 const response = await fetch("/api/admin/settings", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 "Authorization": `Bearer ${authToken}`,
 },
 body: JSON.stringify({
 debug_mode: !debugMode,
 }),
 });

 if (response.ok) {
 const data = await response.json();
 if (data.success) {
 setDebugMode(!debugMode);
 setMessage(`Debug mode ${!debugMode ? "enabled" : "disabled"}. Server restart required for changes to take effect.`);
 setTimeout(() => setMessage(""), 5000);
 }
 } else {
 setMessage("Failed to update settings");
 setTimeout(() => setMessage(""), 3000);
 }
 } catch (error) {
 if (process.env.NODE_ENV === 'development') {
 console.error("Failed to update settings:", error);
 }
 setMessage("Failed to update settings");
 setTimeout(() => setMessage(""), 3000);
 } finally {
 setSaving(false);
 }
 };

 if (loading) {
 return (
 <div>
 <h3 className="mb-4 text-lg font-semibold text-primary text-secondary">System Settings</h3>
 <p className="text-sm text-secondary text-secondary">Loading settings...</p>
 </div>
 );
 }

 return (
 <div>
 <h3 className="mb-4 text-lg font-semibold text-primary text-secondary">System Settings</h3>
 <div className="space-y-4">
 <div className="flex items-center justify-between rounded-lg border border-default bg-surface p-4">
 <div>
 <h4 className="font-semibold text-primary text-secondary">Debug Mode</h4>
 <p className="mt-1 text-xs text-secondary text-secondary">
 Enable Flask debug mode. Shows detailed error tracebacks. <strong>Warning:</strong> Disable in production for security.
 </p>
 </div>
 <label className="relative inline-flex cursor-pointer items-center">
 <input
 type="checkbox"
 checked={debugMode}
 onChange={handleToggleDebug}
 disabled={saving}
 className="peer sr-only"
 />
 <div className="peer h-6 w-11 rounded-full bg-surface-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-default after:bg-surface after:transition-all after:content-[''] peer-checked:bg-surface-muted peer-checked:after:translate-x-full peer-checked:after:border-default"></div>
 </label>
 </div>
 {message && (
 <div className={`rounded-lg border p-3 text-sm ${
 message.includes("enabled") || message.includes("disabled")
 ? "border-default bg-surface text-accent border-default bg-surface text-accent"
 : "badge-danger"
 }`}>
 {message}
 </div>
 )}
 </div>
 </div>
 );
}

function AdminReports() {
 const exportReport = async (reportType) => {
 try {
 const authToken = localStorage.getItem(ADMIN_STORAGE_KEY) === "true" ? ADMIN_PASSWORD : "";
 const response = await fetch(`/api/admin/reports/export?type=${reportType}`, {
 headers: {
 "Authorization": `Bearer ${authToken}`,
 },
 });

 if (response.ok) {
 const blob = await response.blob();
 const url = window.URL.createObjectURL(blob);
 const a = document.createElement("a");
 a.href = url;
 a.download = `${reportType}_report_${new Date().toISOString().split("T")[0]}.csv`;
 document.body.appendChild(a);
 a.click();
 window.URL.revokeObjectURL(url);
 document.body.removeChild(a);
 } else {
 alert("Failed to export report");
 }
 } catch (error) {
 console.error("Failed to export report:", error);
 alert("Failed to export report");
 }
 };

 return (
 <div className="space-y-6">
 <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
 <div className="mb-6 flex items-center justify-between">
 <h2 className="text-2xl font-semibold text-primary text-secondary">Reports</h2>
 </div>

 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
 <div className="rounded-xl border border-default border-default bg-surface bg-surface p-6 flex flex-col">
 <h3 className="mb-2 text-lg font-semibold text-accent text-accent">User Report</h3>
 <p className="mb-4 text-sm text-accent text-accent flex-grow">Export all user data with subscription details</p>
 <button
 onClick={() => exportReport("users")}
 className="ui-btn ui-btn-secondary w-full mt-auto focus-visible:outline-accent"
 >
 Export CSV
 </button>
 </div>

 <div className="ui-card rounded-[16px] p-6 shadow-card flex flex-col">
 <h3 className="mb-2 text-lg font-semibold text-primary">Payment Report</h3>
 <p className="mb-4 text-sm text-secondary flex-grow">Export all payment transactions</p>
 <button
 onClick={() => exportReport("payments")}
 className="ui-btn ui-btn-secondary w-full mt-auto focus-visible:outline-accent"
 >
 Export CSV
 </button>
 </div>

 <div className="ui-card rounded-[16px] p-6 shadow-card flex flex-col">
 <h3 className="mb-2 text-lg font-semibold text-primary">Activity Report</h3>
 <p className="mb-4 text-sm text-secondary flex-grow">Export runs and validations</p>
 <button
 onClick={() => exportReport("activity")}
 className="ui-btn ui-btn-secondary w-full mt-auto focus-visible:outline-accent"
 >
 Export CSV
 </button>
 </div>

 <div className="rounded-xl border border-default border-default bg-surface bg-surface p-6 flex flex-col">
 <h3 className="mb-2 text-lg font-semibold text-accent text-accent">Subscription Report</h3>
 <p className="mb-4 text-sm text-accent text-accent flex-grow">Export subscription analytics</p>
 <button
 onClick={() => exportReport("subscriptions")}
 className="ui-btn ui-btn-secondary w-full mt-auto focus-visible:outline-accent"
 >
 Export CSV
 </button>
 </div>

 <div className="rounded-xl border border-default border-default bg-surface bg-surface p-6 flex flex-col">
 <h3 className="mb-2 text-lg font-semibold text-accent text-accent">Revenue Report</h3>
 <p className="mb-4 text-sm text-accent text-accent flex-grow">Export revenue breakdown by period</p>
 <button
 onClick={() => exportReport("revenue")}
 className="ui-btn ui-btn-secondary w-full mt-auto focus-visible:outline-accent"
 >
 Export CSV
 </button>
 </div>

 <div className="rounded-xl border border-default bg-app bg-surface p-6 flex flex-col">
 <h3 className="mb-2 text-lg font-semibold text-primary text-secondary">Full Report</h3>
 <p className="mb-4 text-sm text-primary text-secondary flex-grow">Export comprehensive data dump</p>
 <button
 onClick={() => exportReport("full")}
 className="ui-btn ui-btn-secondary w-full mt-auto focus-visible:outline-accent"
 >
 Export CSV
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}

