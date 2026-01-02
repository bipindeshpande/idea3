import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useFramework } from "../../context/FrameworkContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { frameworks } from "../../templates/frameworksConfig.js";
import UIButton from "../../components/ui/ui-button.jsx";
import UIHeading from "../../components/ui/ui-heading.jsx";
import Card from "../../components/ui/Card.jsx";
import LoadingIndicator from "../../components/common/LoadingIndicator.jsx";
import FrameworkEditor from "../../components/frameworks/FrameworkEditor.jsx";

export default function WorkspaceFrameworksPage() {
 const { frameworks: userFrameworks, loadFrameworks, loading, deleteFramework } = useFramework();
 const { isAuthenticated } = useAuth();
 const [statusFilter, setStatusFilter] = useState("all");
 const [editingFramework, setEditingFramework] = useState(null);

 useEffect(() => {
  if (isAuthenticated) {
   loadFrameworks({ status: statusFilter !== "all" ? statusFilter : undefined });
  }
 }, [isAuthenticated, statusFilter, loadFrameworks]);

 const handleEdit = (framework) => {
  setEditingFramework({
   ...framework,
   customized_content: framework.customized_content || ""
  });
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

 if (editingFramework) {
  return (
   <FrameworkEditor
    framework={editingFramework}
    allFrameworks={userFrameworks}
    onClose={() => setEditingFramework(null)}
    onSave={() => {
     setEditingFramework(null);
     loadFrameworks({ status: statusFilter !== "all" ? statusFilter : undefined });
    }}
   />
  );
 }

 return (
  <>
   <Seo
    title="Frameworks | Workspace"
    description="Manage your validation frameworks"
    path="/dashboard/frameworks"
   />

   <div className="pb-16">
    {/* Header */}
    <div className="mb-8">
     <div className="flex items-start justify-between mb-4">
      <div>
       <UIHeading level="h1" className="text-primary mb-2">
        My Validation Frameworks
       </UIHeading>
       <p className="text-secondary">
        Manage your customized validation frameworks. Browse templates in <Link to="/resources/templates" className="text-accent hover:text-accent-hover underline">Resources</Link>.
       </p>
      </div>
      <Link to="/resources/templates">
       <UIButton variant="primary">
        Browse Templates
       </UIButton>
      </Link>
     </div>
    </div>

    {/* Frameworks Content */}
    <div>
     {/* Filters */}
     <div className="mb-6 flex items-center gap-4">
      <label className="text-sm text-secondary">Filter by status:</label>
      <select
       value={statusFilter}
       onChange={(e) => setStatusFilter(e.target.value)}
       className="px-3 py-2 rounded-lg border border-default bg-surface text-primary"
      >
       <option value="all">All</option>
       <option value="draft">Draft</option>
       <option value="in_progress">In Progress</option>
       <option value="completed">Completed</option>
      </select>
     </div>

     {/* User Frameworks List */}
     {loading ? (
      <LoadingIndicator simple={true} message="Loading frameworks..." />
     ) : userFrameworks.length > 0 ? (
      <div className="grid gap-4">
       {userFrameworks.map((framework) => {
        const templateInfo = getTemplateInfo(framework.framework_template_id);
        return (
         <Card key={framework.id} className="p-4">
          <div className="flex items-start justify-between">
           <div className="flex-1">
            <div className="flex items-center gap-3 mb-1.5">
             <UIHeading level="h3" className="text-primary text-base">
              {framework.title}
             </UIHeading>
             <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(framework.status)}`}>
              {framework.status.replace("_", " ")}
             </span>
             {framework.progress_percentage > 0 && (
              <span className="text-xs text-secondary">
               {framework.progress_percentage}% complete
              </span>
             )}
            </div>
            {templateInfo && (
             <p className="text-xs text-secondary mb-1">
              Based on: {templateInfo.title}
             </p>
            )}
            {framework.linked_validation_id && (
             <p className="text-xs text-secondary">
              Linked to validation: {framework.linked_validation_id.substring(0, 8)}...
             </p>
            )}
           </div>
           <div className="flex items-center gap-2">
            <UIButton variant="secondary" onClick={() => handleEdit(framework)}>
             Edit
            </UIButton>
            <UIButton variant="danger" onClick={() => handleDelete(framework.id)}>
             Delete
            </UIButton>
           </div>
          </div>
         </Card>
        );
       })}
      </div>
     ) : (
      <Card className="p-8 text-center">
       <p className="text-secondary mb-4">
        You don't have any frameworks yet. Browse templates in Resources to create your first framework.
       </p>
       <Link to="/resources/templates">
        <UIButton variant="primary">
         Browse Templates
        </UIButton>
       </Link>
      </Card>
     )}
    </div>
   </div>
  </>
 );
}

