import Seo from "../../components/common/Seo.jsx";
import PageHeader from "../../components/layout/PageHeader.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import Card from "../../components/ui/Card.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";

export default function PrivacyPage() {
 return (
 <MarketingLayout>
 <PageContainer maxWidth="4xl">
 <Seo
 title="Privacy Policy | Startup Idea Advisor"
 description="Learn how Startup Idea Advisor handles your data, privacy, and security."
 path="/privacy"
 />
 <Card className="relative">
 <div className="absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-surface opacity-[0.09] blur-2xl pointer-events-none"></div>
 <div className="relative z-10">
 <PageHeader
 title="Privacy Policy"
 description="Last updated: November 2025"
 />
 <div className="prose prose-slate">
 <p>
 Startup Idea Advisor (“we”, “us”) is committed to protecting your privacy. This policy describes what
 information we collect, how we use it, and the choices you have.
 </p>
 <h2>Information we collect</h2>
 <ul>
 <li>
 <strong>Profile inputs:</strong> Goals, time commitment, professional background, skills, and other fields
 you voluntarily provide when using the platform. These inputs are processed transiently to generate reports and
 are not stored after the run completes.
 </li>
 <li>
 <strong>Saved sessions:</strong> If you opt into local history, runs are stored in your browser’s local
 storage. We do not store these on our servers.
 </li>
 <li>
 <strong>Analytics:</strong> If enabled, Google Analytics or Microsoft Clarity may collect anonymized usage
 data (page views, clicks). You can opt out via browser settings or ad blockers.
 </li>
 <li>
 <strong>Contact details:</strong> If you join the waitlist, book a demo, or email us, we store that
 information to respond.
 </li>
 </ul>
 <h2>How we use information</h2>
 <ul>
 <li>Generate personalized ideation reports.</li>
 <li>Improve product features and understand aggregate usage trends.</li>
 <li>Communicate updates, respond to support requests, and share relevant content.</li>
 </ul>
 <h2>How we protect your data</h2>
 <ul>
 <li>We do not persist your inputs or outputs on our servers; reports live in your browser unless you export them.</li>
 <li>All API requests are encrypted via HTTPS.</li>
 <li>We use enterprise-grade AI assistant providers who commit to not training on submitted data.</li>
 </ul>
 <h2>Your choices</h2>
 <ul>
 <li>Disable analytics cookies via browser settings.</li>
 <li>Clear saved sessions from your dashboard or browser if you don’t want local storage.</li>
 <li>Unsubscribe from emails at any time by clicking the link in our messages.</li>
 </ul>
 <h2>Children’s privacy</h2>
 <p>The service is not intended for users under 16. We do not knowingly collect data from children.</p>
 <h2>Updates</h2>
 <p>We may update this policy periodically. Material changes will be announced on this page.</p>
 <h2>Contact</h2>
 <p>
 Questions? Email <a href="mailto:hello@startupideaadvisor.com">hello@startupideaadvisor.com</a>.
 </p>
 </div>
 </div>
 </Card>
 </PageContainer>
 </MarketingLayout>
 );
}
