# Data Retention Policy

**Last Updated:** January 2025  
**Company:** Idea Bunch  
**Location:** Illinois, United States

---

## Overview

This Data Retention Policy outlines how Idea Bunch ("we", "us", "our") retains, stores, and disposes of personal data collected through the Startup Idea Advisor platform ("Service"). This policy ensures compliance with applicable data protection laws, including GDPR and Illinois privacy regulations.

---

## General Principles

1. **Minimal Retention:** We retain personal data only for as long as necessary to fulfill the purposes outlined in our Privacy Policy.
2. **Secure Storage:** Data is stored securely using encryption and access controls.
3. **Systematic Deletion:** Data is deleted or anonymized when no longer needed, using automated processes where possible.
4. **Legal Compliance:** We may retain data longer when required by law or for legitimate business purposes.

---

## Data Retention Periods by Category

### 1. Account Data

**Data Type:** User accounts, email addresses, passwords (hashed), profile information, subscription status.

**Retention Period:**
- **Active Accounts:** Retained for the duration of the account lifecycle
- **Inactive Accounts:** If an account is inactive (no login) for 3 years, we will send a notice to the user. If no response within 90 days, the account will be marked for deletion.
- **Deleted Accounts:** Account data is retained for 30 days after deletion for backup and recovery purposes, then permanently deleted.
- **Exception:** Billing records may be retained longer as required by tax laws (see Payment Data section).

**Deletion Process:**
- User-requested deletion: Immediate upon request (with 30-day grace period for recovery)
- Automated deletion: After 3 years of inactivity + 90-day notice period + 30-day backup retention
- All associated data (profile inputs, saved reports, etc.) is deleted along with the account

---

### 2. Profile Inputs and Generated Content

**Data Type:** User inputs (goals, skills, preferences), generated reports, recommendations, validation results.

**Retention Period:**
- **Active Subscriptions:** Retained for the duration of the subscription and account lifecycle
- **After Subscription Cancellation:** Retained for 90 days to allow user to re-subscribe and access historical data
- **After Account Deletion:** Deleted immediately upon account deletion (with 30-day backup retention)

**Deletion Process:**
- Automatically deleted when account is deleted
- Users can manually delete individual reports or data through the Service dashboard
- Backup copies are purged within 30 days

---

### 3. Payment and Billing Data

**Data Type:** Transaction records, billing addresses, payment method information (processed by Stripe), invoices, receipts.

**Retention Period:**
- **Legal Requirement:** 7 years from the date of transaction (required by U.S. tax and accounting laws)
- **Payment Card Data:** Not stored by us; handled by Stripe (PCI DSS compliant)
- **Billing Records:** Retained for 7 years for tax, accounting, and dispute resolution purposes

**Deletion Process:**
- Not deleted before 7-year retention period due to legal obligations
- After 7 years, data is securely deleted unless required for ongoing legal proceedings
- Billing addresses and invoice data may be anonymized after 7 years for aggregate analytics

---

### 4. Usage and Analytics Data

**Data Type:** Page views, click patterns, session data, feature usage, device information, IP addresses.

**Retention Period:**
- **Detailed Logs:** 90 days
- **Aggregated Analytics:** 2 years (anonymized, no personally identifiable information)
- **Error Logs:** 90 days (may be extended if related to an ongoing security investigation)

**Deletion Process:**
- Detailed logs automatically purged after 90 days
- IP addresses anonymized after 90 days
- Aggregated analytics (no PII) retained for up to 2 years for service improvement

---

### 5. Communication Data

**Data Type:** Support tickets, email correspondence, contact form submissions, feedback.

**Retention Period:**
- **Support Communications:** 2 years after resolution
- **Marketing Communications:** Until opt-out or account deletion
- **Contact Form Submissions:** 1 year (or until purpose fulfilled, whichever is shorter)

**Deletion Process:**
- Automatically deleted after retention period
- Users can request deletion of communications at any time

---

### 6. Cookies and Tracking Data

**Data Type:** Cookie identifiers, tracking pixels, analytics tokens.

**Retention Period:**
- **Session Cookies:** Deleted when browser session ends
- **Persistent Cookies:** Maximum 2 years (as specified in cookie settings)
- **Analytics Cookies:** Per third-party provider policies (typically 24-26 months)

**Deletion Process:**
- Users can clear cookies through browser settings
- Cookies expire according to their configured expiration dates
- Third-party analytics providers handle their own retention (see their privacy policies)

---

### 7. Security and Audit Logs

**Data Type:** Authentication logs, access logs, security event logs, failed login attempts.

**Retention Period:**
- **Security Events:** 1 year (or longer if related to an active security investigation)
- **Authentication Logs:** 90 days
- **Audit Logs:** 2 years (for compliance and security analysis)

**Deletion Process:**
- Automatically purged after retention period
- May be retained longer for ongoing security investigations

---

### 8. Legal and Compliance Data

**Data Type:** Legal requests, court orders, compliance documentation, dispute records.

**Retention Period:**
- **Legal Holds:** Retained until legal hold is released
- **Dispute Records:** 7 years after resolution
- **Compliance Documentation:** As required by applicable laws (typically 5-7 years)

**Deletion Process:**
- Not deleted while under legal hold
- Deleted after legal obligations expire

---

## Data Deletion and Anonymization Methods

### Secure Deletion

1. **Database Records:** 
   - Soft delete first (mark as deleted)
   - Hard delete after grace period
   - Verify deletion completion

2. **Backup Systems:**
   - Backups are retained separately
   - Deleted data is removed from backups on next backup rotation cycle
   - Maximum backup retention: 30 days

3. **Third-Party Services:**
   - Data shared with third parties (e.g., analytics, payment processors) is subject to their retention policies
   - We request deletion from third parties when data is no longer needed
   - Some third parties may have their own retention obligations

### Anonymization

- For data used in aggregate analytics, we anonymize by removing all personally identifiable information
- Anonymized data may be retained indefinitely for research and analytics purposes
- Anonymization ensures data cannot be re-identified

---

## User Rights and Requests

### Right to Deletion

Users may request deletion of their personal data at any time by:
- Using the account deletion feature in the Service dashboard
- Contacting us at hello@ideabunch.com

We will process deletion requests within 30 days, subject to:
- Legal obligations requiring retention
- Legitimate business interests (e.g., fraud prevention)
- Ongoing legal proceedings

### Right to Access and Portability

Users may request a copy of their data at any time. We will provide data in a machine-readable format within 30 days.

---

## Special Circumstances

### Legal Holds

If data is subject to a legal hold (e.g., litigation, regulatory investigation), it will be retained beyond the standard retention period until the hold is released.

### Business Transfers

In the event of a merger, acquisition, or sale of assets, data may be transferred to the acquiring entity, subject to appropriate safeguards and user notification.

### Security Incidents

In the event of a security incident, relevant logs and data may be retained longer than standard periods for investigation and remediation purposes.

---

## Data Storage Locations

- **Primary Storage:** United States (AWS cloud infrastructure)
- **Backups:** United States (AWS backup systems)
- **Third-Party Services:** Locations as specified in third-party privacy policies

We ensure appropriate safeguards for international data transfers as required by GDPR.

---

## Review and Updates

This policy is reviewed annually or when:
- Applicable laws change
- Business needs change
- Security or privacy requirements change

Updates will be reflected in the "Last Updated" date at the top of this document.

---

## Compliance

This policy is designed to comply with:
- **GDPR (EU/UK):** Right to erasure, data minimization, storage limitation principles
- **Illinois PIPA:** Personal information protection requirements
- **CCPA (California):** Data retention transparency requirements
- **Other Applicable Laws:** As required by jurisdiction

---

## Contact

For questions about this Data Retention Policy or to exercise your data rights, contact:

**Email:** hello@ideabunch.com  
**Company:** Idea Bunch  
**Location:** Illinois, United States

---

## Related Documents

- [Privacy Policy](../frontend/src/pages/public/Privacy.jsx)
- [Terms of Service](../frontend/src/pages/public/Terms.jsx)
- [Data Processing Procedures](./DATA_PROCESSING_PROCEDURES.md)

