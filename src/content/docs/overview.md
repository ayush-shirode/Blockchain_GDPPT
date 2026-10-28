# System Overview

The **Digital Identity & E-Governance Portal** is an enterprise-grade demonstration prototype illustrating the application of Self-Sovereign Identity (SSI), W3C Verifiable Credentials (VCs), and distributed ledger technology to public-sector digital governance.

---

## What the System Is

1. **A Standards-Aligned Demonstration Prototype**: Implements W3C Verifiable Credentials Data Model v1.1 principles, Decentralized Identifiers (DIDs) using the `did:key` method, and VC-JWT packaging with Ed25519 cryptographic signatures.
2. **A Complete End-to-End Governance Lifecycle**: Covers the four core operational personas of digital identity:
   - **Citizen (Holder)**: Receives, inspects, and selectively discloses credential claims.
   - **Government Issuer**: Validates eligibility, signs VC-JWT tokens, records non-PII digests to the ledger, and manages revocations.
   - **Verifier (Relying Party)**: Formulates attribute requests, inspects cryptographic proofs, queries revocation registries, and renders binary pass/fail verification decisions.
   - **System Administrator / Auditor**: Monitors system uptime, inspects hash-chained ledger events, verifies cryptographic chain integrity, and manages governance policies.
3. **A Privacy-First Architecture**: Implements honest salted-hash selective disclosure (SD-JWT style) where holders only disclose requested attributes while preserving cryptographic proof of authenticity.
4. **An Auditable State Machine**: Demonstrates an append-only, SHA-256 hash-chained event ledger (`SimulatedLedger`) with verifiable cryptographic integrity checks (`verifyIntegrity()`).

---

## What the System Is Not

To maintain technical honesty and regulatory clarity, this system explicitly acknowledges its demonstration boundaries:

- **Not a Production Legal Identity System**: This prototype does not integrate with national registry databases (such as Aadhaar, eIDAS, or Social Security) and cannot be used for legal identification.
- **Not Zero-Knowledge Cryptography**: The selective disclosure mechanism uses salted cryptographic hashes (SD-JWT pattern) to redact attributes. It does not use zero-knowledge SNARKs, STARKs, or BBS+ signatures. It is never labeled "zero-knowledge."
- **Not a Production Blockchain Mainnet**: The default ledger engine is `SimulatedLedger`, an in-process, SHA-256 hash-chained append-only log backed by SQLite/PostgreSQL. A FabricLedger adapter stub is provided for future Hyperledger Fabric integration.
- **Not a Plaintext Data Store**: The distributed ledger never contains citizen names, addresses, identification numbers, plaintext claims, or private keys.
- **Not a Commercial Product**: No marketing claims, animations, decorative graphics, or speculative cryptocurrency tokens are included.

---

## Architectural Principles

The platform adheres to four non-negotiable architectural mandates:

### 1. Unidirectional Layer Isolation
The architecture strictly enforces five vertical layers:
```
Layer 5: User Interface (Citizen, Issuer, Verifier, Admin, Docs)
   ↓ (downward call only)
Layer 4: API Gateway (Auth, Session Cookies, Rate Limiting, Zod Validation)
   ↓ (downward call only)
Layer 3: Policy Layer (Verification Engine, Access Control, Audit Logger)
   ↓ (downward call only)
Layer 2: Identity Layer (DIDs, Key Management, VC-JWT, Selective Disclosure)
   ↓ (downward call only)
Layer 1: Blockchain Ledger (SimulatedLedger / FabricLedger Stub)
```
Presentation components never directly access cryptographic private keys or write to ledger storage.

### 2. Honest Verification Semantics
Verification is never a simple database lookup. Every verification request executes six distinct checks server-side:
1. Structural integrity
2. Cryptographic signature against the issuer's public key
3. Trust registry status of the issuer DID
4. Temporal expiration
5. On-chain revocation status
6. Disclosure consent validation

A failure in ledger connectivity fails safe to **Unable to verify**—it never defaults to **Valid**.

### 3. Accessible, Text-First Design
Following the strict visual guidelines of enterprise and public-sector design systems (GOV.UK Design System, IBM Carbon, Stripe Docs):
- High-contrast, typography-driven layout
- No decorative gradients, neon glows, glassmorphism, or floating shapes
- Visible focus rings, screen reader landmarks, skip links, and ARIA live regions
- Status indicated by explicit icon + text pairings, never colour alone
