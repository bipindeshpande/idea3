import { useEffect, memo } from "react";

function Toast({ message, type = "success", onClose, duration = 3000 }) {
 useEffect(() => {
 if (duration > 0) {
 const timer = setTimeout(() => {
 onClose();
 }, duration);
 return () => clearTimeout(timer);
 }
 }, [duration, onClose]);

 const bgColor =
 type === "success"
 ? "badge-success"
 : type === "error"
 ? "badge-danger"
 : "ui-card";

 return (
 <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-[10px] border shadow-card-lg ${bgColor} flex items-center gap-3 min-w-[300px] max-w-md`}>
 <span className="flex-1">{message}</span>
 <button
 onClick={onClose}
 className="text-current opacity-70 hover:opacity-100 focus-visible:outline-accent rounded-md"
 aria-label="Close"
 >
 ×
 </button>
 </div>
 );
}

export default memo(Toast);

export function ToastContainer({ toasts, onRemove }) {
 return (
 <div className="fixed top-4 right-4 z-50 space-y-2">
 {toasts.map((toast) => (
 <Toast
 key={toast.id}
 message={toast.message}
 type={toast.type}
 onClose={() => onRemove(toast.id)}
 duration={toast.duration}
 />
 ))}
 </div>
 );
}

