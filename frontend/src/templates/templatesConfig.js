// Templates configuration
// This file defines metadata for traditional startup templates (business plan, pitch deck, email templates)

import businessPlanTemplate from "./business-plan-template.md?raw";
import pitchDeckTemplate from "./pitch-deck-template.md?raw";
import customerOutreachEmailTemplate from "./customer-outreach-email-template.md?raw";

export const templates = [
  {
    id: "business-plan",
    title: "Business Plan Template",
    description: "Complete business plan template with all sections you need.",
    icon: "📄",
    category: "Planning",
    download: true,
    content: businessPlanTemplate,
    downloadName: "business-plan-template.docx",
  },
  {
    id: "pitch-deck",
    title: "Pitch Deck Template",
    description: "12-slide investor pitch deck template with design tips.",
    icon: "🎯",
    category: "Planning",
    download: true,
    content: pitchDeckTemplate,
    downloadName: "pitch-deck-template.docx",
  },
  {
    id: "customer-outreach-email",
    title: "Customer Outreach Email Templates",
    description: "Customer outreach email templates for validation.",
    icon: "✉️",
    category: "Discovery",
    download: true,
    content: customerOutreachEmailTemplate,
    downloadName: "customer-outreach-email-template.docx",
  },
];

