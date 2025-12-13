import { useState, useEffect, useRef } from "react";

export default function ProfileTab({ profile, onUpdate, getAuthHeaders, addToast }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    skills: [],
    experience_summary: "",
    location: "",
    linkedin_url: "",
    website_url: "",
    primary_skills: [],
    industries_of_interest: [],
    looking_for: "",
    commitment_level: "",
    is_public: true,
  });
  const [errors, setErrors] = useState({});
  const formDataRef = useRef(formData);

  // Keep ref in sync with state
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    if (profile) {
      // Ensure primary_skills and industries_of_interest are arrays
      const primarySkills = Array.isArray(profile.primary_skills) 
        ? profile.primary_skills 
        : (profile.primary_skills ? [profile.primary_skills] : []);
      const industries = Array.isArray(profile.industries_of_interest)
        ? profile.industries_of_interest
        : (profile.industries_of_interest ? [profile.industries_of_interest] : []);
      
      setFormData({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        skills: Array.isArray(profile.skills) ? profile.skills : [],
        experience_summary: profile.experience_summary || "",
        location: profile.location || "",
        linkedin_url: profile.linkedin_url || "",
        website_url: profile.website_url || "",
        primary_skills: primarySkills,
        industries_of_interest: industries,
        looking_for: profile.looking_for || "",
        commitment_level: profile.commitment_level || "",
        is_public: profile.is_public !== false,
      });
    }
  }, [profile]);

  const validateForm = () => {
    // Use ref to get the latest formData value
    const currentFormData = formDataRef.current;
    const newErrors = {};
    if (!currentFormData.full_name?.trim()) {
      newErrors.full_name = "Full name is required";
    }
    if (!currentFormData.bio?.trim() || currentFormData.bio.trim().length < 20) {
      newErrors.bio = "Bio is required (minimum 20 characters)";
    }
    // Check if primary_skills is an array and has at least one item
    const skills = Array.isArray(currentFormData.primary_skills) ? currentFormData.primary_skills : [];
    if (skills.length === 0) {
      newErrors.primary_skills = "At least one primary skill is required";
    }
    if (!currentFormData.looking_for?.trim()) {
      newErrors.looking_for = "What you're looking for is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // Validate using the latest formData from ref
    if (!validateForm()) {
      addToast("Please fill in all required fields", "error");
      return;
    }

    // Use the latest formData from ref for the API call
    const currentFormData = formDataRef.current;
    try {
      const res = await fetch("/api/founder/profile", {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(currentFormData),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setEditing(false);
          onUpdate();
          addToast("Profile saved successfully", "success");
        } else {
          addToast(data.error || "Failed to save profile", "error");
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        addToast(errorData.error || "Failed to save profile", "error");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      addToast("Failed to save profile. Please try again.", "error");
    }
  };

  const addSkill = (skill) => {
    if (skill && skill.trim()) {
      const currentSkills = Array.isArray(formData.primary_skills) ? formData.primary_skills : [];
      const trimmedSkill = skill.trim();
      if (!currentSkills.includes(trimmedSkill)) {
        const updatedSkills = [...currentSkills, trimmedSkill];
        setFormData({ ...formData, primary_skills: updatedSkills });
        // Update ref immediately
        formDataRef.current = { ...formDataRef.current, primary_skills: updatedSkills };
        // Clear error if skill is added
        if (errors.primary_skills) {
          setErrors({ ...errors, primary_skills: undefined });
        }
      }
    }
  };

  const removeSkill = (skill) => {
    const currentSkills = Array.isArray(formData.primary_skills) ? formData.primary_skills : [];
    const updatedSkills = currentSkills.filter(s => s !== skill);
    setFormData({ ...formData, primary_skills: updatedSkills });
    // Show error if removing last skill
    if (updatedSkills.length === 0) {
      setErrors({ ...errors, primary_skills: "At least one primary skill is required" });
    } else if (errors.primary_skills) {
      // Clear error if skills remain
      setErrors({ ...errors, primary_skills: undefined });
    }
  };

  if (!profile && !editing) {
    return (
      <div className="text-center py-12 rounded-xl border border-gray-200 shadow-sm bg-white p-6 md:p-7">
        <p className="text-[15px] text-gray-700 leading-relaxed mb-4">Create your Founder Profile</p>
        <p className="text-sm text-gray-600 mb-6">Set up your profile to start connecting with other founders.</p>
        <button
          onClick={() => setEditing(true)}
          className="px-5 py-2.5 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
        >
          Create Profile
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6 md:p-7">
      {editing ? (
        <div className="space-y-6">
          <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
          
          {/* Section 1: About You */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">About You</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.full_name ? "border-rose-500" : "border-gray-200"
                  }`}
                  placeholder="Your full name"
                />
                {errors.full_name && <p className="text-xs text-rose-500 mt-1">{errors.full_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Short Bio <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.bio ? "border-rose-500" : "border-gray-200"
                  }`}
                  rows={4}
                  placeholder="Tell us about yourself (minimum 20 characters)"
                />
                {errors.bio && <p className="text-xs text-rose-500 mt-1">{errors.bio}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Experience Summary</label>
                <textarea
                  value={formData.experience_summary}
                  onChange={(e) => setFormData({ ...formData, experience_summary: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  rows={3}
                  placeholder="Your background and experience"
                />
              </div>
            </div>
          </div>

          {/* Section 2: What You Bring / What You're Looking For */}
          <div className="border-b border-gray-200 dark:border-slate-700 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">What You Bring / What You're Looking For</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Primary Skills <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {Array.isArray(formData.primary_skills) && formData.primary_skills.length > 0 ? (
                    formData.primary_skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-2">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 italic">No skills added yet</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="primary-skills-input"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const value = e.target.value.trim();
                        if (value) {
                          addSkill(value);
                          e.target.value = "";
                        }
                      }
                    }}
                    onChange={(e) => {
                      // Clear validation error when user starts typing
                      if (errors.primary_skills) {
                        setErrors({ ...errors, primary_skills: undefined });
                      }
                    }}
                    className={`flex-1 px-3 py-2 border rounded-lg ${
                      errors.primary_skills && (!Array.isArray(formData.primary_skills) || formData.primary_skills.length === 0) 
                        ? "border-rose-500" 
                        : "border-gray-200"
                    }`}
                    placeholder="Add a skill and press Enter"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = e.target.previousElementSibling;
                      const value = input.value.trim();
                      if (value) {
                        addSkill(value);
                        input.value = "";
                      }
                    }}
                    className="px-5 py-2.5 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>
                {errors.primary_skills && (!Array.isArray(formData.primary_skills) || formData.primary_skills.length === 0) && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.primary_skills}
                    <span className="ml-2 text-gray-500">(Type a skill and press Enter or click Add)</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  What You're Looking For <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={formData.looking_for}
                  onChange={(e) => setFormData({ ...formData, looking_for: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.looking_for ? "border-rose-500" : "border-gray-200"
                  }`}
                  rows={3}
                  placeholder="What kind of collaborators or opportunities are you looking for?"
                />
                {errors.looking_for && <p className="text-xs text-rose-500 mt-1">{errors.looking_for}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Industries of Interest</label>
                <input
                  type="text"
                  value={formData.industries_of_interest?.join(", ") || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    industries_of_interest: e.target.value.split(",").map(s => s.trim()).filter(s => s) 
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  placeholder="SaaS, E-commerce, Healthcare (comma-separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Commitment Level</label>
                <select
                  value={formData.commitment_level}
                  onChange={(e) => setFormData({ ...formData, commitment_level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="">Select commitment level</option>
                  <option value="part-time">Part-time</option>
                  <option value="full-time">Full-time</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Privacy:</strong> Your name and email stay hidden. Others only see this profile after you both accept a connection.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setErrors({});
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold">My Profile</h2>
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Edit
            </button>
          </div>
          <div className="space-y-2">
            <p><strong>Name:</strong> {profile?.full_name || "Not set"}</p>
            <p><strong>Bio:</strong> {profile?.bio || "Not set"}</p>
            <p><strong>Location:</strong> {profile?.location || "Not set"}</p>
            {profile?.primary_skills && profile.primary_skills.length > 0 && (
              <p><strong>Skills:</strong> {profile.primary_skills.join(", ")}</p>
            )}
            {profile?.looking_for && (
              <p><strong>Looking for:</strong> {profile.looking_for}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

