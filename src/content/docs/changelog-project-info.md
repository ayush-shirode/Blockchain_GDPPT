# Project Information & Changelog

### Project Metadata
- **Project Name**: Digital Identity & E-Governance Portal
- **Current Version**: 2.0.0 (October 2026)
- **Specification Source**: `docs-source/REQUIREMENTS.md` (v2 Architecture Specification)
- **Classification**: Enterprise Demonstration Prototype (Academic / Public Sector)
- **License**: MIT Open Source License

---

## Architectural Changelog

### Version 2.0.0 (Current Release)
- **Core Architecture**:
  - Implemented the five-layer architectural model (`src/layers/`) with strict downward calling conventions.
  - Implemented `SimulatedLedger` with SHA-256 block hash chaining and on-demand integrity verification (`verifyIntegrity()`).
  - Added enterprise `FabricLedger` adapter stub throwing structured `NOT_CONFIGURED` exceptions.
- **Identity & Cryptography**:
  - Upgraded cryptographic engine to Ed25519 asymmetric signatures using `jose` (`EdDSA`).
  - Added deterministic `did:key` generation and parsing.
  - Implemented salted-hash selective disclosure (SD-JWT pattern) with explicit rejection of unconsented disclosures.
  - Added canonical Issuer Trust Registry resolving authorized DIDs.
- **Verification Engine**:
  - Implemented the six-step verification pipeline in strict order of precedence.
  - Implemented the outcome decision table supporting all five outcomes: **Valid**, **Invalid**, **Expired**, **Revoked**, and **Unable to verify**.
  - Added fault-injection simulation enabling testing of ledger outages.
- **User Interface & Documentation**:
  - Created portal modules for Citizen, Issuer, Verifier, and Admin with role-based routing.
  - Built comprehensive `/docs` Documentation Hub with client-side indexing, search, TOC navigation, and flat labelled SVG architecture diagrams.
  - Enforced strict enterprise design tokens: zero gradients, zero emoji, visible focus rings, and multi-sensory status indicators.
- **Testing & Security**:
  - Added unit test suite covering cryptography, selective disclosure, ledger hash chaining, and verification precedence.
  - Implemented HTTP-only SameSite session cookies, token bucket rate limiting, and server-side IDOR ownership checks.

---

### Version 1.0.0 (Concept & Specification)
- Initial conceptual architecture presentation and slide deck.
- Outlined five-layer identity framework for decentralized e-governance.
- Defined preliminary on-chain vs off-chain storage segregation rules.

---

## Technical Stack Summary

| Subsystem | Framework / Technology | Version |
|---|---|---|
| **Full-Stack Framework** | Next.js (App Router) | 15.1.7 |
| **Language** | TypeScript | 5.7.3 |
| **UI Components** | React 19, Radix UI Primitives, Lucide Icons | 19.0.0 |
| **CSS & Design System** | Tailwind CSS with CSS Variable Tokens | 3.4.17 |
| **Relational Storage** | Prisma ORM with SQLite (PostgreSQL compatible) | 6.4.1 |
| **Cryptography & JWT** | `jose` (Ed25519, EdDSA, VC-JWT) | 6.0.8 |
| **Input Validation** | Zod Schema Validation | 3.24.2 |
| **Test Runners** | Vitest, Playwright, Axe-Core Accessibility | 3.0.5 |
