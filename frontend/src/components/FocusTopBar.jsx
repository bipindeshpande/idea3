import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "./common/ThemeToggle.jsx";
import Stepper from "./Stepper.jsx";
import UserMenu from "./common/UserMenu.jsx";

export default function FocusTopBar({ steps, currentStep, title }) {
 const navigate = useNavigate();

 return (
 <div className="w-full h-14 flex items-center justify-between px-6 border-b border-default bg-surface sticky top-0 z-50">
 {/* LEFT - Back button */}
 <button
 onClick={() => navigate("/dashboard")}
 className="text-base text-secondary hover:text-accent-hover transition focus-visible:outline-accent rounded-md px-2 py-1 -ml-2"
 >
 ← Back to Workspace
 </button>

 {/* CENTER - Stepper or Title */}
 <div className="flex-1 flex justify-center">
 {steps?.length ? (
 <div className="w-[360px] max-w-[55vw]">
 <Stepper steps={steps} current={currentStep} />
 </div>
 ) : title ? (
 <span className="text-base font-medium text-primary">{title}</span>
 ) : null}
 </div>

 {/* RIGHT - Theme toggle and User menu */}
 <div className="flex items-center gap-2">
 <ThemeToggle />
 <UserMenu />
 </div>
 </div>
 );
}


