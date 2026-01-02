import ThemeToggle from "../common/ThemeToggle.jsx";
import UserMenu from "../common/UserMenu.jsx";
import UIHeading from "../ui/ui-heading.jsx";

export default function WorkspaceTopBar({ title, subtitle }) {
 return (
 <div className="mb-3 flex items-center justify-between border-b border-default pb-2">
 <div className="flex-1 flex items-center gap-2">
 {title && <UIHeading level="h2" className="font-semibold text-lg">{title}</UIHeading>}
 {subtitle && (
  <>
   <span className="text-secondary">·</span>
   <p className="text-sm text-secondary">{subtitle}</p>
  </>
 )}
 </div>
 <div className="flex items-center gap-3 ml-6">
 <ThemeToggle />
 <UserMenu />
 </div>
 </div>
 );
}


