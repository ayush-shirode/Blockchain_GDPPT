# Digital Identity & E-Governance Portal
> **Enterprise Demonstration Prototype** for Decentralized Identity (DID), W3C Verifiable Credentials (VC-JWT), and Privacy-Preserving Distributed Ledger Integration.

---

## 1. Quick Start

Ensure **Node.js 18+** is installed on your system.

```bash
# 1. Install dependencies
npm install

# 2. Push database schema and seed synthetic data
npm run seed

# 3. Start development server
npm run dev
```

Open your browser to:
**`http://localhost:3000`**

---

## 2. Demo Accounts

All seeded demo accounts use the standard evaluation password:  
**`DemoPassword123!`**

| Role | Persona / Organization | Email Address | Description |
|---|---|---|---|
| **Citizen** | Asha Patil | `asha.patil@example.gov` | Primary holder with Active, Expired, and Revoked credentials |
| **Citizen** | Rohan Deshmukh | `rohan.deshmukh@example.gov` | Secondary citizen for multi-party issuance testing |
| **Issuer** | Municipal Corporation | `issuer.muni@example.gov` | **Trusted Authority** (Issues Identity and Address credentials) |
| **Issuer** | State Technical University | `issuer.univ@example.gov` | **Trusted Authority** (Issues Academic Degree credentials) |
| **Issuer** | Age Verification Bureau | `issuer.age@example.gov` | **Trusted Authority** (Issues Age/Eligibility proofs) |
| **Issuer** | Rogue ID Provider | `issuer.rogue@example.gov` | **Untrusted Authority** (Not in Trust Registry) |
| **Verifier** | City General Hospital | `verifier.hospital@example.gov` | Healthcare relying party |
| **Verifier** | Metro Commercial Bank | `verifier.bank@example.gov` | Financial KYC relying party |
| **Admin** | System Auditor & Admin | `admin.auditor@example.gov` | Administrative console, ledger explorer, and health matrix |

> **Quick Sign-In**: Navigate to `/sign-in` and click any one-click persona button to automatically populate credentials and sign in.

---

## 3. Five-Layer Architecture

The application strictly implements the five-layer architectural model with **unidirectional downward control flow**:

```
[ Layer 5: User Interface ]
  • Citizen Wallet (/citizen), Issuer Console (/issuer), Verifier Portal (/verifier)
  • Admin & Ledger Explorer (/admin), Documentation Hub (/docs)
  │
  ▼ (Downward only)
[ Layer 4: API Gateway ]
  • Next.js App Router route handlers with HTTP-only SameSite=Strict cookies
  • Token-bucket rate limiting, Zod schema validation, and standardized error envelopes
  │
  ▼ (Downward only)
[ Layer 3: Smart Contract & Policy Layer ]
  • Six-step verification pipeline, role-based authorization (RBAC), and IDOR checks
  • Zero-PII structured audit logger
  │
  ▼ (Downward only)
[ Layer 2: Identity Layer ]
  • W3C did:key generation, Ed25519 asymmetric cryptography (jose / EdDSA)
  • Salted-hash selective disclosure (SD-JWT pattern) and Trust Registry resolution
  │
  ▼ (Downward only)
[ Layer 1: Blockchain Ledger ]
  • LedgerAdapter interface with SimulatedLedger (SHA-256 hash chaining)
  • FabricLedger enterprise stub (throws NOT_CONFIGURED)
```

UI components never access cryptographic private keys or communicate directly with the distributed ledger.

---

## 4. Ledger Mode: Simulated Ledger & Zero PII

The default blockchain engine is **`SimulatedLedger`**:
- **Append-Only Hash Chaining**: Every event block incorporates the SHA-256 digest of the previous block ($H_n = \text{SHA-256}(H_{n-1} \parallel \text{data})$).
- **Integrity Recomputation**: Calling `ledger.verifyIntegrity()` (via `/admin/ledger` or the API) recalculates hashes from Genesis to Head to detect any tampering with relational records.
- **Strict Zero-PII Boundary**: In compliance with **GDPR Article 17 (Right to Erasure)**, no names, email addresses, phone numbers, or plaintext claims are ever written to the ledger. Only one-way salted hashes ($\text{SHA-256}(\text{nonce} \parallel \text{VC})$) and revocation status codes are stored on-chain.
- **Enterprise Fabric Stub**: `FabricLedger` provides an interface-compatible adapter that documents Hyperledger Fabric integration and throws an explicit `NOT_CONFIGURED` exception.

---

## 5. Security Model & Design Rules

- **Design Aesthetic**: Built according to **GOV.UK**, **IBM Carbon**, and **Stripe Docs** design principles. Flat, text-first, high contrast, WCAG 2.2 AA accessible. No decorative gradients, neon glows, glassmorphism, floating shapes, or emoji.
- **Honest Selective Disclosure**: Attributes are redacted using **salted cryptographic hashes (SD-JWT pattern)**. The system is technically honest and never labeled "zero-knowledge."
- **Fail-Safe Verification**: Network partitions or ledger outages fail safe to **Unable to verify**—the system never defaults to "Valid."

---

## 6. How to Demo Each of the Five Verification Outcomes

Navigate to the **Verifier Portal** (`/verifier/verify`):

### Outcome 1: VALID
1. Under **Demo Presets**, click **Load Valid Identity Credential**.
2. Click **Execute Verification**.
3. **Outcome**: Renders green **VALID** badge. All six checks pass (Structure, Signature, Trust, Expiry, Revocation, Disclosure).

### Outcome 2: INVALID
1. Under **Demo Presets**, click **Load Tampered Signature** (or **Untrusted Issuer**).
2. Click **Execute Verification**.
3. **Outcome**: Renders red **INVALID** badge with failure code `BAD_SIGNATURE` or `UNTRUSTED_ISSUER`.

### Outcome 3: EXPIRED
1. Under **Demo Presets**, click **Load Expired Student Credential**.
2. Click **Execute Verification**.
3. **Outcome**: Renders amber **EXPIRED** badge with failure code `EXPIRED`.

### Outcome 4: REVOKED
1. Under **Demo Presets**, click **Load Revoked Address Credential**.
2. Click **Execute Verification**.
3. **Outcome**: Renders red **REVOKED** badge with reason `DOCUMENT_SUPERSEDED`.

### Outcome 5: UNABLE TO VERIFY (Fault Injection)
1. Sign in as Admin (`admin.auditor@example.gov`) and go to `/admin/health`.
2. Click **Simulate Ledger Outage** (toggle state to ON).
3. Return to `/verifier/verify` and verify the valid credential.
4. **Outcome**: Renders gray **UNABLE TO VERIFY** badge with reason code `LEDGER_UNAVAILABLE`.
5. Return to `/admin/health` and restore connectivity.

---

## 7. Documentation Hub

The public documentation hub is available at **`/docs`**:
- `/docs/overview`: Scope, goals, and boundaries.
- `/docs/concepts`: Self-Sovereign Identity, DIDs, VCs, and SD-JWT.
- `/docs/on-chain-vs-off-chain`: Privacy comparison matrix.
- `/docs/architecture`: Five-layer model with flat, labelled SVG diagram component.
- `/docs/guides`: Step-by-step issuance, sharing, verification, and revocation workflows.
- `/docs/verification-outcomes`: The six checks and strict precedence decision table.
- `/docs/security-limitations`: Threat model, key management, and GDPR tensions.
- `/docs/api-reference`: REST route specifications with interactive `<ApiEndpoint />` widgets.
- `/docs/demo-accounts`: Directory of synthetic personas and credentials.
- `/docs/glossary`: Standardized definitions.
- `/docs/changelog-project-info`: Project attribution and version history.
- `/docs/demo-script`: Complete 10-minute presentation walkthrough script.

---

## 8. Verification & Test Commands

```bash
# Run unit tests across all five layers
npm run test

# Run TypeScript type check
npm run typecheck

# Run ESLint validation
npm run lint

# Build production bundle
npm run build
```
