# Access Control Policy
## Tyeny LLC — PMF Capital Marketplace Application

**Document Version:** 1.0
**Effective Date:** April 9, 2026
**Last Reviewed:** April 9, 2026
**Next Scheduled Review:** October 9, 2026
**Policy Owner:** Matt Makharadze, Tyeny LLC
**Application:** PMF Capital Marketplace
**Application URL:** https://pmf-capital-marketplace-production.up.railway.app

---

## 1. Company Overview

**Company Name:** Tyeny LLC
**Application Name:** PMF Capital Marketplace (the "Application")
**Nature of Business:** Internal merchant cash advance (MCA) syndication and portfolio management platform for Premier Merchant Funding (PMF).

The Application enables approved internal users of PMF to participate in MCA deal syndication, track repayment performance, manage payouts, and link bank accounts for disbursement processing. Third-party integrations are used where appropriate to facilitate account verification and payment operations.

---

## 2. Data Handling Principles

The Company follows these core principles when handling user and financial data:

1. **Purpose limitation** — Data obtained through third-party integrations is used to support the Application's core business functions.
2. **Data minimization** — The Application requests only the data necessary to fulfill its operational requirements.
3. **Encryption** — Sensitive credentials and financial data are encrypted at rest using AES-256-GCM with an application-level encryption key.
4. **Server-side processing** — All third-party API interactions occur server-side. Credentials, tokens, and sensitive data are never exposed to the frontend client.
5. **Consent** — Users provide explicit consent before any third-party account linking is initiated.
6. **Auditability** — All material data operations are recorded in an immutable audit log.

---

## 3. Data Storage & Encryption

### 3.1 Encryption at Rest

Sensitive data elements — including third-party access tokens, account credentials, and routing information — are encrypted at rest using AES-256-GCM. The encryption key is stored as an environment variable on the hosting platform and is never committed to source code or version control.

### 3.2 Encryption in Transit

All communication between the Application and third-party APIs occurs over TLS 1.2+. The Application is served exclusively over HTTPS.

### 3.3 Database Security

- **Hosting:** Managed PostgreSQL with provider-level encryption at rest
- **Credentials:** Database connection strings stored as environment variables, not in source code
- **Network:** Database accessible only from the Application's private network

---

## 4. Access Control

### 4.1 Application Roles

The Application enforces role-based access control. Users are assigned roles that determine their permissions:

| Capability | Standard Users | Administrative Users |
|-----------|---------------|---------------------|
| Link personal bank accounts | Yes (own account only) | Yes (own account only) |
| View own linked account information | Yes | Yes |
| View other users' linked accounts | No | No |
| Approve payout disbursements | No | Yes |
| Manage user accounts | No | Authorized admins only |
| View audit logs | No | Yes |

### 4.2 Credential & Token Access

| Credential Type | Access Level |
|----------------|-------------|
| Third-party API keys | Application server only (environment variable) |
| Encryption keys | Application server only (environment variable) |
| User-specific access tokens | Application server only (encrypted in database) |
| Database credentials | Application server only (environment variable) |

No API keys, access tokens, or encryption keys are exposed to the frontend client or logged in plaintext.

### 4.3 Personnel Access

- Access to production environment variables is restricted to authorized personnel at Tyeny LLC.
- Production database access is limited to the project owner.
- Credentials are not stored in source code, git history, or CI/CD logs.

---

## 5. Third-Party Integration Controls

Data obtained through third-party integrations (such as bank account linking and verification services) is subject to the following controls:

- **Token lifecycle:** Access tokens are encrypted at rest immediately upon receipt. When a user unlinks an account, the token is revoked on the provider's side and the encrypted value is cleared from the database.
- **No caching:** Third-party API responses are not cached in any intermediate storage layer (Redis, local files, CDN).
- **No client exposure:** All third-party API calls are made server-side. No tokens, credentials, or raw API responses are sent to the browser.
- **Provider policies:** Data obtained through third-party integrations is handled in accordance with the respective provider's developer policies and the user's consent at the time of linking.

---

## 6. Data Retention & Deletion

Detailed retention schedules and deletion procedures are defined in the Company's Data Deletion & Retention Policy. Key points:

- **Sensitive integration data** (tokens, account credentials) is deleted immediately when the associated link is removed by the user or upon account deactivation.
- **Financial transaction records** are retained for 7 years in accordance with IRS record-keeping requirements.
- **User PII** is retained for 1 year post-deactivation, then anonymized.
- **Audit logs** are retained for 7 years and are append-only.

When a user unlinks an account:
1. The third-party provider is notified to revoke access.
2. Encrypted credentials are cleared from the database.
3. The action is recorded in the audit log.

---

## 7. Incident Response

In the event of a security incident involving user data or third-party integration data:

1. Affected third-party providers will be notified within 72 hours.
2. Affected users will be notified within 72 hours.
3. Compromised access tokens will be revoked immediately via the provider's API.
4. The encryption key will be rotated and all stored tokens re-encrypted.
5. The incident will be documented in the audit log with full details.

---

## 8. Logging & Monitoring

All material actions related to account linking, data access, and financial operations are recorded in the Application's immutable audit log, including:

- Account linking and unlinking events
- Payout requests, approvals, and disbursements
- User authentication events
- Administrative actions (user management, deal management, status changes)

Each log entry records the actor, timestamp, action type, affected resource, and relevant metadata.

---

## 9. Policy Review

| Review Activity | Frequency |
|----------------|-----------|
| Full policy review | Semi-annually |
| Access control audit | Annually |
| Third-party integration review | As needed upon provider policy updates |
| Incident response procedure review | Annually |

### Review Log

| Date | Reviewer | Summary |
|------|----------|---------|
| April 9, 2026 | Matt Makharadze | Initial policy creation |

---

## 10. Contact

**Policy Owner:** Matt Makharadze
**Company:** Tyeny LLC
**Email:** matt@tyeny.com

---

*This policy is reviewed and updated on a semi-annual basis, or as needed when material changes occur. All revisions are recorded in the Review Log.*
