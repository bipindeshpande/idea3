import Seo from "../../components/common/Seo.jsx";
import PageHeader from "../../components/layout/PageHeader.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import Card from "../../components/ui/Card.jsx";

export default function TermsPage() {
  return (
    <PageContainer maxWidth="4xl">
      <Seo
        title="Terms of Service | Startup Idea Advisor"
        description="Review the terms and conditions of using Startup Idea Advisor."
        path="/terms"
      />
      <Card className="relative">
        <div className="absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-indigo-300 opacity-[0.09] blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
      <PageHeader
        title="Terms of Service"
        description="Last updated: November 2025"
      />
      <div className="prose prose-slate">
        <h2>1. Agreement</h2>
        <p>
          By accessing or using Startup Idea Advisor (“the Service”), you agree to these Terms. If you do not agree, do
          not use the Service.
        </p>
        <h2>2. Access and use</h2>
        <ul>
          <li>You must be 16 or older to use the Service.</li>
          <li>Beta access is provided “as is” without guarantees of uptime or availability.</li>
          <li>You are responsible for maintaining the confidentiality of your devices and any saved reports.</li>
        </ul>
        <h2>3. Fees</h2>
        <ul>
          <li>
            Paid plans are charged in advance and renew automatically unless cancelled before the renewal date.
          </li>
          <li>We may update pricing with advance notice. Continued use after changes indicates acceptance.</li>
          <li>Refund requests will be handled case-by-case; contact support within 14 days of purchase.</li>
        </ul>
        <h2>4. Intellectual property</h2>
        <ul>
          <li>We retain ownership of the platform and generated prompts.</li>
          <li>You own the output reports and may use them for personal or business purposes.</li>
        </ul>
        <h2>5. Prohibited use</h2>
        <ul>
          <li>Do not use the Service for unlawful activity or to generate malicious content.</li>
          <li>Do not attempt to reverse engineer, scrape, or overload the Service.</li>
        </ul>
        <h2>6. Disclaimers</h2>
        <ul>
          <li>Reports are generated using AI. They should be considered advisory and require your own due diligence.</li>
          <li>We are not responsible for business outcomes or decisions made based on reports.</li>
        </ul>
        <h2>7. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, Startup Idea Advisor is not liable for indirect, incidental, or
          consequential damages arising from use of the Service.
        </p>
        <h2>8. Termination</h2>
        <p>
          We reserve the right to suspend or terminate access for violations of these Terms. You may stop using the
          Service at any time.
        </p>
        <h2>9. Changes</h2>
        <p>We may modify these Terms. Continued use after changes becomes effective constitutes acceptance.</p>
        <h2>10. Contact</h2>
        <p>
          Questions? Email <a href="mailto:hello@startupideaadvisor.com">hello@startupideaadvisor.com</a>.
        </p>
      </div>
      </div>
      </Card>
    </PageContainer>
  );
}
