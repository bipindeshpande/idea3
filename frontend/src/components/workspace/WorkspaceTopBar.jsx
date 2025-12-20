import { Link } from "react-router-dom";
import ThemeToggle from "../common/ThemeToggle.jsx";
import UserMenu from "../common/UserMenu.jsx";
import UIHeading from "../ui/ui-heading.jsx";
import UIButton from "../ui/ui-button.jsx";

export default function WorkspaceTopBar({ title, subtitle }) {
 return (
 <div className="mb-4 flex items-center justify-between border-b border-default pb-3">
 <div className="flex-1">
 {title && <UIHeading level="h1" className="font-semibold">{title}</UIHeading>}
 {subtitle && <p className="mt-1.5 text-base text-secondary">{subtitle}</p>}
 </div>
 <div className="flex items-center gap-4 ml-8">
 <Link to="/resources/templates">
 <UIButton variant="ghost">
 Resources
 </UIButton>
 </Link>
 <ThemeToggle />
 <UserMenu />
 </div>
 </div>
 );
}


