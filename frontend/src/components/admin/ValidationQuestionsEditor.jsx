import { useState } from "react";
import { validationQuestions } from "../../config/validationQuestions.js";
import { getAdminAuthToken } from "../../utils/admin.js";

export default function ValidationQuestionsEditor() {
  const [questions, setQuestions] = useState(validationQuestions?.category_questions || []);
  const [ideaQuestions, setIdeaQuestions] = useState(validationQuestions?.idea_explanation_questions || []);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      const authToken = getAdminAuthToken();
      const response = await fetch("/api/admin/save-validation-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          questions: {
            category_questions: questions,
            idea_explanation_questions: ideaQuestions,
          },
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
        localStorage.setItem("sia_validation_questions", JSON.stringify({ category_questions: questions, idea_explanation_questions: ideaQuestions }));
      } else {
        alert(`Failed to save: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      const errorMessage = error.message || "Network error";
      alert(`Backend save failed: ${errorMessage}. Data saved to localStorage as backup.`);
      // Fallback to localStorage
      localStorage.setItem("sia_validation_questions", JSON.stringify({ category_questions: questions, idea_explanation_questions: ideaQuestions }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `question_${Date.now()}`,
        question: "New Question",
        options: ["Option 1", "Option 2"],
      },
    ]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const deleteQuestion = (index) => {
    if (confirm("Are you sure you want to delete this question?")) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const addOption = (questionIndex) => {
    const updated = [...questions];
    updated[questionIndex].options = [...updated[questionIndex].options, "New Option"];
    setQuestions(updated);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const deleteOption = (questionIndex, optionIndex) => {
    const updated = [...questions];
    updated[questionIndex].options = updated[questionIndex].options.filter((_, i) => i !== optionIndex);
    setQuestions(updated);
  };

  return (
    <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-primary text-secondary">Validation Questions</h2>
        <button
          onClick={handleSave}
          className="ui-btn ui-btn-primary focus-visible:outline-accent"
        >
          {saved ? "✓ Saved" : "Save Changes"}
        </button>
      </div>

      {/* Category Questions */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-primary">Category Questions</h3>
          <button
            onClick={addQuestion}
            className="rounded-xl border border-default bg-surface px-4 py-2 text-sm font-semibold text-accent transition hover:bg-surface"
          >
            + Add Question
          </button>
        </div>

        <div className="space-y-6">
          {questions.map((question, qIndex) => (
            <div key={question.id} className="rounded-2xl border border-default bg-app p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-semibold text-primary">Question ID</label>
                  <input
                    type="text"
                    value={question.id}
                    onChange={(e) => updateQuestion(qIndex, "id", e.target.value)}
                    className="mb-3 w-full rounded-lg border border-default bg-surface p-2 text-sm"
                  />
                  <label className="mb-2 block text-sm font-semibold text-primary">Question Text</label>
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                    className="w-full rounded-lg border border-default bg-surface p-2 text-sm"
                  />
                </div>
                <button
                  onClick={() => deleteQuestion(qIndex)}
                  className="ui-btn badge-danger focus-visible:outline-accent"
                >
                  Delete
                </button>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-primary">Options</label>
                  <button
                    onClick={() => addOption(qIndex)}
                    className="rounded-lg border border-default bg-surface px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-surface"
                  >
                    + Add Option
                  </button>
                </div>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        className="flex-1 rounded-lg border border-default bg-surface p-2 text-sm"
                      />
                      <button
                        onClick={() => deleteOption(qIndex, oIndex)}
                        className="rounded-lg border border-default bg-surface px-3 py-2 text-sm text-secondary transition hover:bg-surface"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Idea Explanation Questions */}
      <div>
        <h3 className="mb-4 text-xl font-semibold text-primary">Idea Explanation Questions</h3>
        <div className="space-y-6">
          {ideaQuestions.map((q, index) => (
            <div key={q.id || index} className="rounded-lg border border-default bg-surface p-4">
              <input
                type="text"
                value={q.question}
                onChange={(e) => {
                  const updated = [...ideaQuestions];
                  updated[index] = { ...updated[index], question: e.target.value };
                  setIdeaQuestions(updated);
                }}
                placeholder="Question text"
                className="mb-3 w-full rounded-lg border border-default bg-surface p-2 text-sm font-semibold"
              />
              <div className="space-y-2">
                {q.options.map((opt, optIndex) => (
                  <input
                    key={optIndex}
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...ideaQuestions];
                      updated[index].options[optIndex] = e.target.value;
                      setIdeaQuestions(updated);
                    }}
                    className="w-full rounded-lg border border-default bg-surface p-2 text-sm"
                    placeholder={`Option ${optIndex + 1}`}
                  />
                ))}
                <button
                  onClick={() => {
                    const updated = [...ideaQuestions];
                    updated[index].options.push("New Option");
                    setIdeaQuestions(updated);
                  }}
                  className="mt-2 rounded-lg border border-default bg-surface px-3 py-1 text-xs font-semibold text-accent transition hover:bg-surface"
                >
                  + Add Option
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => setIdeaQuestions([...ideaQuestions, { id: `idea_${Date.now()}`, question: "New Question", options: ["Option 1", "Option 2"] }])}
            className="mt-2 rounded-lg border border-default bg-surface px-4 py-2 text-sm font-semibold text-accent transition hover:bg-surface"
          >
            + Add Question
          </button>
        </div>
      </div>
    </div>
  );
}

