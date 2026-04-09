# Plaid Access Control & Data Privacy Policy
## Tyeny LLC — PMF Capital Marketplace Application

**Document Version:** 1.0
**Effective Date:** April 9, 2026
**Prepared by:** Tyeny LLC
**Application Name:** PMF Capital Marketplace
**Application URL:** https://pmf-capital-marketplace-production.up.railway.app

---

## 1. Company Overview

**Company Name:** Tyeny LLC
**Application Name:** PMF Capital Marketplace (the "Application")
**Nature of Business:** Internal merchant cash advance (MCA) syndication and portfolio management platform for Premier Merchant Funding (PMF).

The Application enables approved internal employees ("Users") of PMF to participate in MCA deal syndication, track repayment performance, and request payouts from earned returns. Plaid is used exclusively to allow Users to link their personal bank accounts for the purpose of receiving payout disbursements.

---

## 2. Plaid Products Requested

| Product | Purpose | Justification |
|---------|---------|---------------|
| **Auth** | Retrieve account and routing numbers for ACH payout disbursements | Required to process approved payout transfers to Users' verified bank accounts |
| **Identity** | Verify account ownership (name matching) | Ensures the linked bank account belongs to the authenticated User, preventing misdirected payouts |

**Products NOT requested:** Transactions, Balance, Investments, Liabilities, Assets, Income, Employment, Transfer, Payment Initiation, Standing Orders, Signal.

---

## 3. Data Collection Scope

### 3.1 Data Collected via Plaid

| Data Element | Source Product | Stored? | Storage Location |
|-------------|---------------|---------|-----------------|
| Account holder name | Identity | No (used for verification only) | Not persisted |
| Account number | Auth | Yes (encrypted) | PostgreSQL — `bank_accounts` table |
| Routing number | Auth | Yes (encrypted) | PostgreSQL — `bank_accounts` table |
| Account mask (last 4 digits) | Auth | Yes (plaintext) | PostgreSQL — `bank_accounts` table |
| Account type (checking/savings) | Auth | Yes (plaintext) | PostgreSQL — `bank_accounts` table |
| Institution name | Auth | Yes (plaintext) | PostgreSQL — `bank_accounts` table |
| Plaid access_token | Plaid Link | Yes (encrypted) | PostgreSQL — `bank_accounts` table |
| Plaid account_id | Plaid Link | Yes (plaintext) | PostgreSQL — `bank_accounts` table |
| Plaid item_id | Plaid Link | Yes (plaintext) | PostgreSQL — `bank_accounts` table |

### 3.2 Data NOT Collected

- Transaction history
- Account balances
- Investment holdings
- Credit/loan information
- Income or employment data
- Social Security numbers
- Date of birth

---

## 4. Data Usage

### 4.1 Permitted Uses

All data obtained through Plaid is used exclusively for the following purposes:

1. **Bank account verification** — Confirming the User's linked account is valid and belongs to them before processing payout requests.
2. **Payout disbursement** — Using verified account and routing numbers to process approved ACH transfers of earned syndication returns.
3. **Account display** — Showing the User their linked account information (institution name, account type, last 4 digits) within the Application's settings page.

### 4.2 Prohibited Uses

Plaid data will NOT be used for:

- Marketing, advertising, or lead generation
- Creditworthiness assessment or underwriting
- Selling, renting, or sharing with third parties
- Profiling, scoring, or behavioral analysis
- Any purpose beyond payout processing and account verification

---

## 5. Data Storage & Encryption

### 5.1 Encryption at Rest

| Data Element | Encryption Method |
|-------------|-------------------|
| Plaid `access_token` | AES-256-GCM with application-level encryption key |
| Account number | AES-256-GCM with application-level encryption key |
| Routing number | AES-256-GCM with application-level encryption key |

The encryption key is stored as an environment variable (`ENCRYPTION_KEY`) on the hosting platform (Railway), never committed to source code or version control.

### 5.2 Encryption in Transit

All communication between the Application and Plaid's API occurs over TLS 1.2+. The Application is served exclusively over HTTPS.

### 5.3 Database Security

- **Hosting:** Railway managed PostgreSQL (encrypted at rest by the provider)
- **Access:** Database credentials are stored as environment variables, not in source code
- **Network:** Database is accessible only from the Application's Railway private network

---

## 6. Access Control

### 6.1 Application Roles

| Role | Can Link Bank Account | Can View Bank Data | Can Process Payouts |
|------|----------------------|-------------------|-------------------|
| Syndicate Rep | Yes (own account only) | Yes (own account only) | No (requests only) |
| Admin | No | No | Yes (approves payout requests) |
| Super Admin | No | No | Yes (approves payout requests) |

### 6.2 Plaid Credential Access

| Credential | Who Can Access |
|-----------|---------------|
| `PLAID_CLIENT_ID` | Application server only (environment variable) |
| `PLAID_SECRET` | Application server only (environment variable) |
| `ENCRYPTION_KEY` | Application server only (environment variable) |
| User `access_token` | Application server only (encrypted in database) |

No Plaid credentials or user access tokens are exposed to the frontend client. All Plaid API calls are made server-side via Next.js API routes.

### 6.3 Personnel Access

- Only authorized developers at Tyeny LLC have access to production environment variables.
- Production database access is restricted to the Railway project owner.
- No Plaid credentials are stored in source code, git history, or CI/CD logs.

---

## 7. Data Retention & Deletion

### 7.1 Retention Policy

| Data Element | Retention Period |
|-------------|-----------------|
| Plaid `access_token` | Until User unlinks the account or account is deactivated |
| Account/routing numbers | Until User unlinks the account or account is deactivated |
| Account display info (mask, type, institution) | Until User unlinks the account or account is deactivated |
| Plaid Link session data | Not stored beyond the token exchange |

### 7.2 Deletion Process

When a User unlinks a bank account:

1. The Application calls Plaid's `/item/remove` endpoint to revoke the access token on Plaid's side.
2. The corresponding `bank_accounts` record is soft-deleted (marked `isActive: false`) or hard-deleted.
3. Encrypted fields (access_token, account number, routing number) are overwritten with null values.
4. The deletion is logged in the audit trail.

When a User account is deactivated:

1. All linked bank accounts follow the same deletion process above.
2. The User's Plaid Items are removed.

### 7.3 User Data Requests

Users may request:
- A copy of all stored bank account data (display fields only; encrypted fields are not provided in plaintext)
- Deletion of all linked bank accounts
- These requests are handled by platform administrators within 30 days.

---

## 8. Incident Response

### 8.1 Breach Notification

In the event of a data breach involving Plaid-sourced data:

1. Plaid will be notified within 72 hours via security@plaid.com.
2. Affected Users will be notified within 72 hours.
3. Compromised access tokens will be revoked via Plaid's `/item/remove` endpoint.
4. The encryption key will be rotated and all stored tokens re-encrypted.

### 8.2 Logging & Monitoring

All Plaid-related actions are recorded in the Application's immutable audit log:

- Bank account linked (actor, timestamp, institution name)
- Bank account removed (actor, timestamp)
- Payout request created (actor, amount, target account)
- Payout approved/denied (actor, amount, reason)

---

## 9. Third-Party Sharing

Plaid-sourced data is **never shared** with any third party. The data flows exclusively:

```
User's Bank ←→ Plaid ←→ PMF Capital Marketplace (server-side only)
```

No data is sent to analytics services, advertising platforms, data brokers, or any entity other than Plaid itself.

---

## 10. Compliance

### 10.1 Regulatory Framework

- The Application is designed for internal use by employees of Premier Merchant Funding.
- The Application does not provide consumer financial services to the general public.
- Data handling follows Plaid's developer policy requirements.

### 10.2 Plaid Developer Policy Adherence

- End-user data is used only for the purposes described in this policy.
- Users provide explicit consent before linking their bank account via Plaid Link.
- Users can unlink their bank account at any time from the Application's settings page.
- Plaid's `access_token` is never exposed to the client or logged in plaintext.

---

## 11. Contact Information

**Data Protection Contact:**
- **Company:** Tyeny LLC
- **Email:** matt@tyeny.com
- **Application:** PMF Capital Marketplace
- **URL:** https://pmf-capital-marketplace-production.up.railway.app

---

*This document will be reviewed and updated at least annually or whenever material changes are made to the Application's data handling practices.*
