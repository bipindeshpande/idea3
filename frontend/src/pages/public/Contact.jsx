import { useState } from "react";
import Seo from "../../components/common/Seo.jsx";
import PageHeader from "../../components/layout/PageHeader.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import FormInput from "../../components/ui/FormInput.jsx";
import FormTextarea from "../../components/ui/FormTextarea.jsx";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    topic: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          company: "",
          topic: "",
          message: "",
        });
      } else {
        setError(data.error || "Failed to send message. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="2xl">
      <Seo
        title="Contact | Idea Bunch"
        description="Reach the Startup Idea Advisor team for pilots, partnerships, or support."
        path="/contact"
      />
      <Card className="relative">
        <div className="absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-indigo-300 opacity-[0.09] blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
        <PageHeader
          title="Contact"
          description="Interested in pilots, partnerships, or press? Drop us a note and we'll get back within one business day."
        />
        
        {success && (
          <Card className="mb-6">
            <p className="text-[15px] text-gray-700 leading-relaxed font-semibold">
              ✓ Thank you for your message! We'll get back to you soon.
            </p>
          </Card>
        )}

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <p className="text-[15px] text-red-800 leading-relaxed font-semibold">{error}</p>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <FormInput
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <FormInput
            type="email"
            name="email"
            placeholder="Work Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <FormInput
            type="text"
            name="company"
            placeholder="Company / Organization"
            value={formData.company}
            onChange={handleChange}
          />
          <FormInput
            type="text"
            name="topic"
            placeholder="Topic"
            value={formData.topic}
            onChange={handleChange}
          />
          <FormTextarea
            name="message"
            placeholder="How can we help?"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            required
            className="md:col-span-2"
          />
          <Button
            type="submit"
            disabled={loading}
            className="md:col-span-2 w-full"
          >
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </form>
        <div className="mt-6 text-sm text-gray-600">
          Prefer email? Reach us at <span className="font-semibold text-indigo-600">hello@ideabunch.com</span>
        </div>
        </div>
      </Card>
    </PageContainer>
  );
}

