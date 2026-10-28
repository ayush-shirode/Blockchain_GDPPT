# Demo Accounts & Test Data

The prototype is pre-seeded with synthetic citizen personas, authorized government authorities, verifiers, an auditor administrator, and pre-generated credentials.

> **Demonstration System Notice**: All names, email addresses, phone numbers, and identifiers are purely synthetic test fixtures. No real personal records exist in this database.

---

## Seeded Persona Directory

All demo accounts share the standard evaluation password:  
`DemoPassword123!`

| Role | Organization / Persona | Email Address | Identifier / Scope |
|---|---|---|---|
| **Citizen** | Asha Patil | `asha.patil@example.gov` | Primary holder with active, expired, and revoked credentials |
| **Citizen** | Rohan Deshmukh | `rohan.deshmukh@example.gov` | Secondary holder for multi-party testing |
| **Issuer** | Municipal Corporation | `issuer.muni@example.gov` | **Trusted** issuer of Identity & Address credentials |
| **Issuer** | State Technical University | `issuer.univ@example.gov` | **Trusted** issuer of Academic Degrees |
| **Issuer** | Age Verification Bureau | `issuer.age@example.gov` | **Trusted** issuer of Age & Eligibility proofs |
| **Issuer** | Rogue ID Provider | `issuer.rogue@example.gov` | **Untrusted** issuer (Not in Trust Registry) |
| **Verifier** | City General Hospital | `verifier.hospital@example.gov` | Healthcare relying party |
| **Verifier** | Metro Commercial Bank | `verifier.bank@example.gov` | Financial KYC relying party |
| **Admin** | System Auditor & Admin | `admin.auditor@example.gov` | Administrative, Ledger, and Audit control |

---

## Pre-Seeded Credential Samples

The seed database (`npm run seed`) populates four sample credentials under **Asha Patil** to evaluate every lifecycle phase:

1. **Active Identity Credential**:
   - Type: `IdentityCredential`
   - Issuer: Municipal Corporation (`did:key:z6Mku...`)
   - Status: `VALID`
   - Validity: Active for 2 years from generation.
2. **Expired Student Degree**:
   - Type: `StudentCredential`
   - Issuer: State Technical University
   - Status: `EXPIRED`
   - Validity: Expired 30 days prior to database seed timestamp.
3. **Revoked Residential Address**:
   - Type: `AddressCredential`
   - Issuer: Municipal Corporation
   - Status: `REVOKED`
   - On-Chain Record: `CREDENTIAL_REVOKED` block committed with reason `DOCUMENT_SUPERSEDED`.
4. **Untrusted Issuer Credential**:
   - Type: `IdentityCredential`
   - Issuer: Rogue ID Provider (`issuer-rogue@untrusted.demo`)
   - Status: `INVALID` (Issuer DID is excluded from the governance trust registry).

---

## How to Trigger Each of the Five Verification Outcomes

You can test all five outcomes using the **Verifier Portal** (`/verifier/verify`).

### 1. Trigger Outcome: VALID
1. Navigate to `/verifier/verify`.
2. Under **Demo Presets**, click **Load Valid Identity Credential**.
3. Click **Execute Verification**.
4. **Result**: Outcome badge shows **Valid** with green checkmarks across all six checks.

### 2. Trigger Outcome: INVALID
1. Under **Demo Presets**, click **Load Tampered Signature** (or **Untrusted Issuer**).
2. Click **Execute Verification**.
3. **Result**: Outcome badge shows **Invalid**. The check table shows Check 2 failed (`BAD_SIGNATURE`) or Check 3 failed (`UNTRUSTED_ISSUER`).

### 3. Trigger Outcome: EXPIRED
1. Under **Demo Presets**, click **Load Expired Student Credential**.
2. Click **Execute Verification**.
3. **Result**: Outcome badge shows **Expired**. Check 1-3 pass, but Check 4 fails (`EXPIRED`).

### 4. Trigger Outcome: REVOKED
1. Under **Demo Presets**, click **Load Revoked Address Credential**.
2. Click **Execute Verification**.
3. **Result**: Outcome badge shows **Revoked**. Check 1-4 pass, but Check 5 reports the on-chain revocation event (`REVOKED`).

### 5. Trigger Outcome: UNABLE TO VERIFY
1. Sign in as Admin (`admin@portal.gov.demo`) and navigate to `/admin/health`.
2. Click **Simulate Ledger Outage** (or enable the outage toggle).
3. Return to `/verifier/verify` and attempt to verify any active credential.
4. **Result**: Outcome badge shows **Unable to verify** with reason code `LEDGER_UNAVAILABLE`. The system fails safe and refuses to report an unconfirmed credential as valid.
