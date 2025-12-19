import { useState } from "react";
import Seo from "../../components/common/Seo.jsx";
import { HeroSection } from "../../sections/marketing/contact";
import Blob from "../../components/marketing/Blob.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import Card from "../../components/ui/Card.jsx";
import UIButton from "../../components/ui/ui-button.jsx";
import UIHeading from "../../components/ui/ui-heading.jsx";
import FormInput from "../../components/ui/FormInput.jsx";
import FormTextarea from "../../components/ui/FormTextarea.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";

export default function ContactPage() {
 const [formData, setFormData] = useState({
 name: "",
 email: "",
 company: "",
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
 message: "",
 });
 // Scroll to top to show success message
 window.scrollTo({ top: 0, behavior: "smooth" });
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
 <MarketingLayout>
 <PageContainer maxWidth="4xl">
 <Seo
 title="Contact | Idea Bunch"
 description="Reach the Startup Idea Advisor team for pilots, partnerships, or support."
 path="/contact"
 />
 
 {/* Hero Section */}
 <HeroSection
 title="Get in Touch"
 subtitle="Interested in pilots, partnerships, or press? Drop us a note and we'll get back within one business day."
 className="mb-16"
 />

 <div className="grid gap-4 lg:grid-cols-3">
 {/* Main Contact Form */}
 <div className="lg:col-span-2">
 <Card className="marketing-card-blue relative overflow-hidden">
 <Blob size="small" position="top-right" />
 <div className="relative z-10">
 
 {success && (
 <Card className="mb-6 border-default border-default bg-surface bg-surface">
 <div className="flex items-start gap-3">
 <div className="icon-circle bg-surface bg-surface text-accent text-accent text-xl shrink-0">
 ✓
 </div>
 <div>
 <p className="text-primary text-accent text-accent leading-relaxed font-semibold mb-1">
 Message sent successfully!
 </p>
 <p className="text-base text-accent">
 Thank you for reaching out. We'll get back to you within one business day.
 </p>
 </div>
 </div>
 </Card>
 )}

 {error && (
 <Card className="mb-6 border-default border-default bg-surface bg-surface">
 <div className="flex items-start gap-3">
 <div className="icon-circle bg-surface bg-surface text-accent text-accent text-xl shrink-0">
 ⚠
 </div>
 <div>
 <p className="text-primary text-accent text-accent leading-relaxed font-semibold">
 {error}
 </p>
 </div>
 </div>
 </Card>
 )}

 <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
 <FormInput
 type="text"
 name="name"
 placeholder="Your Name"
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
 <FormTextarea
 name="message"
 placeholder="How can we help? Tell us more about your inquiry..."
 rows={5}
 value={formData.message}
 onChange={handleChange}
 required
 className="md:col-span-2"
 />
 <UIButton
 type="submit"
 disabled={loading}
 className="md:col-span-2 w-full"
 >
 {loading ? "Sending..." : "Send Message"}
 </UIButton>
 </form>
 </div>
 </Card>
 </div>

 {/* Contact Information Sidebar */}
 <div className="lg:col-span-1">
 <div className="space-y-6">
 {/* Direct Contact Card */}
 <Card className="marketing-card-purple">
 <div className="marketing-icon-circle mb-4 mx-auto">
 <span className="text-2xl">✉️</span>
 </div>
 <UIHeading level="h3" className="marketing-card-title text-primary mb-3 text-center">Email Us</UIHeading>
 <p className="text-base text-secondary mb-4 text-center">
 Prefer to email directly? We're here to help.
 </p>
 <a
 href="mailto:hello@ideabunch.com"
 className="text-base text-accent hover:text-accent-hover font-semibold break-all text-center block"
 >
 hello@ideabunch.com
 </a>
 </Card>

 {/* Response Time Card */}
 <Card className="marketing-card-teal">
 <div className="marketing-icon-circle mb-4 mx-auto">
 <span className="text-2xl">⏱️</span>
 </div>
 <UIHeading level="h3" className="marketing-card-title text-primary mb-3 text-center">Response Time</UIHeading>
 <p className="text-base text-secondary leading-relaxed text-center">
 We typically respond within <strong className="text-primary">one business day</strong>. For urgent matters, please mention it in your message.
 </p>
 </Card>

 {/* What We Can Help With Card */}
 <Card className="marketing-card-orange">
 <div className="marketing-icon-circle mb-4 mx-auto">
 <span className="text-2xl">💬</span>
 </div>
 <UIHeading level="h3" className="marketing-card-title text-primary mb-4 text-center">We Can Help With</UIHeading>
 <ul className="space-y-3 text-base text-secondary">
 <li className="flex items-start gap-2">
 <span className="text-accent mt-0.5 font-bold">•</span>
 <span>Partnership opportunities</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-accent mt-0.5 font-bold">•</span>
 <span>Pilot program inquiries</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-accent mt-0.5 font-bold">•</span>
 <span>Press and media requests</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-accent mt-0.5 font-bold">•</span>
 <span>Product feedback and suggestions</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-accent mt-0.5 font-bold">•</span>
 <span>Technical support</span>
 </li>
 </ul>
 </Card>
 </div>
 </div>
 </div>
 </PageContainer>
 </MarketingLayout>
 );
}

