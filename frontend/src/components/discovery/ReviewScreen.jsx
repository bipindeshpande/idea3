import Card from "../ui/Card.jsx";
import SectionHeader from "../layout/SectionHeader.jsx";

/**
 * ReviewScreen - Component for reviewing form inputs before submission
 * 
 * @param {object} inputs - Form input values to display
 */
export default function ReviewScreen({ inputs }) {
  return (
    <div className="grid gap-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">Review what you've shared</h3>
      <Card>
        <div className="grid gap-2">
          <SectionHeader title="About You" />
          <div className="grid gap-1 text-[15px] text-gray-700 leading-relaxed">
            <p><strong>Time Commitment:</strong> {inputs.time_commitment || "Not set"}</p>
            <p><strong>Budget Range:</strong> {inputs.budget_range || "Not set"}</p>
            <p><strong>Risk Tolerance:</strong> {inputs.risk_tolerance || "Not set"}</p>
            <p><strong>Work Style:</strong> {inputs.preferred_work_style || "Not set"}</p>
            <p><strong>Startup Style:</strong> {inputs.startup_style || "Not set"}</p>
            <p><strong>Customer Interaction:</strong> {inputs.customer_interaction || "Not set"}</p>
            <p><strong>Location:</strong> {inputs.location_context || "Not set"}</p>
            <p><strong>Business Region:</strong> {inputs.business_region || "Not set"}</p>
            <p><strong>Skills:</strong> {
              inputs.skills ? Object.entries(inputs.skills)
                .filter(([cat, val]) => cat !== "other" && Array.isArray(val) && val.length > 0)
                .map(([cat, val]) => `${cat}: ${val.join(", ")}`)
                .join("; ") || "None selected"
                : "Not set"
            }</p>
            {inputs.skills?.other && (
              <p><strong>Other Skills:</strong> {inputs.skills.other}</p>
            )}
          </div>
        </div>
        <div className="grid gap-2 mt-6">
          <SectionHeader title="Interests & Goals" />
          <div className="grid gap-1 text-[15px] text-gray-700 leading-relaxed">
            <p><strong>Industry Interest:</strong> {inputs.industry_interest || "Not set"}</p>
            <p><strong>Sub-Interest:</strong> {inputs.sub_interest_area || "Not set"}</p>
            <p><strong>Business Type:</strong> {inputs.business_type || "Not set"}</p>
            <p><strong>Earnings Timeline:</strong> {inputs.earnings_timeline || "Not set"}</p>
            <p><strong>Founder Ambition:</strong> {inputs.founder_ambition || "Not set"}</p>
            {inputs.experience_summary && (
              <p><strong>Experience:</strong> {inputs.experience_summary}</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

