# Five-Layer Architecture

The Digital Identity & E-Governance Portal is architected around a strict **Five-Layer Model**. Each layer has distinct responsibilities, and control flow is strictly unidirectional: layers may call downward only. Presentation components in Layer 5 can never touch private keys or communicate directly with the distributed ledger.

---

## Architectural Diagram

The diagram below outlines the five operational layers and the boundary controls between them:

<!-- ARCHITECTURE_SVG_COMPONENT -->

---

## Detailed Layer Breakdown

### Layer 5: User Interface
- **Folder**: `src/app/`, `src/components/`
- **Technology**: Next.js 15 (App Router), React 19, Tailwind CSS (using CSS variable tokens).
- **Sub-Modules**:
  - **Citizen Wallet** (`/citizen`): Credential viewer, proof generator with attribute checkboxes, sharing receipts, history.
  - **Issuer Console** (`/issuer`): Citizen search, schema selection, issuance forms, review/confirm modal, revocation console.
  - **Verifier Portal** (`/verifier`): Verification request generator, presentation submission, decision renderer with per-check status.
  - **Administrative Console** (`/admin`): Hash-chain ledger explorer, integrity checker (`verifyIntegrity()`), fault injection outage toggle, audit logs, health matrix.
  - **Documentation Hub** (`/docs`): Public documentation site with client-side index search and interactive API references.

---

### Layer 4: API Gateway & Transport
- **Folder**: `src/layers/api/`, `src/app/api/`
- **Responsibilities**:
  - **HTTP-Only Session Management**: SameSite Strict, secure HTTP-only cookies containing signed session tokens.
  - **Role-Based Authorization & IDOR Checks**: Enforces server-side checks on every request. Citizens can only access their own records; issuers can only sign for their registered DID.
  - **Input Validation**: Strict schema enforcement using Zod schemas (`src/layers/api/validation/schemas.ts`).
  - **Rate Limiting**: In-memory token bucket rate limiting on sensitive routes (`/api/auth/sign-in`, `/api/verifier/verify`).
  - **Error Normalization**: Standardized JSON error response envelope (`{ ok: false, error: { code, message, correlationId } }`).

---

### Layer 3: Smart Contract & Policy Layer
- **Folder**: `src/layers/policy/`
- **Responsibilities**:
  - **Verification Engine** (`verification-engine.ts`): Implements the six-step verification pipeline in strict order.
  - **Access Control Policies** (`access-control.ts`): Pure functions validating caller permissions and ownership.
  - **Audit Logger** (`audit-logger.ts`): Emits structured audit events recording actor IDs, actions, and target references without personal data.

---

### Layer 2: Identity & Cryptography Layer
- **Folder**: `src/layers/identity/`
- **Responsibilities**:
  - **Decentralized Identifiers** (`did.ts`): Generates and parses W3C-compliant `did:key` strings using Ed25519 multicodec prefixes.
  - **Cryptographic Key Management** (`key-manager.ts`): Manages Ed25519 asymmetric key pairs. Private keys are stored in a git-ignored keystore (`.keys/`) and never exposed in API responses or UI.
  - **Verifiable Credential Packaging** (`vc-jwt.ts`): Issues and parses W3C VC-JWT payloads using the `jose` library with `EdDSA`.
  - **Selective Disclosure Engine** (`selective-disclosure.ts`): Computes salted SHA-256 digests per claim (SD-JWT pattern) and verifies presentation disclosure proofs.
  - **Trust Registry** (`trust-registry.ts`): Resolves issuer public keys and active status from the governance registry table.

---

### Layer 1: Distributed Ledger Layer
- **Folder**: `src/layers/ledger/`
- **Responsibilities**:
  - **LedgerAdapter Interface** (`types.ts`): Canonical interface declaring `appendEvent()`, `getEvent()`, `getEvents()`, `getRevocation()`, `verifyIntegrity()`, and `health()`.
  - **SimulatedLedger** (`simulated-ledger.ts`): In-process SHA-256 hash-chained append-only event log backed by SQLite. Recomputes block hashes on demand to detect unauthorized tampering.
  - **FabricLedger Stub** (`fabric-stub.ts`): Documented enterprise adapter stub that throws a structured `NOT_CONFIGURED` exception when instantiated without Hyperledger Fabric credentials.
