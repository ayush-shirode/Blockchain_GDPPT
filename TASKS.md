# TASKS: Digital Identity & E-Governance Portal

This checklist tracks implementation progress and verification against functional requirements (FR-01 to FR-19) from `docs-source/REQUIREMENTS.md` and the Section 13 test list.

---

## 1. Functional Requirements Coverage

| ID | Requirement | Priority | Status | Verification Notes |
|---|---|---|---|---|
| **FR-01** | Separate citizen, issuer, verifier and admin workflows | Must | [x] Completed | Role-based navigation, distinct `/citizen`, `/issuer`, `/verifier`, `/admin` views |
| **FR-02** | Sign-in with role assignment; role-aware navigation | Must | [x] Completed | HTTP-only SameSite=Strict session cookie & server-side role guard middleware |
| **FR-03** | Issue credential after validation, review and confirmation | Must | [x] Completed | Multi-step wizard (`/issuer/issue`), review modal, Ed25519 signature & receipt |
| **FR-04** | Citizens view credentials and status | Must | [x] Completed | Wallet view (`/citizen/credentials`), detail modal, active/revoked/expired badges |
| **FR-05** | Citizens approve or decline sharing requests; decline shares nothing | Must | [x] Completed | Consent modal with attribute checkboxes (`/citizen/share`); decline transmits zero data |
| **FR-06** | Verifier validates signature, issuer trust, expiry and status | Must | [x] Completed | Server-side 6-step verification pipeline in strict order of precedence |
| **FR-07** | Authorised issuers revoke credentials with reason | Must | [x] Completed | Revocation dialog (`/issuer/revocations`), append-only ledger record & audit log |
| **FR-08** | Outcomes distinguish Valid, Invalid, Expired, Revoked, Unable to verify | Must | [x] Completed | Decision table implementation (spec 5.2) with icon + text status indicators |
| **FR-09** | Security-sensitive actions create audit events | Must | [x] Completed | Login, issuance, revocation, verification, and outage toggles logged with correlation IDs |
| **FR-10** | Ledger view contains no personal data | Must | [x] Completed | Only hashes, issuer DIDs, timestamps, and txRefs displayed in `/admin/ledger` |
| **FR-11** | Simulated components are labelled honestly | Must | [x] Completed | Persistent "Simulated Ledger" and "Demonstration system. Synthetic data only." banners |
| **FR-12** | Loading, empty, success, error and permission-denied states everywhere | Must | [x] Completed | Implemented across all views, forms, and data tables |
| **FR-13** | Search, filter, sort, pagination on all lists | Should | [x] Completed | Reusable `DataTable` component supporting client-side search, sort, and pagination |
| **FR-14** | Receipts for issuance, revocation, sharing and verification | Should | [x] Completed | Reusable `Receipt` component with print styles (`@media print`) and copy buttons |
| **FR-15** | Documentation hub with search (spec 2.1) | Must | [x] Completed | 12 Markdown pages rendered in `/docs/*` with client-side ⌘K search and TOC |
| **FR-16** | Privacy and demo-data notice page | Should | [x] Completed | Public `/privacy-security` page detailing data minimization and GDPR compliance |
| **FR-17** | Ledger chain-integrity check | Should | [x] Completed | `verifyIntegrity()` button on `/admin/ledger` re-hashing blocks from Genesis to Head |
| **FR-18** | Integration health page | Could | [x] Completed | Admin `/admin/health` matrix monitoring API, Database, Ledger, and Signing engine |
| **FR-19** | Print-friendly receipt and credential views | Could | [x] Completed | CSS `@media print` rules hiding navigation and printing clean verification receipts |

---

## 2. Section 13 Test Acceptance Criteria

| Test Description | Category | Status | Verified In |
|---|---|---|---|
| Citizen cannot issue credentials (role guard) | Security / RBAC | [x] Passed | `tests/unit/access-control.test.ts` & API 403 test |
| Citizen cannot revoke credentials (role guard) | Security / RBAC | [x] Passed | `tests/unit/access-control.test.ts` & API 403 test |
| Verifier cannot access issuer-only routes | Security / RBAC | [x] Passed | `tests/unit/access-control.test.ts` & API 403 test |
| Citizen cannot view another citizen's credentials (IDOR check) | Security / IDOR | [x] Passed | `tests/unit/access-control.test.ts` (`assertOwnership`) |
| Malformed credential rejected as `Invalid` (`MALFORMED`) | Verification Engine | [x] Passed | `tests/unit/verification-engine.test.ts` & `/verifier/verify` |
| Tampered signature rejected as `Invalid` (`BAD_SIGNATURE`) | Verification Engine | [x] Passed | `tests/unit/verification-engine.test.ts` & `/verifier/verify` |
| Untrusted issuer rejected as `Invalid` (`UNTRUSTED_ISSUER`) | Verification Engine | [x] Passed | `tests/unit/verification-engine.test.ts` & `/verifier/verify` |
| Expired credential detected as `Expired` (`EXPIRED`) | Verification Engine | [x] Passed | `tests/unit/verification-engine.test.ts` & `/verifier/verify` |
| Revoked credential detected as `Revoked` (`REVOKED`) | Verification Engine | [x] Passed | `tests/unit/verification-engine.test.ts` & `/verifier/verify` |
| Ledger outage simulation yields `Unable to verify` (`LEDGER_UNAVAILABLE`) | Verification Engine | [x] Passed | `tests/unit/verification-engine.test.ts` & `/admin/health` toggle |
| Ledger failure NEVER yields `Valid` | Verification Engine | [x] Passed | `tests/unit/verification-engine.test.ts` |
| Declined consent request shares nothing | Privacy / Consent | [x] Passed | `tests/unit/privacy-integrity.test.ts` & `/citizen/share` |
| Disclosed attributes are strictly a subset of consented attributes | Privacy / SD-JWT | [x] Passed | `tests/unit/selective-disclosure.test.ts` |
| No personal identity data in ledger events | Privacy / Ledger | [x] Passed | `tests/unit/privacy-integrity.test.ts` (Zero-PII test) |
| No personal data in application audit logs | Privacy / Audit | [x] Passed | `tests/unit/privacy-integrity.test.ts` |
| Ledger chain tampering is detected by `verifyIntegrity()` | Ledger Integrity | [x] Passed | `tests/unit/simulated-ledger.test.ts` & `privacy-integrity.test.ts` |
| Forms reject malformed or incomplete input | Validation | [x] Passed | `tests/unit/privacy-integrity.test.ts` (Zod validation test) |
| All 5 verification outcomes demonstrated | E2E Acceptance | [x] Passed | Verified via `/verifier/verify` presets & test suite |
| Full typecheck passing without errors | Build Quality | [x] Passed | `npm run typecheck` (0 errors) |
| ESLint passing without warnings or errors | Code Quality | [x] Passed | `npm run lint` (0 errors, 0 warnings) |
| Optimized production bundle build | Release | [x] Passed | `npm run build` (58/58 routes generated) |

---

## 3. Four-Phase Build Progress

- [x] **Phase 1: Product Foundation**
  - [x] Project scaffolding & dependencies (`package.json`, `tsconfig.json`, `next.config.ts`)
  - [x] Tailwind design tokens (`spec 7.2`) & CSS variables in `globals.css`
  - [x] Reusable accessible component library (`spec 7.4`): `AppShell`, `Sidebar`, `TopBar`, `Breadcrumbs`, `PageHeader`, `Callout`, `DataTable`, `StatusBadge`, `Banner`, `Toast`, `EmptyState`, `Skeleton`, `Receipt`
  - [x] Prisma schema & SQLite database migrations (`prisma/schema.prisma`, `dev.db`)
  - [x] Seed script: synthetic users, issuers, credentials & Ed25519 demo keys (`prisma/seed.ts`)
  - [x] Authentication, session cookies, and role guards (`auth-session.ts`, `access-control.ts`)
  - [x] Documentation layout & client-side search component
  - [x] *Verification: 16/16 unit tests passing, dev server running, 0 lint errors*

- [x] **Phase 2: Core Workflows**
  - [x] Citizen wallet: overview (`/citizen`), credential list (`/citizen/credentials`), detail modal (`/citizen/credentials/[id]`), account & recovery (`/citizen/account`)
  - [x] Citizen consent & selective disclosure flow (`/citizen/share`, `/citizen/history`)
  - [x] Issuer console: dashboard (`/issuer`), citizen subject selector & wizard (`/issuer/issue`), issued list (`/issuer/credentials`), history (`/issuer/history`)
  - [x] Verifier portal: request creator (`/verifier/requests`), proof verification console (`/verifier/verify`), history (`/verifier/history`)
  - [x] Credential lifecycle & status transitions (Active -> Revoked / Expired)
  - [x] *Verification: tested API route handlers & page views in dev server*

- [x] **Phase 3: Security & Ledger**
  - [x] Cryptographic signing (VC-JWT with Ed25519 / `jose` / `EdDSA`)
  - [x] Salted-hash selective disclosure engine (`selective-disclosure.ts`)
  - [x] Issuer Trust Registry resolution (`trust-registry.ts`)
  - [x] `SimulatedLedger` (SHA-256 hash chaining) with `verifyIntegrity()` (`simulated-ledger.ts`)
  - [x] `FabricLedger` documented enterprise stub throwing `NOT_CONFIGURED` (`fabric-stub.ts`)
  - [x] Credential revocation with reason code & ledger block commit
  - [x] Verification decision table (spec 5.2) with strict precedence pipeline
  - [x] Outage simulator fault injection toggle (`/api/admin/ledger/simulate-outage`, `/admin/health`)
  - [x] Structured audit logging with correlation IDs and CSV export (`/admin/audit`)
  - [x] *Verification: 21/21 unit tests passing, fault injection verified*

- [x] **Phase 4: Docs & Quality**
  - [x] Documentation Hub: All 11 MDX pages (spec 2.1) + demo script in `src/content/docs/`
  - [x] Flat labelled SVG architecture diagram React component (`ArchitectureSvg.tsx`)
  - [x] Client-side documentation search dialog (⌘K) & On-this-page TOC (`DocsToc.tsx`)
  - [x] Public landing pages: Home (`/`), How It Works (`/how-it-works`), Privacy & Security (`/privacy-security`), Sign In (`/sign-in`)
  - [x] Verification of all 5 verification outcomes demonstrated in presets & test suite
  - [x] Scripted walkthrough in `/docs/demo-script` & comprehensive `README.md`
  - [x] Complete build and typecheck verification: `npm run build` (58/58 routes compiled), `npm run typecheck` (0 errors), `npm run lint` (0 warnings)
