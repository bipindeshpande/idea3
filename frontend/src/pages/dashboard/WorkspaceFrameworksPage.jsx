import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useFramework } from "../../context/FrameworkContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { frameworks } from "../../templates/frameworksConfig.js";
import UIButton from "../../components/ui/ui-button.jsx";
import UIHeading from "../../components/ui/ui-heading.jsx";
import Card from "../../components/ui/Card.jsx";
import LoadingIndicator from "../../components/common/LoadingIndicator.jsx";
import FrameworkEditor from "../../components/frameworks/FrameworkEditor.jsx";
import TabButton from "../../components/ui/ui-tab-button.jsx";
import { WORKSPACE_TYPOGRAPHY } from "../../components/workspace/WorkspaceTheme.js";

export default function WorkspaceFrameworksPage() {
 const { frameworks: userFrameworks, loadFrameworks, loading, deleteFramework } = useFramework();
 const { isAuthenticated } = useAuth();
 const [activeTab, setActiveTab] = useState("templates");
 const [statusFilter, setStatusFilter] = useState("all");
 const [viewMode, setViewMode] = useState("table"); // "table" or "list"
 const [searchQuery, setSearchQuery] = useState("");
 const [editingFramework, setEditingFramework] = useState(null);
 const [searchParams, setSearchParams] = useSearchParams();

 useEffect(() => {
  if (isAuthenticated) {
   loadFrameworks({ status: statusFilter !== "all" ? statusFilter : undefined });
  }
 }, [isAuthenticated, statusFilter, loadFrameworks]);

 // Handle creating framework from template via URL query parameter
 useEffect(() => {
  const createTemplateId = searchParams.get("create");
  if (createTemplateId && isAuthenticated && !editingFramework) {
   const template = frameworks.find(f => f.id === parseInt(createTemplateId));
   if (template) {
    setActiveTab("frameworks");
    setEditingFramework({
     framework_template_id: template.id,
     title: template.title,
     customized_content: template.content,
     linked_idea_id: null,
     linked_validation_id: null,
     metadata: {}
    });
    // Set mode to create instead of clearing
    setSearchParams({ mode: "create" });
   }
  }
 }, [searchParams, isAuthenticated, editingFramework, setSearchParams]);

 const handleEdit = (framework) => {
  setEditingFramework({
   ...framework,
   customized_content: framework.customized_content || ""
  });
  // Clear mode parameter when editing (editing has an id, so it's not create mode)
  setSearchParams({});
 };

 const handleDelete = async (frameworkId) => {
  if (window.confirm("Are you sure you want to delete this framework?")) {
   try {
    await deleteFramework(frameworkId);
   } catch (error) {
    console.error("Failed to delete framework:", error);
   }
  }
 };

 const getStatusBadge = (status) => {
  const badges = {
   draft: "bg-gray-100 text-gray-800",
   in_progress: "bg-blue-100 text-blue-800",
   completed: "bg-green-100 text-green-800"
  };
  return badges[status] || badges.draft;
 };

 const getTemplateInfo = (templateId) => {
  return frameworks.find(f => f.id === templateId);
 };

 // Filter frameworks based on search and status
 const filteredFrameworks = userFrameworks.filter((framework) => {
  const matchesStatus = statusFilter === "all" || framework.status === statusFilter;
  const matchesSearch = searchQuery === "" || 
   framework.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
   (getTemplateInfo(framework.framework_template_id)?.title.toLowerCase().includes(searchQuery.toLowerCase()));
  return matchesStatus && matchesSearch;
 });

 const handleCreateFromTemplate = (template) => {
  setEditingFramework({
   framework_template_id: template.id,
   title: template.title,
   customized_content: template.content,
   linked_idea_id: null,
   linked_validation_id: null,
   metadata: {}
  });
  setActiveTab("frameworks");
  // Set URL parameter to indicate create mode
  setSearchParams({ mode: "create" });
 };

 if (editingFramework) {
  const isCreating = !editingFramework.id;
  // Ensure URL parameter is set when creating
  if (isCreating && !searchParams.get("mode")) {
   setSearchParams({ mode: "create" });
  }
  
  return (
   <FrameworkEditor
    framework={editingFramework}
    allFrameworks={userFrameworks}
    onClose={() => {
     setEditingFramework(null);
     setSearchParams({}); // Clear search params when closing
    }}
    onSave={async () => {
     setEditingFramework(null);
     setSearchParams({}); // Clear search params when saving
     setActiveTab("frameworks");
     await loadFrameworks({ status: statusFilter !== "all" ? statusFilter : undefined });
    }}
   />
  );
 }

 return (
  <>
   <Seo
    title="Templates & Frameworks | Workspace"
    description="Browse templates and manage your validation frameworks"
    path="/dashboard/frameworks"
   />

   <div className="pb-16">
    {/* Tabs */}
    <div className="mb-6 border-b border-default">
     <nav className="flex gap-8">
      <TabButton
       active={activeTab === "templates"}
       onClick={() => setActiveTab("templates")}
      >
       Templates
      </TabButton>
      <TabButton
       active={activeTab === "frameworks"}
       onClick={() => setActiveTab("frameworks")}
      >
       My Frameworks
      </TabButton>
     </nav>
    </div>

    {/* Tab Content */}
    <div>
     {/* Templates Tab */}
     {activeTab === "templates" && (
      <div>
       <div className="mb-4">
        <p className={WORKSPACE_TYPOGRAPHY.subtitle}>
         Select a template to create your own customized framework.
        </p>
       </div>
       <div className="space-y-1.5">
        {frameworks.map((template) => (
         <Card key={template.id} className="p-2.5">
          <div className="flex items-center justify-between gap-3">
           <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <span className="text-lg flex-shrink-0">{template.icon}</span>
            <div className="flex items-center gap-2 flex-1 min-w-0">
             <UIHeading level="h4" className={`${WORKSPACE_TYPOGRAPHY.h4} truncate`}>
              {template.title}
             </UIHeading>
             <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-secondary flex-shrink-0">
              {template.category}
             </span>
            </div>
           </div>
           <UIButton
            variant="secondary"
            onClick={() => handleCreateFromTemplate(template)}
            className="flex-shrink-0 text-sm px-3 py-1.5"
           >
            Create
           </UIButton>
          </div>
         </Card>
        ))}
       </div>
      </div>
     )}

     {/* My Frameworks Tab */}
     {activeTab === "frameworks" && (
      <div>
       {/* Filters and View Toggle */}
       <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
         <div className="flex items-center gap-2">
          <label className={`${WORKSPACE_TYPOGRAPHY.subtitle} text-xs`}>Search:</label>
          <div className="flex items-center gap-1">
           <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
             if (e.key === "Enter") {
              e.target.blur();
             }
            }}
            placeholder="Search frameworks..."
            className="px-3 py-1.5 text-sm rounded-l-lg border border-default border-r-0 bg-surface text-primary w-48"
           />
           <button
            type="button"
            className="px-3 py-1.5 text-sm rounded-r-lg border border-default border-l-0 bg-surface hover:bg-surface-hover text-secondary hover:text-primary transition flex items-center justify-center"
            title="Search"
           >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
           </button>
           {searchQuery && (
            <button
             type="button"
             onClick={() => setSearchQuery("")}
             className="px-2 py-1.5 text-sm rounded-lg border border-default bg-surface hover:bg-surface-hover text-secondary hover:text-primary transition"
             title="Clear search"
            >
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
            </button>
           )}
          </div>
         </div>
         <div className="flex items-center gap-2">
          <label className={`${WORKSPACE_TYPOGRAPHY.subtitle} text-xs`}>Status:</label>
          <select
           value={statusFilter}
           onChange={(e) => setStatusFilter(e.target.value)}
           className="px-3 py-1.5 text-sm rounded-lg border border-default bg-surface text-primary"
          >
           <option value="all">All</option>
           <option value="draft">Draft</option>
           <option value="in_progress">In Progress</option>
           <option value="completed">Completed</option>
          </select>
         </div>
        </div>
        <div className="flex items-center gap-2">
         <button
          onClick={() => setViewMode("table")}
          className={`px-3 py-1.5 text-sm rounded-lg border transition ${
           viewMode === "table"
            ? "border-accent bg-surface-hover text-primary"
            : "border-default bg-surface text-secondary hover:text-primary"
          }`}
         >
          Table
         </button>
         <button
          onClick={() => setViewMode("list")}
          className={`px-3 py-1.5 text-sm rounded-lg border transition ${
           viewMode === "list"
            ? "border-accent bg-surface-hover text-primary"
            : "border-default bg-surface text-secondary hover:text-primary"
          }`}
         >
          List
         </button>
        </div>
       </div>

       {/* Results count */}
       {!loading && filteredFrameworks.length > 0 && (
        <div className="mb-3 text-xs text-secondary">
         Showing {filteredFrameworks.length} of {userFrameworks.length} framework{userFrameworks.length !== 1 ? "s" : ""}
        </div>
       )}

       {/* User Frameworks */}
       {loading ? (
        <LoadingIndicator simple={true} message="Loading frameworks..." />
       ) : filteredFrameworks.length > 0 ? (
        viewMode === "table" ? (
         /* Table View */
         <div className="overflow-x-auto">
          <table className="w-full border-collapse">
           <thead>
            <tr className="border-b border-default">
             <th className="text-left py-2 px-3 text-xs font-semibold text-secondary">Title</th>
             <th className="text-left py-2 px-3 text-xs font-semibold text-secondary">Template</th>
             <th className="text-center py-2 px-3 text-xs font-semibold text-secondary">Status</th>
             <th className="text-center py-2 px-3 text-xs font-semibold text-secondary">Progress</th>
             <th className="text-right py-2 px-3 text-xs font-semibold text-secondary">Actions</th>
            </tr>
           </thead>
           <tbody>
            {filteredFrameworks.map((framework) => {
             const templateInfo = getTemplateInfo(framework.framework_template_id);
             return (
              <tr key={framework.id} className="border-b border-default hover:bg-surface-muted transition">
               <td className="py-2.5 px-3">
                <div className="font-medium text-primary">{framework.title}</div>
               </td>
               <td className="py-2.5 px-3">
                <div className={WORKSPACE_TYPOGRAPHY.bodySmall.replace("text-primary", "text-secondary") + " truncate max-w-xs"}>
                 {templateInfo ? templateInfo.title : "—"}
                </div>
               </td>
               <td className="py-2.5 px-3 text-center">
                <span className={`px-2 py-0.5 rounded ${WORKSPACE_TYPOGRAPHY.caption} font-medium ${getStatusBadge(framework.status)}`}>
                 {framework.status.replace("_", " ")}
                </span>
               </td>
               <td className="py-2.5 px-3 text-center">
                {framework.progress_percentage > 0 ? (
                 <span className={WORKSPACE_TYPOGRAPHY.caption}>{framework.progress_percentage}%</span>
                ) : (
                 <span className={WORKSPACE_TYPOGRAPHY.caption}>—</span>
                )}
               </td>
               <td className="py-2.5 px-3">
                <div className="flex items-center justify-end gap-1.5">
                 <UIButton variant="secondary" onClick={() => handleEdit(framework)} className={WORKSPACE_TYPOGRAPHY.caption + " px-2 py-1"}>
                  Edit
                 </UIButton>
                 <UIButton variant="danger" onClick={() => handleDelete(framework.id)} className={WORKSPACE_TYPOGRAPHY.caption + " px-2 py-1"}>
                  Delete
                 </UIButton>
                </div>
               </td>
              </tr>
             );
            })}
           </tbody>
          </table>
         </div>
        ) : (
         /* List View */
         <div className="space-y-2">
          {filteredFrameworks.map((framework) => {
           const templateInfo = getTemplateInfo(framework.framework_template_id);
           return (
            <Card key={framework.id} className="p-3">
             <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2 mb-1">
                <h4 className={`${WORKSPACE_TYPOGRAPHY.h4} truncate`}>
                 {framework.title}
                </h4>
                <span className={`px-2 py-0.5 rounded ${WORKSPACE_TYPOGRAPHY.caption} font-medium ${getStatusBadge(framework.status)} flex-shrink-0`}>
                 {framework.status.replace("_", " ")}
                </span>
                {framework.progress_percentage > 0 && (
                 <span className={`${WORKSPACE_TYPOGRAPHY.caption} flex-shrink-0`}>
                  {framework.progress_percentage}%
                 </span>
                )}
               </div>
               <div className={"flex items-center gap-2 " + WORKSPACE_TYPOGRAPHY.caption}>
                {templateInfo && (
                 <span className="truncate">Based on: {templateInfo.title}</span>
                )}
                {framework.linked_validation_id && (
                 <span className="flex-shrink-0">• Validation: {framework.linked_validation_id.substring(0, 8)}</span>
                )}
               </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
               <UIButton variant="secondary" onClick={() => handleEdit(framework)} className="text-sm px-3 py-1.5">
                Edit
               </UIButton>
               <UIButton variant="danger" onClick={() => handleDelete(framework.id)} className="text-sm px-3 py-1.5">
                Delete
               </UIButton>
              </div>
             </div>
            </Card>
           );
          })}
         </div>
        )
       ) : userFrameworks.length === 0 ? (
        <Card className="p-8 text-center">
         <p className="text-sm text-secondary mb-4">
          You don't have any custom frameworks yet. Switch to the Templates tab to create your first framework.
         </p>
         <UIButton variant="primary" onClick={() => setActiveTab("templates")}>
          Browse Templates
         </UIButton>
        </Card>
       ) : (
        <Card className="p-8 text-center">
         <p className="text-sm text-secondary mb-4">
          No frameworks match your search. Try adjusting your filters.
         </p>
         <UIButton variant="secondary" onClick={() => {
          setSearchQuery("");
          setStatusFilter("all");
         }}>
          Clear Filters
         </UIButton>
        </Card>
       )}
      </div>
     )}
    </div>
   </div>
  </>
 );
}

