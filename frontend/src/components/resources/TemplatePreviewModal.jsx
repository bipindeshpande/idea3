import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import UIButton from "../ui/ui-button.jsx";
import UIHeading from "../ui/ui-heading.jsx";
import { markdownToDocx } from "../../utils/markdownToDocx.js";

export default function TemplatePreviewModal({ template, content, onClose, onDownload }) {
 const [isLoading, setIsLoading] = useState(false);
 const [templateContent, setTemplateContent] = useState(content || "");

 // If content is a URL, fetch it
 useEffect(() => {
 if (content && content.startsWith("/templates/")) {
 setIsLoading(true);
 fetch(content)
 .then((res) => res.text())
 .then((text) => {
 setTemplateContent(text);
 setIsLoading(false);
 })
 .catch((err) => {
 console.error("Failed to load template:", err);
 setIsLoading(false);
 });
 }
 }, [content]);

 const handleDownload = async () => {
 if (onDownload) {
 // If we have fetched content, pass it to onDownload
 if (templateContent && !content?.startsWith("/templates/")) {
 await onDownload(templateContent);
 } else if (templateContent) {
 await onDownload(templateContent);
 } else {
 await onDownload();
 }
 }
 onClose();
 };

 // Close on Escape key
 useEffect(() => {
 const handleEscape = (e) => {
 if (e.key === "Escape") {
 onClose();
 }
 };
 document.addEventListener("keydown", handleEscape);
 return () => document.removeEventListener("keydown", handleEscape);
 }, [onClose]);

 // Prevent body scroll when modal is open
 useEffect(() => {
 document.body.style.overflow = "hidden";
 return () => {
 document.body.style.overflow = "unset";
 };
 }, []);

 return (
 <div
 className="fixed inset-0 z-50 flex items-center justify-center bg-surface backdrop-blur-sm"
 onClick={onClose}
 >
 <div
 className="mx-4 w-full max-w-4xl max-h-[90vh] rounded-xl border border-default bg-surface shadow-xl flex flex-col"
 onClick={(e) => e.stopPropagation()}
 >
 {/* Sticky Header */}
 <div className="flex items-center justify-between p-6 border-b border-default bg-surface rounded-t-xl">
 <UIHeading level="h2" className="text-primary">{template?.title || "Template Preview"}</UIHeading>
 <div className="flex items-center gap-3">
 <UIButton variant="primary" onClick={handleDownload} className="whitespace-nowrap">
 Download Word doc
 </UIButton>
 <button
 onClick={onClose}
 className="rounded-lg p-1 text-secondary text-secondary transition hover:bg-surface hover:bg-surface hover:text-primary hover:text-primary"
 aria-label="Close"
 >
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>
 </div>

 {/* Scrollable Content */}
 <div className="flex-1 overflow-y-auto p-6">
 {isLoading ? (
 <div className="flex items-center justify-center py-12">
 <div className="text-secondary text-secondary">Loading template...</div>
 </div>
 ) : templateContent ? (
 <div className="prose prose-slate max-w-none">
 <ReactMarkdown>{templateContent}</ReactMarkdown>
 </div>
 ) : (
 <div className="flex items-center justify-center py-12">
 <div className="text-secondary text-secondary">No content available</div>
 </div>
 )}
 </div>

 {/* Bottom Actions */}
 <div className="flex items-center justify-end gap-3 p-6 border-t border-default bg-app bg-surface rounded-b-xl">
 <UIButton variant="secondary" onClick={onClose}>
 Close
 </UIButton>
 <UIButton variant="primary" onClick={handleDownload}>
 Download Word doc
 </UIButton>
 </div>
 </div>
 </div>
 );
}

