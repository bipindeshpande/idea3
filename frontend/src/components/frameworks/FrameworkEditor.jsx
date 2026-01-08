import { useState, useEffect } from "react";
import { useFramework } from "../../context/FrameworkContext.jsx";
import { ApiError } from "../../utils/apiClient.js";
import UIButton from "../ui/ui-button.jsx";
import UIHeading from "../ui/ui-heading.jsx";
import Card from "../ui/Card.jsx";
import LoadingIndicator from "../common/LoadingIndicator.jsx";

export default function FrameworkEditor({ framework, onClose, onSave, allFrameworks = [] }) {
 const { createFramework, updateFramework, exportFramework, loading } = useFramework();
 const [title, setTitle] = useState(framework.title || "");
 const [content, setContent] = useState(framework.customized_content || "");
 const [saving, setSaving] = useState(false);
 const [autoSaving, setAutoSaving] = useState(false);
 const [nameError, setNameError] = useState("");

 // Auto-save on content change (debounced)
 useEffect(() => {
  if (!framework.id) return; // Don't auto-save new frameworks

  const timeoutId = setTimeout(async () => {
   if (title !== framework.title || content !== framework.customized_content) {
    setAutoSaving(true);
    try {
     await updateFramework(framework.id, {
      title,
      customized_content: content
     });
    } catch (error) {
     console.error("Auto-save failed:", error);
    } finally {
     setAutoSaving(false);
    }
   }
  }, 2000); // 2 second debounce

  return () => clearTimeout(timeoutId);
 }, [title, content, framework.id, framework.title, framework.customized_content, updateFramework]);

 // Check for duplicate names
 const checkDuplicateName = (name) => {
  if (!name || !name.trim()) {
   setNameError("");
   return false;
  }
  
  const trimmedName = name.trim().toLowerCase();
  const duplicate = allFrameworks.find(f => 
   f.id !== framework.id && // Exclude current framework when editing
   f.title.trim().toLowerCase() === trimmedName
  );
  
  if (duplicate) {
   setNameError("A framework with this name already exists. Please choose a different name.");
   return true;
  }
  
  setNameError("");
  return false;
 };

 const handleTitleChange = (e) => {
  const newTitle = e.target.value;
  setTitle(newTitle);
  checkDuplicateName(newTitle);
 };

 const handleSave = async () => {
  // Validate title
  if (!title || !title.trim()) {
   setNameError("Framework title is required.");
   return;
  }
  
  if (checkDuplicateName(title)) {
   return; // Don't save if duplicate name
  }
  
  // Validate framework_template_id for new frameworks
  if (!framework.id && !framework.framework_template_id) {
   setNameError("Template ID is required to create a framework.");
   return;
  }
  
  setSaving(true);
  setNameError(""); // Clear any previous errors
  try {
   if (framework.id) {
    // Update existing
    await updateFramework(framework.id, {
     title,
     customized_content: content
    });
   } else {
    // Validate required fields before creating
    if (!framework.framework_template_id || typeof framework.framework_template_id !== "number") {
     throw new Error("Template ID is required to create a framework. Please select a template first.");
    }
    if (!content || !content.trim()) {
     throw new Error("Framework content cannot be empty.");
    }
    
    // Ensure framework_template_id is an integer
    const templateId = parseInt(framework.framework_template_id, 10);
    if (isNaN(templateId)) {
     throw new Error("Invalid template ID. Please try creating from a template again.");
    }
    
    // Create new
    await createFramework({
     framework_template_id: templateId,
     title: title.trim(),
     customized_content: content,
     linked_idea_id: framework.linked_idea_id || null,
     linked_validation_id: framework.linked_validation_id || null,
     metadata: framework.metadata || {}
    });
   }
   onSave();
  } catch (error) {
   console.error("Failed to save framework:", error);
   let errorMessage = "Failed to save framework. Please try again.";
   
   // Handle ApiError instances
   if (error instanceof ApiError) {
    errorMessage = error.message || error.detail || "Failed to save framework. Please try again.";
   } else if (error?.message) {
    errorMessage = error.message;
   } else if (error?.detail) {
    errorMessage = error.detail;
   } else if (error?.response?.data?.detail) {
    errorMessage = error.response.data.detail;
   } else if (typeof error === "string") {
    errorMessage = error;
   }
   
   console.error("Error details:", {
    error,
    message: errorMessage,
    type: error?.constructor?.name,
    isApiError: error instanceof ApiError
   });
   
   setNameError(errorMessage);
   alert(errorMessage);
  } finally {
   setSaving(false);
  }
 };

 const handleDownload = async () => {
  try {
   if (framework.id) {
    const exportData = await exportFramework(framework.id);
    const blob = new Blob([exportData.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportData.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
   } else {
    // Download unsaved framework
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
   }
  } catch (error) {
   console.error("Failed to export framework:", error);
   alert("Failed to export framework. Please try again.");
  }
 };

 return (
  <div className="pb-16">
   {/* Header */}
   <div className="mb-6 flex items-center justify-between">
    <div>
     <UIHeading level="h1" className="text-primary mb-2">
      {framework.id ? "Edit Framework" : "Create Framework"}
     </UIHeading>
     {autoSaving && (
      <p className="text-xs text-secondary">Auto-saving...</p>
     )}
    </div>
    <div className="flex items-center gap-3">
     <UIButton variant="secondary" onClick={handleDownload}>
      Download
     </UIButton>
     <UIButton variant="secondary" onClick={onClose}>
      Cancel
     </UIButton>
     <UIButton variant="primary" onClick={handleSave} disabled={saving || !title.trim() || !!nameError}>
      {saving ? "Saving..." : "Save"}
     </UIButton>
    </div>
   </div>

   {/* Editor */}
   <Card className="mb-6">
    <div className="mb-4">
     <label className="block text-sm font-medium text-primary mb-2">
      Framework Title
     </label>
     <input
      type="text"
      value={title}
      onChange={handleTitleChange}
      className={`w-full px-4 py-2 rounded-lg border bg-surface text-primary ${
       nameError ? "border-red-500" : "border-default"
      }`}
      placeholder="Enter framework title"
     />
     {nameError && (
      <p className="mt-2 text-sm text-red-500">{nameError}</p>
     )}
    </div>
   </Card>

   <Card>
    <div>
     <label className="block text-sm font-medium text-primary mb-2">
      Framework Content (Markdown)
     </label>
     <textarea
      value={content}
      onChange={(e) => setContent(e.target.value)}
      className="w-full h-96 px-4 py-3 rounded-lg border border-default bg-surface text-primary font-mono text-sm"
      placeholder="Enter or edit framework content in Markdown format..."
     />
     <p className="mt-2 text-xs text-secondary">
      You can use Markdown syntax. Checkboxes (- [x] and - [ ]) will be tracked for progress.
     </p>
    </div>
   </Card>

   {loading && <LoadingIndicator simple={true} />}
  </div>
 );
}

