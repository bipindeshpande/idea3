import React from "react";

export default function GuaranteeBlock() {
  return (
    <div 
      className="p-6 rounded-xl shadow-sm"
      style={{
        border: "1px solid var(--mkt-outline)",
        background: "var(--mkt-surface)"
      }}
    >
      <h3 className="mkt-h3 font-semibold mb-2">
        Your decision is safe.
      </h3>
      <ul className="space-y-1 mkt-body opacity-80 leading-relaxed">
        <li>• 14-day no-questions refund guarantee</li>
        <li>• Cancel anytime</li>
        <li>• Keep generated ideas even if you cancel</li>
      </ul>
    </div>
  );
}

