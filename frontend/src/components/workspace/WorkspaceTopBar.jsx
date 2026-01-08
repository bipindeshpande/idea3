import ThemeToggle from "../common/ThemeToggle.jsx";
import UserMenu from "../common/UserMenu.jsx";
import UIHeading from "../ui/ui-heading.jsx";
import { WORKSPACE_TYPOGRAPHY } from "./WorkspaceTheme.js";

export default function WorkspaceTopBar({ title, subtitle }) {
 return (
 <div className="mb-3 flex items-center justify-between border-b border-default pb-2">
 <div className="flex-1 flex items-center gap-2">
 {title && <UIHeading level="h2" className={WORKSPACE_TYPOGRAPHY.h2}>{title}</UIHeading>}
 {subtitle && (
  <>
   <span className="text-secondary">·</span>
   <p className={WORKSPACE_TYPOGRAPHY.subtitle}>{subtitle}</p>
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


