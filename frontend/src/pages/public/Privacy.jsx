import Seo from "../../components/common/Seo.jsx";
import PageHeader from "../../components/layout/PageHeader.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import Card from "../../components/ui/Card.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";
import { CONTACT_EMAIL, COMPANY_NAME } from "../../constants/contact.js";

export default function PrivacyPage() {
 const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
 
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
 description={`Last updated: ${currentDate}`}
 />
 <div className="prose prose-slate max-w-none">
 <p>
 {COMPANY_NAME} ("we", "us", "our") operates the Startup Idea Advisor platform ("Service", "Platform"). 
 We are committed to protecting your privacy and complying with applicable data protection laws, including 
 the General Data Protection Regulation (GDPR) for users in the European Union and the Illinois Personal 
 Information Protection Act (PIPA) for Illinois residents.
 </p>
 
 <h2>1. Information We Collect</h2>
 
 <h3>1.1 Information You Provide</h3>
 <ul>
 <li>
 <strong>Account Information:</strong> When you register for an account, we collect your email address, 
 password (hashed), and any profile information you choose to provide.
 </li>
 <li>
 <strong>Profile Inputs:</strong> When using the Service, you may provide information including but not 
 limited to: goals, time commitment, professional background, skills, interests, budget range, and other 
 fields relevant to generating personalized recommendations. This information is stored on our servers to 
 provide you with ongoing access to your reports and recommendations.
 </li>
 <li>
 <strong>Payment Information:</strong> When you make a purchase, our payment processor (Stripe) collects 
 billing information including name, billing address, and payment card details. We do not store full 
 payment card numbers on our servers.
 </li>
 <li>
 <strong>Communications:</strong> When you contact us via email, contact forms, or support channels, we 
 collect and store your communication and contact information to respond to your inquiries.
 </li>
 </ul>
 
 <h3>1.2 Automatically Collected Information</h3>
 <ul>
 <li>
 <strong>Usage Data:</strong> We collect information about how you interact with the Service, including 
 pages visited, features used, time spent, and navigation patterns.
 </li>
 <li>
 <strong>Device Information:</strong> We collect information about your device, including IP address, 
 browser type, operating system, device identifiers, and mobile network information.
 </li>
 <li>
 <strong>Cookies and Tracking Technologies:</strong> We use cookies, web beacons, and similar technologies 
 to collect information about your browsing behavior. You can control cookies through your browser settings.
 </li>
 <li>
 <strong>Analytics:</strong> We use third-party analytics services (e.g., Google Analytics, Microsoft Clarity) 
 that collect anonymized usage data. You can opt out via browser settings or ad blockers.
 </li>
 </ul>
 
 <h3>1.3 Third-Party Information</h3>
 <ul>
 <li>
 <strong>AI Service Providers:</strong> When generating reports, your inputs are transmitted to third-party 
 AI service providers (e.g., OpenAI, Anthropic). These providers have their own privacy policies and commit 
 to not training models on your data when using enterprise APIs.
 </li>
 <li>
 <strong>Authentication Services:</strong> If you choose to authenticate using third-party services 
 (e.g., Google, GitHub), we receive information from those services as authorized by you.
 </li>
 </ul>
 
 <h2>2. How We Use Your Information</h2>
 <p>We use the information we collect for the following purposes:</p>
 <ul>
 <li><strong>Service Delivery:</strong> To provide, operate, and maintain the Service, including generating 
 personalized ideation reports and recommendations.</li>
 <li><strong>Account Management:</strong> To create and manage your account, authenticate users, and provide 
 customer support.</li>
 <li><strong>Payment Processing:</strong> To process payments, manage subscriptions, and send billing 
 notifications.</li>
 <li><strong>Communication:</strong> To send you service-related communications, respond to your inquiries, 
 and notify you about changes to our Service or policies.</li>
 <li><strong>Marketing:</strong> With your consent, to send you marketing communications about our products 
 and services. You can opt out at any time.</li>
 <li><strong>Improvement:</strong> To analyze usage patterns, improve product features, conduct research, 
 and understand aggregate trends.</li>
 <li><strong>Legal Compliance:</strong> To comply with legal obligations, enforce our Terms of Service, 
 protect our rights, and ensure security.</li>
 </ul>
 
 <h2>3. Legal Basis for Processing (GDPR)</h2>
 <p>If you are located in the European Economic Area (EEA) or United Kingdom, we process your personal 
 data based on the following legal grounds:</p>
 <ul>
 <li><strong>Contract Performance:</strong> To fulfill our contract with you to provide the Service.</li>
 <li><strong>Consent:</strong> When you have given clear consent for specific processing activities, such 
 as marketing communications.</li>
 <li><strong>Legitimate Interests:</strong> For our legitimate business interests, including improving the 
 Service, security, and fraud prevention, balanced against your privacy rights.</li>
 <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations.</li>
 </ul>
 
 <h2>4. Data Sharing and Disclosure</h2>
 <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
 <ul>
 <li><strong>Service Providers:</strong> With trusted third-party service providers who perform services 
 on our behalf, including payment processing, hosting, analytics, email delivery, and AI services. These 
 providers are contractually obligated to protect your information.</li>
 <li><strong>Business Transfers:</strong> In connection with any merger, acquisition, sale of assets, or 
 other business transaction.</li>
 <li><strong>Legal Requirements:</strong> When required by law, regulation, legal process, or governmental 
 request, or to protect our rights, property, or safety, or that of others.</li>
 <li><strong>With Your Consent:</strong> When you have explicitly consented to the sharing.</li>
 </ul>
 
 <h2>5. Data Retention</h2>
 <p>We retain your personal information for as long as necessary to provide the Service and fulfill the 
 purposes outlined in this policy, unless a longer retention period is required or permitted by law.</p>
 <ul>
 <li><strong>Account Data:</strong> Retained for the duration of your account and up to 30 days after 
 account deletion for backup and recovery purposes.</li>
 <li><strong>Usage Data:</strong> Retained for up to 2 years for analytics and service improvement purposes.</li>
 <li><strong>Payment Records:</strong> Retained for up to 7 years as required by tax and accounting laws.</li>
 <li><strong>Marketing Data:</strong> Retained until you opt out or withdraw consent.</li>
 </ul>
 <p>For detailed information about our data retention policies, please contact us.</p>
 
 <h2>6. Data Security</h2>
 <p>We implement appropriate technical and organizational measures to protect your personal information:</p>
 <ul>
 <li>Encryption of data in transit using HTTPS/TLS protocols</li>
 <li>Encryption of sensitive data at rest</li>
 <li>Regular security assessments and updates</li>
 <li>Access controls and authentication mechanisms</li>
 <li>Secure password storage using industry-standard hashing</li>
 <li>Regular backups and disaster recovery procedures</li>
 </ul>
 <p>However, no method of transmission over the Internet or electronic storage is 100% secure. While we 
 strive to protect your information, we cannot guarantee absolute security.</p>
 
 <h2>7. Your Rights and Choices</h2>
 
 <h3>7.1 General Rights</h3>
 <p>You have the following rights regarding your personal information:</p>
 <ul>
 <li><strong>Access:</strong> Request access to your personal information and receive a copy of it.</li>
 <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information.</li>
 <li><strong>Deletion:</strong> Request deletion of your personal information, subject to legal and 
 contractual obligations.</li>
 <li><strong>Portability:</strong> Request transfer of your data to another service provider.</li>
 <li><strong>Opt-Out:</strong> Opt out of marketing communications at any time using unsubscribe links 
 or by contacting us.</li>
 </ul>
 
 <h3>7.2 GDPR Rights (EU/UK Users)</h3>
 <p>If you are located in the EEA or UK, you also have the right to:</p>
 <ul>
 <li><strong>Object to Processing:</strong> Object to processing based on legitimate interests.</li>
 <li><strong>Restrict Processing:</strong> Request restriction of processing in certain circumstances.</li>
 <li><strong>Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent.</li>
 <li><strong>Lodge a Complaint:</strong> File a complaint with your local data protection authority.</li>
 </ul>
 
 <h3>7.3 Illinois Privacy Rights</h3>
 <p>If you are a resident of Illinois, you have the right to:</p>
 <ul>
 <li>Know what personal information is collected about you</li>
 <li>Know whether your personal information is sold or disclosed and to whom</li>
 <li>Opt out of the sale of personal information (we do not sell personal information)</li>
 <li>Access your personal information</li>
 <li>Request deletion of your personal information</li>
 </ul>
 
 <h3>7.4 Exercising Your Rights</h3>
 <p>To exercise any of these rights, please contact us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. 
 We will respond to your request within 30 days (or as required by applicable law). We may need to verify 
 your identity before processing your request.</p>
 
 <h2>8. Cookies and Tracking Technologies</h2>
 <p>We use cookies and similar technologies to enhance your experience, analyze usage, and support our 
 marketing efforts. Types of cookies we use:</p>
 <ul>
 <li><strong>Essential Cookies:</strong> Required for the Service to function (cannot be disabled)</li>
 <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Service</li>
 <li><strong>Marketing Cookies:</strong> Used to track visitors across websites for marketing purposes</li>
 </ul>
 <p>You can control cookies through your browser settings. Note that disabling cookies may affect Service 
 functionality.</p>
 
 <h2>9. International Data Transfers</h2>
 <p>Your information may be transferred to and processed in countries other than your country of residence. 
 These countries may have data protection laws that differ from those in your country. When we transfer 
 personal data from the EEA or UK to other countries, we ensure appropriate safeguards are in place, 
 including Standard Contractual Clauses approved by the European Commission.</p>
 
 <h2>10. Children's Privacy</h2>
 <p>The Service is not intended for individuals under the age of 16 (or 13 in the United States). We do 
 not knowingly collect personal information from children. If we become aware that we have collected 
 personal information from a child without parental consent, we will take steps to delete that information. 
 If you believe we have collected information from a child, please contact us immediately.</p>
 
 <h2>11. Third-Party Links</h2>
 <p>The Service may contain links to third-party websites or services. We are not responsible for the 
 privacy practices of these third parties. We encourage you to review their privacy policies before 
 providing any information.</p>
 
 <h2>12. Do Not Track Signals</h2>
 <p>Some browsers include a "Do Not Track" (DNT) feature. Currently, there is no industry standard for 
 responding to DNT signals. We do not respond to DNT browser signals at this time.</p>
 
 <h2>13. Changes to This Privacy Policy</h2>
 <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, 
 legal requirements, or other factors. We will notify you of material changes by:</p>
 <ul>
 <li>Posting the updated policy on this page with a new "Last updated" date</li>
 <li>Sending an email notification to registered users (for significant changes)</li>
 <li>Displaying a notice on the Service (for material changes)</li>
 </ul>
 <p>Your continued use of the Service after such changes constitutes acceptance of the updated policy.</p>
 
 <h2>14. Contact Us</h2>
 <p>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, 
 please contact us:</p>
 <ul>
 <li><strong>Email:</strong> <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
 <li><strong>Company:</strong> {COMPANY_NAME}</li>
 <li><strong>Location:</strong> Illinois, United States</li>
 </ul>
 <p>For GDPR-related inquiries, you may also contact your local data protection authority.</p>
 </div>
 </div>
 </Card>
 </PageContainer>
 </MarketingLayout>
 );
}
