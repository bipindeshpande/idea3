import Seo from "../../components/common/Seo.jsx";
import PageHeader from "../../components/layout/PageHeader.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import Card from "../../components/ui/Card.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";
import { CONTACT_EMAIL, COMPANY_NAME, PRODUCT_NAME } from "../../constants/contact.js";

export default function TermsPage() {
 const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
 
 return (
 <MarketingLayout>
 <PageContainer maxWidth="4xl">
 <Seo
 title="Terms of Service | Startup Idea Advisor"
 description="Review the terms and conditions of using Startup Idea Advisor."
 path="/terms"
 />
 <Card className="relative">
 <div className="absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-surface opacity-[0.09] blur-2xl pointer-events-none"></div>
 <div className="relative z-10">
 <PageHeader
 title="Terms of Service"
 description={`Last updated: ${currentDate}`}
 />
 <div className="prose prose-slate max-w-none">
 <h2>1. Agreement to Terms</h2>
 <p>
 By accessing, browsing, or using {PRODUCT_NAME} ("the Service", "Service") operated by {COMPANY_NAME} 
 ("we", "us", "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to 
 these Terms, do not access or use the Service.
 </p>
 <p>
 These Terms constitute a legally binding agreement between you and {COMPANY_NAME}. We may modify these 
 Terms at any time, and such modifications will be effective immediately upon posting. Your continued use 
 of the Service after modifications constitutes acceptance of the updated Terms.
 </p>
 
 <h2>2. Eligibility and Account Registration</h2>
 
 <h3>2.1 Age Requirement</h3>
 <p>You must be at least 16 years old (or 13 years old in the United States with parental consent) to 
 use the Service. If you are under 18, you represent that you have obtained parental or guardian consent 
 to use the Service.</p>
 
 <h3>2.2 Account Registration</h3>
 <ul>
 <li>You must provide accurate, current, and complete information when creating an account.</li>
 <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
 <li>You are responsible for all activities that occur under your account.</li>
 <li>You must notify us immediately of any unauthorized use of your account.</li>
 <li>You may not share your account with others or create multiple accounts to circumvent usage limits.</li>
 </ul>
 
 <h2>3. Description of Service</h2>
 <p>The Service provides AI-powered tools and resources to help users discover, validate, and develop 
 startup ideas. The Service includes but is not limited to:</p>
 <ul>
 <li>Personalized startup idea recommendations</li>
 <li>Idea validation tools and frameworks</li>
 <li>Educational resources and templates</li>
 <li>Networking and community features</li>
 </ul>
 <p>We reserve the right to modify, suspend, or discontinue any part of the Service at any time with 
 or without notice.</p>
 
 <h2>4. Fees, Payment, and Refund Policy</h2>
 
 <h3>4.1 Subscription Plans</h3>
 <ul>
 <li>Some features of the Service require a paid subscription ("Subscription").</li>
 <li>Subscription fees are displayed on our pricing page and are charged in advance.</li>
 <li>All fees are in U.S. Dollars unless otherwise stated.</li>
 </ul>
 
 <h3>4.2 Payment Terms</h3>
 <ul>
 <li>You agree to pay all fees associated with your Subscription using a valid payment method.</li>
 <li>Subscriptions automatically renew at the end of each billing period unless cancelled before the 
 renewal date.</li>
 <li>We may update pricing with at least 30 days' advance notice via email or Service notification.</li>
 <li>Price changes will apply to your next billing cycle after the notice period.</li>
 <li>If you do not agree to price changes, you must cancel your Subscription before the renewal date.</li>
 </ul>
 
 <h3>4.3 Refund and Cancellation Policy</h3>
 <p><strong>Subscription Cancellation:</strong></p>
 <ul>
 <li>You may cancel your Subscription at any time through your account settings or by contacting us.</li>
 <li>Cancellation takes effect at the end of your current billing period.</li>
 <li>You will continue to have access to paid features until the end of the billing period.</li>
 <li>No refunds are provided for partial billing periods.</li>
 </ul>
 
 <p><strong>Refund Eligibility:</strong></p>
 <ul>
 <li><strong>14-Day Money-Back Guarantee:</strong> New Subscriptions may be eligible for a full refund 
 within 14 days of the initial purchase, provided you have not exceeded reasonable usage limits. Contact 
 us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> to request a refund.</li>
 <li><strong>Service Issues:</strong> If the Service is unavailable or not functioning as described for 
 an extended period, you may be eligible for a prorated refund. Contact us to discuss.</li>
 <li><strong>Billing Errors:</strong> If you are charged incorrectly, contact us immediately. We will 
 promptly investigate and issue a refund if appropriate.</li>
 <li>Refund requests must be submitted within the applicable time period and will be evaluated on a 
 case-by-case basis.</li>
 <li>Refunds, if approved, will be processed to the original payment method within 5-10 business days.</li>
 </ul>
 
 <p><strong>Non-Refundable Items:</strong></p>
 <ul>
 <li>One-time purchases or add-ons are generally non-refundable unless required by law.</li>
 <li>Refunds are not available for Subscriptions that have been active for more than 14 days, except in 
 cases of Service failure or as required by law.</li>
 </ul>
 
 <h3>4.4 Failed Payments</h3>
 <ul>
 <li>If payment fails, we may suspend your Subscription until payment is received.</li>
 <li>You remain responsible for any outstanding fees.</li>
 <li>We reserve the right to use third-party payment processors, which may have additional terms.</li>
 </ul>
 
 <h2>5. Intellectual Property Rights</h2>
 
 <h3>5.1 Our Intellectual Property</h3>
 <p>{COMPANY_NAME} and {PRODUCT_NAME} own or license all rights, title, and interest in and to the Service, 
 including but not limited to:</p>
 <ul>
 <li>The Service's software, design, graphics, text, and other content</li>
 <li>Our trademarks, service marks, and logos</li>
 <li>The prompts, templates, and methodologies used to generate reports</li>
 </ul>
 <p>These are protected by copyright, trademark, and other intellectual property laws.</p>
 
 <h3>5.2 Your Rights to Generated Content</h3>
 <ul>
 <li>You own the output reports, recommendations, and content generated specifically for you through the 
 Service ("Your Content").</li>
 <li>You may use Your Content for personal or commercial purposes.</li>
 <li>You grant us a non-exclusive, royalty-free license to use Your Content to provide, improve, and 
 operate the Service.</li>
 </ul>
 
 <h3>5.3 User-Generated Content</h3>
 <ul>
 <li>If you submit, post, or upload content to the Service, you retain ownership but grant us a 
 worldwide, non-exclusive, royalty-free license to use, modify, and display such content in connection 
 with the Service.</li>
 <li>You represent that you have the right to grant such license and that your content does not violate 
 any third-party rights.</li>
 </ul>
 
 <h2>6. Acceptable Use</h2>
 
 <h3>6.1 Permitted Use</h3>
 <p>You may use the Service only for lawful purposes and in accordance with these Terms. You agree to:</p>
 <ul>
 <li>Comply with all applicable laws and regulations</li>
 <li>Provide accurate and truthful information</li>
 <li>Respect the rights of others</li>
 <li>Use the Service in a manner that does not interfere with or disrupt the Service</li>
 </ul>
 
 <h3>6.2 Prohibited Activities</h3>
 <p>You agree NOT to:</p>
 <ul>
 <li>Use the Service for any unlawful purpose or in violation of any laws</li>
 <li>Attempt to gain unauthorized access to the Service, other accounts, or computer systems</li>
 <li>Reverse engineer, decompile, disassemble, or attempt to extract the source code of the Service</li>
 <li>Scrape, crawl, or use automated systems to access the Service without permission</li>
 <li>Overload, overwhelm, or interfere with the Service's infrastructure</li>
 <li>Transmit viruses, malware, or other harmful code</li>
 <li>Impersonate any person or entity or misrepresent your affiliation</li>
 <li>Use the Service to generate malicious, harmful, or illegal content</li>
 <li>Violate any third-party rights, including intellectual property or privacy rights</li>
 <li>Circumvent any security measures or access controls</li>
 <li>Share your account credentials or allow others to use your account</li>
 </ul>
 
 <h2>7. Disclaimers and Warranties</h2>
 
 <h3>7.1 Service Availability</h3>
 <ul>
 <li>The Service is provided "as is" and "as available" without warranties of any kind, express or implied.</li>
 <li>We do not guarantee that the Service will be uninterrupted, error-free, secure, or available at all times.</li>
 <li>We reserve the right to perform maintenance, updates, or modifications that may temporarily affect 
 Service availability.</li>
 </ul>
 
 <h3>7.2 AI-Generated Content</h3>
 <ul>
 <li>Reports, recommendations, and other content generated by the Service are created using artificial 
 intelligence and should be considered advisory in nature.</li>
 <li>Such content is not guaranteed to be accurate, complete, or suitable for your specific situation.</li>
 <li>You are responsible for conducting your own due diligence and seeking professional advice before 
 making business decisions based on Service-generated content.</li>
 <li>We are not responsible for any business outcomes, financial losses, or decisions made based on 
 Service-generated content.</li>
 </ul>
 
 <h3>7.3 No Professional Advice</h3>
 <p>The Service does not provide legal, financial, tax, or professional business advice. The Service is 
 a tool to assist your ideation and research process. You should consult with qualified professionals 
 for advice specific to your situation.</p>
 
 <h3>7.4 Disclaimer of Warranties</h3>
 <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, 
 INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
 NON-INFRINGEMENT, AND ACCURACY.</p>
 
 <h2>8. Limitation of Liability</h2>
 <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:</p>
 <ul>
 <li>{COMPANY_NAME} SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE 
 DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, 
 ARISING OUT OF OR RELATING TO YOUR USE OF THE SERVICE.</li>
 <li>OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE SHALL 
 NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.</li>
 <li>SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION of CERTAIN DAMAGES, SO SOME OF THE 
 ABOVE LIMITATIONS MAY NOT APPLY TO YOU.</li>
 </ul>
 
 <h2>9. Indemnification</h2>
 <p>You agree to indemnify, defend, and hold harmless {COMPANY_NAME}, its affiliates, officers, directors, 
 employees, and agents from and against any claims, liabilities, damages, losses, costs, or expenses 
 (including reasonable attorneys' fees) arising out of or relating to:</p>
 <ul>
 <li>Your use of the Service</li>
 <li>Your violation of these Terms</li>
 <li>Your violation of any third-party rights</li>
 <li>Your violation of any applicable laws or regulations</li>
 </ul>
 
 <h2>10. Termination</h2>
 
 <h3>10.1 Termination by You</h3>
 <p>You may stop using the Service and cancel your Subscription at any time through your account settings 
 or by contacting us.</p>
 
 <h3>10.2 Termination by Us</h3>
 <p>We reserve the right to suspend or terminate your access to the Service immediately, without notice, 
 if you:</p>
 <ul>
 <li>Violate these Terms or any applicable laws</li>
 <li>Engage in fraudulent, abusive, or illegal activity</li>
 <li>Fail to pay required fees</li>
 <li>Create risk or potential legal exposure for us</li>
 </ul>
 
 <h3>10.3 Effect of Termination</h3>
 <ul>
 <li>Upon termination, your right to use the Service immediately ceases.</li>
 <li>We may delete or suspend your account and associated data.</li>
 <li>Sections of these Terms that by their nature should survive termination will survive, including 
 but not limited to Sections 5 (Intellectual Property), 7 (Disclaimers), 8 (Limitation of Liability), 
 and 9 (Indemnification).</li>
 </ul>
 
 <h2>11. Dispute Resolution</h2>
 
 <h3>11.1 Governing Law</h3>
 <p>These Terms shall be governed by and construed in accordance with the laws of the State of Illinois, 
 United States, without regard to its conflict of law provisions.</p>
 
 <h3>11.2 Dispute Resolution Process</h3>
 <ul>
 <li><strong>Informal Resolution:</strong> Before filing a claim, you agree to contact us at 
 <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> to attempt to resolve the dispute informally.</li>
 <li><strong>Jurisdiction:</strong> Any disputes arising out of or relating to these Terms or the Service 
 shall be resolved exclusively in the state or federal courts located in Illinois, United States, and you 
 consent to the personal jurisdiction of such courts.</li>
 </ul>
 
 <h2>12. General Provisions</h2>
 
 <h3>12.1 Entire Agreement</h3>
 <p>These Terms, together with our Privacy Policy, constitute the entire agreement between you and 
 {COMPANY_NAME} regarding the Service and supersede all prior agreements.</p>
 
 <h3>12.2 Severability</h3>
 <p>If any provision of these Terms is found to be unenforceable or invalid, that provision shall be 
 limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in 
 full force and effect.</p>
 
 <h3>12.3 Waiver</h3>
 <p>Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such 
 right or provision.</p>
 
 <h3>12.4 Assignment</h3>
 <p>You may not assign or transfer these Terms or your rights hereunder without our prior written consent. 
 We may assign these Terms in connection with a merger, acquisition, or sale of assets.</p>
 
 <h3>12.5 Force Majeure</h3>
 <p>We shall not be liable for any failure or delay in performance due to circumstances beyond our 
 reasonable control, including natural disasters, war, terrorism, labor disputes, or internet failures.</p>
 
 <h2>13. Contact Information</h2>
 <p>If you have questions about these Terms, please contact us:</p>
 <ul>
 <li><strong>Email:</strong> <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
 <li><strong>Company:</strong> {COMPANY_NAME}</li>
 <li><strong>Location:</strong> Illinois, United States</li>
 </ul>
 
 <h2>14. Acknowledgment</h2>
 <p>By using the Service, you acknowledge that you have read, understood, and agree to be bound by these 
 Terms of Service.</p>
 </div>
 </div>
 </Card>
 </PageContainer>
 </MarketingLayout>
 );
}
