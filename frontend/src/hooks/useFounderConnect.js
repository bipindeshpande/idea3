import { useState, useCallback } from "react";

// Generate dummy data functions
const generateDummyProfile = () => ({
  id: 1,
  full_name: "John Doe",
  bio: "Experienced entrepreneur with 10+ years in tech startups. Passionate about building products that solve real problems.",
  location: "San Francisco, CA",
  skills: ["Product Management", "Business Strategy", "Marketing"],
  experience_summary: "Former VP at two successful startups. Led product teams and scaled businesses from 0 to $10M ARR.",
  linkedin_url: "https://linkedin.com/in/johndoe",
  website_url: "https://johndoe.com",
  primary_skills: ["Product Management", "Business Strategy", "Marketing", "Leadership"],
  industries_of_interest: ["SaaS", "E-commerce", "Healthcare"],
  looking_for: "Technical co-founder with expertise in AI/ML to build the next generation of productivity tools.",
  commitment_level: "full-time",
  is_public: true,
});

const generateDummyListings = () => {
  const industries = ["SaaS", "E-commerce", "Healthcare", "FinTech", "EdTech", "AI/ML", "Blockchain", "IoT"];
  const stages = ["idea", "mvp", "launched"];
  const skillsNeeded = [
    ["Frontend Developer", "UI/UX Designer"],
    ["Backend Developer", "DevOps Engineer"],
    ["Marketing Specialist", "Content Writer"],
    ["Data Scientist", "ML Engineer"],
    ["Sales Manager", "Business Development"],
  ];
  
  return Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    title: `Startup Idea ${i + 1}: ${industries[i % industries.length]} Platform`,
    brief_description: `A revolutionary ${industries[i % industries.length].toLowerCase()} platform that solves real-world problems. This innovative solution addresses market gaps and provides value to users through cutting-edge technology and user-centric design.`,
    is_active: i % 3 !== 0,
    validation_score: 7.5 + (i % 3) * 0.8,
    industry: industries[i % industries.length],
    stage: stages[i % stages.length],
    skills_needed: skillsNeeded[i % skillsNeeded.length],
  }));
};

const generateDummyBrowseIdeas = () => {
  const industries = ["SaaS", "E-commerce", "Healthcare", "FinTech", "EdTech", "AI/ML", "Blockchain", "IoT"];
  const stages = ["idea", "mvp", "launched"];
  const commitmentLevels = ["part-time", "full-time", "flexible"];
  const founderSkills = [
    ["React", "Node.js", "TypeScript"],
    ["Python", "Django", "PostgreSQL"],
    ["Marketing", "SEO", "Content Strategy"],
    ["Machine Learning", "Data Science", "TensorFlow"],
    ["Sales", "Business Development", "CRM"],
  ];
  
  return Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    title: `Innovative ${industries[i % industries.length]} Solution ${i + 1}`,
    brief_description: `A cutting-edge ${industries[i % industries.length].toLowerCase()} platform designed to revolutionize the industry. This solution leverages modern technology to address critical market needs and deliver exceptional user experiences.`,
    industry: industries[i % industries.length],
    stage: stages[i % stages.length],
    commitment_level: commitmentLevels[i % commitmentLevels.length],
    founder: {
      looking_for: `Looking for ${i % 2 === 0 ? "technical" : "business"} co-founder to help scale this venture.`,
      primary_skills: founderSkills[i % founderSkills.length],
      commitment_level: commitmentLevels[i % commitmentLevels.length],
    },
  }));
};

const generateDummyBrowsePeople = () => {
  const skills = [
    ["React", "Node.js", "TypeScript", "AWS"],
    ["Python", "Django", "PostgreSQL", "Docker"],
    ["Marketing", "SEO", "Content Strategy", "Analytics"],
    ["Machine Learning", "Data Science", "TensorFlow", "PyTorch"],
    ["Sales", "Business Development", "CRM", "Strategy"],
    ["UI/UX Design", "Figma", "Prototyping", "User Research"],
    ["Product Management", "Agile", "Scrum", "Roadmapping"],
    ["DevOps", "Kubernetes", "CI/CD", "Infrastructure"],
  ];
  const industries = [
    ["SaaS", "E-commerce"],
    ["Healthcare", "FinTech"],
    ["EdTech", "AI/ML"],
    ["Blockchain", "IoT"],
    ["Gaming", "Social Media"],
  ];
  const commitmentLevels = ["part-time", "full-time", "flexible"];
  const lookingFor = [
    "Technical co-founder for SaaS startup",
    "Business partner for healthcare platform",
    "Designer for mobile app project",
    "Marketing expert for e-commerce venture",
    "Data scientist for AI product",
  ];
  
  return Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    looking_for: lookingFor[i % lookingFor.length],
    primary_skills: skills[i % skills.length],
    industries_of_interest: industries[i % industries.length],
    commitment_level: commitmentLevels[i % commitmentLevels.length],
    location: i % 2 === 0 ? "San Francisco, CA" : "New York, NY",
  }));
};

const generateDummyConnections = () => {
  const sent = Array.from({ length: 25 }, (_, i) => ({
    id: `sent-${i + 1}`,
    status: i % 3 === 0 ? "accepted" : i % 3 === 1 ? "pending" : "pending",
    message: `Connection request for ${i % 2 === 0 ? "idea collaboration" : "co-founder opportunity"}`,
    idea_listing_id: i + 1,
    recipient_id: i + 1,
  }));
  
  const received = Array.from({ length: 25 }, (_, i) => ({
    id: `received-${i + 1}`,
    status: i % 3 === 0 ? "accepted" : i % 3 === 1 ? "pending" : "pending",
    message: `Interested in connecting about your ${i % 2 === 0 ? "startup idea" : "founder profile"}`,
    idea_listing_id: i + 1,
    sender_id: i + 1,
  }));
  
  return { sent, received };
};

export function useFounderConnect(getAuthHeaders) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [browseIdeas, setBrowseIdeas] = useState([]);
  const [browsePeople, setBrowsePeople] = useState([]);
  const [connections, setConnections] = useState({ sent: [], received: [] });
  const [usage, setUsage] = useState(null);
  const [error, setError] = useState(null);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use dummy data for preview
      setProfile(generateDummyProfile());
      setUsage({ connections: { used: 5, limit: 20, remaining: 15 } });
      setConnections(generateDummyConnections());
    } catch (err) {
      setError("Failed to load data. Please try again.");
      console.error("Error loading founder connect data:", err);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const loadListings = useCallback(async () => {
    try {
      // Use dummy data for preview
      setListings(generateDummyListings());
    } catch (err) {
      console.error("Error loading listings:", err);
    }
  }, [getAuthHeaders]);

  const loadBrowseIdeas = useCallback(async (filters = {}) => {
    try {
      // Use dummy data for preview
      setBrowseIdeas(generateDummyBrowseIdeas());
    } catch (err) {
      console.error("Error loading browse ideas:", err);
    }
  }, [getAuthHeaders]);

  const loadBrowsePeople = useCallback(async (filters = {}) => {
    try {
      // Use dummy data for preview
      setBrowsePeople(generateDummyBrowsePeople());
    } catch (err) {
      console.error("Error loading browse people:", err);
    }
  }, [getAuthHeaders]);

  return {
    loading,
    profile,
    listings,
    browseIdeas,
    browsePeople,
    connections,
    usage,
    error,
    loadInitialData,
    loadListings,
    loadBrowseIdeas,
    loadBrowsePeople,
  };
}

