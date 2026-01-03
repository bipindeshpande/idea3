import { useState } from "react";
import { formFieldsConfig } from "../../config/formFieldsConfig.js";
import { getAdminAuthToken } from "../../utils/admin.js";

export default function IntakeFieldsEditor() {
  const [screenTitle, setScreenTitle] = useState(formFieldsConfig?.screen_title || "");
  const [screenDescription, setScreenDescription] = useState(formFieldsConfig?.description || "");
  const [fields, setFields] = useState(formFieldsConfig?.fields || []);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      const authToken = getAdminAuthToken();
      const response = await fetch("/api/admin/save-intake-fields", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          screen_id: formFieldsConfig?.screen_id || "",
          screen_title: screenTitle,
          description: screenDescription,
          fields: fields,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to save (${response.status})`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText.includes("<!doctype") 
            ? "Backend route not found. Please check server configuration."
            : errorText || errorMessage;
        }
        alert(errorMessage);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        // Also save to localStorage as backup
        localStorage.setItem("sia_intake_fields", JSON.stringify(fields));
      } else {
        alert(`Failed to save: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      const errorMessage = error.message || "Network error";
      alert(`Backend save failed: ${errorMessage}. Data saved to localStorage as backup.`);
      // Fallback to localStorage
      localStorage.setItem("sia_intake_fields", JSON.stringify(fields));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const addField = () => {
    setFields([
      ...fields,
      {
        id: `field_${Date.now()}`,
        label: "New Field",
        type: "picklist",
        options: ["Option 1"],
        required: false,
      },
    ]);
  };

  const updateField = (index, field, value) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [field]: value };
    setFields(updated);
  };

  const deleteField = (index) => {
    if (confirm("Are you sure you want to delete this field?")) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-primary text-secondary">Intake Form Fields</h2>
        <button
          onClick={handleSave}
          className="ui-btn ui-btn-primary focus-visible:outline-accent"
        >
          {saved ? "✓ Saved" : "Save Changes"}
        </button>
      </div>

      <div className="mb-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-primary">Screen Title</label>
          <input
            type="text"
            value={screenTitle}
            onChange={(e) => setScreenTitle(e.target.value)}
            className="w-full rounded-lg border border-default bg-surface p-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-primary">Screen Description</label>
          <textarea
            value={screenDescription}
            onChange={(e) => setScreenDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-default bg-surface p-2 text-sm"
          />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-primary">Form Fields</h3>
        <button
          onClick={addField}
          className="rounded-xl border border-default bg-surface px-4 py-2 text-sm font-semibold text-accent transition hover:bg-surface"
        >
          + Add Field
        </button>
      </div>

      <div className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="rounded-2xl border border-default bg-app p-6">
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-primary">Field ID</label>
                <input
                  type="text"
                  value={field.id}
                  onChange={(e) => updateField(index, "id", e.target.value)}
                  className="w-full rounded-lg border border-default bg-surface p-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-primary">Label</label>
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateField(index, "label", e.target.value)}
                  className="w-full rounded-lg border border-default bg-surface p-2 text-sm"
                />
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-primary">Type</label>
                <select
                  value={field.type}
                  onChange={(e) => updateField(index, "type", e.target.value)}
                  className="w-full rounded-lg border border-default bg-surface p-2 text-sm"
                >
                  <option value="picklist">Picklist</option>
                  <option value="short_text">Short Text</option>
                  <option value="long_text">Long Text</option>
                </select>
              </div>
              <div className="flex items-center pt-8">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.required || false}
                    onChange={(e) => updateField(index, "required", e.target.checked)}
                    className="rounded border-default"
                  />
                  <span className="text-sm font-semibold text-primary">Required</span>
                </label>
              </div>
            </div>

            {field.type === "picklist" && (
              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-primary">Options</label>
                <div className="space-y-2">
                  {(field.options || []).map((option, oIndex) => (
                    <div key={oIndex} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const updated = [...fields];
                          updated[index].options[oIndex] = e.target.value;
                          setFields(updated);
                        }}
                        className="flex-1 rounded-lg border border-default bg-surface p-2 text-sm"
                      />
                      <button
                        onClick={() => {
                          const updated = [...fields];
                          updated[index].options = updated[index].options.filter((_, i) => i !== oIndex);
                          setFields(updated);
                        }}
                        className="rounded-lg border border-default bg-surface px-3 py-2 text-sm text-secondary transition hover:bg-surface"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const updated = [...fields];
                      if (!updated[index].options) updated[index].options = [];
                      updated[index].options.push("New Option");
                      setFields(updated);
                    }}
                    className="rounded-lg border border-default bg-surface px-4 py-2 text-sm font-semibold text-accent transition hover:bg-surface"
                  >
                    + Add Option
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => deleteField(index)}
                className="ui-btn badge-danger focus-visible:outline-accent"
              >
                Delete Field
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

