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
      {/* Header */}
      <div className="mb-8 relative no-print">
        <div className="absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-surface opacity-[0.09] blur-2xl pointer-events-none"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-primary mb-2">Idea Validation Results</h1>
            <p className="text-primary text-primary text-secondary leading-relaxed">Your idea has been evaluated across 10 key parameters</p>
          </div>
          <div className="flex gap-3">
            <button
              ref={downloadButtonRef}
              onClick={onDownloadPDF}
              disabled={downloadingPDF}
              className="px-5 py-2.5 rounded-lg font-medium text-accent bg-surface hover:bg-surface transition-all shadow-sm hover:shadow-md whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloadingPDF ? "Generating PDF..." : "Download PDF"}
            </button>
            <Link
              to="/validate-idea"
              className="px-5 py-2.5 rounded-lg font-medium text-accent bg-surface hover:bg-surface transition-all shadow-sm hover:shadow-md whitespace-nowrap"
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
      </div>
    </>
  );
}

