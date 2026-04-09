# Data Deletion & Retention Policy
## Tyeny LLC — PMF Capital Marketplace

**Document Version:** 1.0
**Effective Date:** April 9, 2026
**Last Reviewed:** April 9, 2026
**Next Scheduled Review:** October 9, 2026
**Policy Owner:** Matt Makharadze, Tyeny LLC
**Application:** PMF Capital Marketplace

---

## 1. Purpose

This policy establishes the data retention and deletion practices for Tyeny LLC ("the Company") as they relate to the PMF Capital Marketplace application ("the Application"). The policy is designed to ensure responsible data management in compliance with applicable data privacy laws and third-party provider requirements.

This policy is reviewed on a semi-annual basis and updated as needed when material changes occur to the Application, applicable law, or third-party integrations.

---

## 2. Scope

This policy applies to:

- All data stored within the Application's database infrastructure
- All data obtained through third-party service integrations
- All data generated through system operations
- All personnel with access to production systems

---

## 3. Data Classification

The Company classifies data into the following categories to determine appropriate handling, retention, and deletion procedures:

| Classification | Definition | Handling |
|---------------|-----------|----------|
| **Sensitive** | Data requiring encryption at rest. Access restricted to the application server layer. | Encrypted with AES-256-GCM. Access logged. Deleted when no longer needed for active operations. |
| **Personal Identifiable Information (PII)** | Data that can identify an individual user. | Protected by role-based access controls. Retained for the duration of the business relationship plus a post-termination period. |
| **Financial Records** | Immutable business transaction records. | Append-only. Corrections made via reversal entries, not modification. Retained per legal requirements. |
| **Operational** | System-generated data for auditing, monitoring, and operations. | Retained per defined schedule. Purged automatically when past retention window. |
| **Transient** | Data used only during a single session or operation. | Not persisted beyond immediate use. |

---

## 4. Retention Schedule

### 4.1 Active Data

Data is retained in its active state while the associated user account, deal, or business process remains active.

### 4.2 Retention Periods

| Data Category | Retention Period | Basis |
|--------------|-----------------|-------|
| Financial transaction records (payments, distributions, syndications, payouts) | 7 years from record creation or deal closure | IRS record-keeping requirements (26 USC § 6501); state business record retention laws |
| User PII (name, email, contact information) | Duration of active account + 1 year post-deactivation | Required to maintain association with financial records during the retention window |
| Sensitive integration data (third-party tokens, account credentials) | Until the associated link or account is deactivated | Data minimization — no ongoing need once the integration is severed |
| Audit logs | 7 years | Consistent with financial record retention; supports regulatory examination |
| Operational records (email ingestion, notifications) | 90 days to 1 year depending on type | Operational reference only; no long-term regulatory requirement |

### 4.3 Rationale

The 7-year retention period for financial records is based on the IRS general statute of limitations (3 years, extended to 6 years for substantial understatement of income under 26 USC § 6501), with a 1-year safety margin. This period also satisfies state-level business record retention requirements.

---

## 5. Deletion Procedures

### 5.1 User-Initiated Actions

**Unlinking a third-party account:**

1. The relevant third-party provider is notified to revoke access on their end.
2. Stored tokens and credentials associated with the link are cleared from the database.
3. The record is marked inactive.
4. The action is recorded in the audit log.

**Account deactivation:**

1. All linked third-party integrations are processed through the unlinking procedure above.
2. The user account is marked inactive.
3. PII is retained for the post-termination period defined in Section 4.2.
4. After the post-termination period, PII fields are anonymized (replaced with non-identifying placeholders).

### 5.2 Automated Deletion

The Application runs scheduled processes to purge data that has exceeded its retention window:

- Operational notifications beyond their retention period
- Ingested records beyond their retention period
- Anonymization of deactivated user accounts past the post-termination retention period

### 5.3 Financial Record Integrity

Financial transaction records (payments, distributions, syndication commitments, payout records) are treated as immutable ledger entries:

- Records are never modified or deleted during the retention period.
- Corrections are made exclusively through reversal entries that create a counter-record.
- Audit logs are append-only and cannot be modified or deleted by any user role.

---

## 6. Third-Party Integration Data

Data obtained through third-party integrations (such as bank account linking services) is subject to the following controls:

- Access tokens and credentials are encrypted at rest using AES-256-GCM.
- All third-party API communication occurs over TLS 1.2+.
- Tokens are revoked on the provider's side when the associated link is removed.
- No third-party integration data is cached in intermediate storage layers.
- Third-party data is used in accordance with the respective provider's developer policies and the user's consent at the time of linking.

---

## 7. Data Subject Rights

### 7.1 Right to Access

Users may request a summary of their stored data by contacting the Company. Responses are provided within 30 days and include profile information, transaction history, and linked account display information. Encrypted credentials are not provided in plaintext.

### 7.2 Right to Deletion

Users may request deletion of their data. The Company will process the request within 30 days. Financial records subject to legal retention requirements will be retained for the mandated period and anonymized thereafter.

### 7.3 Right to Rectification

Users may request correction of inaccurate personal information. Financial transaction records are corrected through the Application's reversal mechanism.

---

## 8. Enforcement

### 8.1 Technical Controls

- Role-based access control restricts data operations by user role
- Sensitive data encrypted at rest with AES-256-GCM
- All data modifications logged in an immutable audit trail
- All data operations routed through the Application's API layer, which enforces access policies
- Production credentials stored as environment variables, never in source code

### 8.2 Administrative Controls

- This policy is communicated to all personnel with production system access
- Production environment access is restricted to authorized personnel
- Policy violations are grounds for immediate revocation of system access

---

## 9. Policy Review Schedule

| Review Activity | Frequency |
|----------------|-----------|
| Full policy review | Semi-annually |
| Data inventory audit | Annually |
| Retention compliance check | Quarterly |
| Third-party policy alignment review | As needed upon provider policy updates |

### Review Log

| Date | Reviewer | Summary |
|------|----------|---------|
| April 9, 2026 | Matt Makharadze | Initial policy creation |

---

## 10. Applicable Laws & Standards

This policy is designed to operate in compliance with:

- Applicable federal tax record-keeping requirements (26 USC § 6501)
- State business record retention laws
- California Consumer Privacy Act (CCPA), where applicable
- Third-party provider developer policies and data handling requirements

---

## 11. Contact

**Policy Owner:** Matt Makharadze
**Company:** Tyeny LLC
**Email:** matt@tyeny.com

---

*This policy is reviewed and updated on a semi-annual basis, or as needed when material changes occur. All revisions are recorded in the Review Log.*
