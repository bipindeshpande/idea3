import React from "react";
import { Link } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import ValidationReportPDF from "../../../components/pdf/ValidationReportPDF.jsx";
import OpenForCollaboratorsButton from "../../../components/founder/OpenForCollaboratorsButton.jsx";

export default function ValidationHeader({
  isAuthenticated,
  currentValidation,
  ideaExplanation,
  categoryAnswers,
  downloadButtonRef,
  downloadingPDF,
  onDownloadPDF,
  parameterGroups,
  validation,
  overallScore,
  scores,
  recommendations,
  nextSteps,
  user,
  finalConclusion,
}) {
  return (
    <>
      {/* Action Bar */}
      <div className="mb-6 no-print">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            ref={downloadButtonRef}
            onClick={onDownloadPDF}
            disabled={downloadingPDF}
            className="px-4 py-2 rounded-lg text-sm font-medium text-primary bg-surface hover:bg-surface-hover border border-default transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloadingPDF ? "Generating PDF..." : "Download PDF"}
          </button>
          <Link
            to="/validate-idea"
            className="px-4 py-2 rounded-lg text-sm font-medium text-primary bg-surface hover:bg-surface-hover border border-default transition-colors whitespace-nowrap"
          >
            Validate Another Idea
          </Link>
          {currentValidation && (
            <OpenForCollaboratorsButton 
              validationId={currentValidation?.id || currentValidation?.validation_id}
              sourceType="validation"
              sourceId={currentValidation?.id || currentValidation?.validation_id}
              ideaTitle={ideaExplanation?.substring(0, 100) || "My validated idea"}
              categoryAnswers={categoryAnswers}
            />
          )}
        </div>
      </div>
    </>
  );
}

