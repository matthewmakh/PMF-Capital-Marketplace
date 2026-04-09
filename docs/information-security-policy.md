# Information Security Policy & Procedures
## Tyeny LLC — PMF Capital Marketplace

**Document Version:** 1.0
**Effective Date:** April 9, 2026
**Last Reviewed:** April 9, 2026
**Next Scheduled Review:** October 9, 2026
**Policy Owner:** Matt Makharadze, Tyeny LLC
**Application:** PMF Capital Marketplace

---

## 1. Purpose

This policy establishes the information security framework for Tyeny LLC ("the Company") as it relates to the PMF Capital Marketplace application ("the Application"). It defines the practices, controls, and procedures used to identify, mitigate, and monitor information security risks relevant to the Company's operations.

This policy is reviewed on a semi-annual basis and updated as needed to reflect changes in the threat landscape, business operations, or regulatory requirements.

---

## 2. Scope

This policy applies to:

- All systems, infrastructure, and services that support the Application
- All data processed, stored, or transmitted by the Application
- All third-party services integrated with the Application
- All personnel with access to production systems, source code, or sensitive credentials

---

## 3. Security Governance

### 3.1 Ownership

The Policy Owner is responsible for:

- Maintaining and updating this policy
- Conducting periodic risk assessments
- Overseeing incident response
- Ensuring personnel are aware of their security obligations

### 3.2 Review Cadence

| Activity | Frequency |
|----------|-----------|
| Full policy review | Semi-annually |
| Risk assessment | Annually |
| Access control audit | Annually |
| Incident response procedure review | Annually |
| Third-party integration security review | As needed upon provider changes |

---

## 4. Risk Identification & Assessment

### 4.1 Risk Assessment Process

The Company conducts periodic risk assessments to identify threats relevant to its operations. The assessment considers:

- **Application security** — vulnerabilities in the codebase, dependencies, and infrastructure
- **Data security** — risks to the confidentiality, integrity, and availability of stored data
- **Access control** — risks from unauthorized access, credential exposure, or privilege escalation
- **Third-party risk** — security posture of integrated service providers
- **Operational risk** — risks from human error, process gaps, or inadequate monitoring

### 4.2 Risk Register

Identified risks are documented in an internal risk register that includes:

- Description of the risk
- Likelihood and impact assessment
- Current mitigation controls
- Residual risk level
- Owner and review date

The risk register is reviewed and updated as part of the semi-annual policy review cycle.

---

## 5. Security Controls

### 5.1 Authentication & Access Control

| Control | Implementation |
|---------|---------------|
| User authentication | Credential-based authentication with bcrypt password hashing (12 salt rounds) |
| Session management | JWT-based sessions with defined expiry (24 hours) |
| Role-based access control | Users are assigned roles that govern access to features, data, and administrative functions |
| Route-level protection | Server-side middleware validates authentication and role authorization on every request |
| Administrative access | Administrative functions are restricted to authorized roles and enforced at both the UI and API layer |

### 5.2 Data Protection

| Control | Implementation |
|---------|---------------|
| Encryption at rest | Sensitive data (third-party tokens, financial credentials) encrypted with AES-256-GCM |
| Encryption in transit | All traffic served over HTTPS; all third-party API calls over TLS 1.2+ |
| Key management | Encryption keys stored as environment variables on the hosting platform, never in source code or version control |
| Database security | Managed PostgreSQL with provider-level encryption at rest; accessible only via private network |
| Password storage | Passwords hashed with bcrypt; plaintext passwords never stored or logged |

### 5.3 Application Security

| Control | Implementation |
|---------|---------------|
| Input validation | All API inputs validated with schema-based validation (Zod) before processing |
| SQL injection prevention | Parameterized queries via ORM (Prisma); no raw SQL |
| Server-side enforcement | All sensitive operations (payments, syndications, payouts, status changes) processed server-side with authorization checks |
| Dependency management | Dependencies tracked via lockfile; updated periodically to address known vulnerabilities |
| Build-time type checking | TypeScript strict mode enforced across the entire codebase |

### 5.4 Financial Data Integrity

| Control | Implementation |
|---------|---------------|
| Immutable ledger | Financial records (payments, distributions) are append-only; corrections made via reversal entries |
| Transactional operations | All multi-step financial operations (payment posting, distribution, balance updates) wrapped in database transactions |
| Decimal precision | All monetary calculations use arbitrary-precision decimal arithmetic; native floating-point is never used for money |
| Reconciliation | Built-in reconciliation checks verify that running totals match the sum of underlying immutable records |
| Idempotency | Sensitive write operations support idempotency keys to prevent duplicate processing |

### 5.5 Audit Trail

| Control | Implementation |
|---------|---------------|
| Immutable audit log | All state-changing operations create an append-only audit record |
| Log content | Each entry captures: actor, action type, affected resource, timestamp, and contextual metadata including before/after values |
| Access restriction | Audit logs are viewable by authorized administrative roles; no user can modify or delete log entries |
| Retention | Audit logs retained for 7 years in accordance with the Data Deletion & Retention Policy |

---

## 6. Infrastructure Security

### 6.1 Hosting Environment

- The Application is deployed on a managed cloud platform with built-in container isolation
- The database is hosted on a managed service with encryption at rest and automated backups
- Infrastructure configuration is defined in version-controlled files (Dockerfile, environment configuration)

### 6.2 Environment Separation

- Production credentials (database URLs, API keys, encryption keys) are stored as platform-managed environment variables
- Credentials are never committed to source code, version control history, or build logs
- Development and production environments use separate credentials and databases

### 6.3 Network Security

- The Application is accessible only over HTTPS
- The database is accessible only from the Application's private network; no public endpoint is exposed
- Third-party API communication is restricted to TLS-encrypted channels

---

## 7. Third-Party Risk Management

### 7.1 Provider Assessment

Third-party services integrated with the Application are evaluated for:

- Security certifications and compliance posture
- Data handling and privacy policies
- Incident notification commitments
- API security standards (TLS, token management, webhook verification)

### 7.2 Ongoing Monitoring

- Third-party provider security advisories and policy updates are monitored
- Integration configurations are reviewed when provider policies change
- Access tokens and credentials associated with third-party services are rotatable and revocable

---

## 8. Incident Response

### 8.1 Incident Classification

| Severity | Definition | Response Time |
|----------|-----------|---------------|
| Critical | Confirmed data breach, credential exposure, or unauthorized access to sensitive data | Immediate response; notifications within 72 hours |
| High | Suspected breach, vulnerable dependency with known exploit, or unauthorized access attempt | Response within 24 hours |
| Medium | Security misconfiguration, failed access control, or anomalous audit log activity | Response within 72 hours |
| Low | Informational findings, minor policy deviations | Addressed in next review cycle |

### 8.2 Incident Response Procedure

1. **Detection** — Incident identified through audit log review, monitoring alerts, user report, or third-party notification.
2. **Containment** — Immediate actions to limit impact: revoke compromised credentials, disable affected accounts, isolate affected systems.
3. **Assessment** — Determine scope, affected data, root cause, and blast radius.
4. **Notification** — Notify affected third-party providers within 72 hours. Notify affected users within 72 hours. Document notification in the audit log.
5. **Remediation** — Rotate compromised credentials, patch vulnerabilities, update access controls, re-encrypt data if encryption keys were compromised.
6. **Post-incident review** — Document the incident, root cause, timeline, and remediation steps. Update the risk register and relevant policies.

### 8.3 Credential Compromise Response

In the event of suspected credential or key compromise:

1. Affected credentials are rotated immediately
2. Third-party access tokens are revoked via the provider's API
3. The encryption key is rotated and all stored encrypted data is re-encrypted
4. Audit logs are reviewed to assess the scope of any unauthorized access
5. Affected users are notified

---

## 9. Personnel Security

### 9.1 Access Provisioning

- Production system access is granted on a need-to-know basis
- Access is reviewed as part of the annual access control audit
- Access is revoked immediately upon personnel departure or role change

### 9.2 Security Awareness

- All personnel with production access are informed of this policy and their responsibilities
- Personnel are expected to report suspected security incidents promptly
- Policy violations are grounds for immediate revocation of system access

---

## 10. Business Continuity

### 10.1 Data Backup

- The database is hosted on a managed service with automated daily backups
- Backup retention follows the hosting provider's standard policy
- Application source code is version-controlled in a remote Git repository

### 10.2 Recovery

- The Application can be redeployed from source code and the database backup
- Database schema migrations are defined in version-controlled migration files
- Recovery procedures are tested as part of the annual risk assessment

---

## 11. Policy Compliance

### 11.1 Monitoring

Compliance with this policy is monitored through:

- Audit log review (ongoing)
- Access control audits (annual)
- Risk assessment findings (annual)
- Incident post-mortems (as needed)

### 11.2 Non-Compliance

Identified non-compliance is documented, assessed for risk impact, and remediated. Repeated or willful non-compliance by personnel is grounds for access revocation and disciplinary action.

---

## 12. Review Log

| Date | Reviewer | Summary |
|------|----------|---------|
| April 9, 2026 | Matt Makharadze | Initial policy creation |

---

## 13. Contact

**Policy Owner:** Matt Makharadze
**Company:** Tyeny LLC
**Email:** matt@tyeny.com

---

*This policy is reviewed and updated on a semi-annual basis, or as needed when material changes occur. All revisions are recorded in the Review Log.*
