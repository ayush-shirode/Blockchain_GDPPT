# Blockchain for Digital Identity & E-Governance
## Web Application Requirements and Documentation-Style UI Specification (v2)

**Purpose:** Define scope, functional requirements, architecture and visual direction for a credible, professional demonstration web application based on the project *Blockchain for Digital Identity & E-Governance*.

**Product principle:** Build a calm, trustworthy, documentation-grade government service portal. Clarity, accessibility, privacy and task completion come before visual effects.

**Reference style:** GOV.UK / IBM Carbon / Stripe Docs. Plain, dense-but-readable, text-first, predictable.

---

## 1. Product vision

A web application that demonstrates how a citizen receives a digitally signed credential, keeps it in a wallet, selectively shares a proof with a service provider, and has that proof verified against issuer trust and credential status.

Roles (matches the architecture diagram):

1. **Issuer**: government department, university or authorised agency. Verifies a person, issues and revokes credentials.
2. **Holder (citizen)**: stores credentials in a wallet and decides when to share.
3. **Verifier**: government service, hospital or bank. Requests and verifies proofs.
4. **Administrator / Auditor**: monitors health, users and audit trail.

The ledger holds verification metadata only (credential hash, issuer DID, revocation status, timestamps). It is **never** a database of personal information.

### 1.1 Scope statement
This is a **demonstration prototype** using synthetic identities. All simulated parts must be labelled. The app must not claim connection to Aadhaar, DigiLocker, real voting systems, government databases or a production blockchain.

### 1.2 Claims policy (important)
The presentation contains marketing-style figures. The application must **not** display or imply any of the following unless measured or implemented:
- "$300B savings", "99% uptime", "seconds instead of days", "sub-second verification" as guaranteed facts.
- "51% attack is computationally infeasible", "unhackable", "100% secure", "military-grade".
- Zero-knowledge proofs. Use the term **selective disclosure** and describe the actual mechanism (see 6.4).
- Estonia statistics may appear only in documentation pages, attributed as "from the project presentation" with a note to verify against primary sources.

---

## 2. Application structure

The product has two surfaces inside one app:

| Surface | Route prefix | Audience | Content |
|---|---|---|---|
| **Portal** (task application) | `/citizen`, `/issuer`, `/verifier`, `/admin` | Authenticated users | Workflows and records |
| **Documentation hub** | `/docs` | Everyone, no sign-in | Concepts, guides, architecture, API reference, glossary, limitations |

Public pages: `/` (home), `/how-it-works`, `/privacy-security`, `/docs/*`, `/sign-in`.

### 2.1 Documentation hub (new)
Written as a real documentation site, readable without signing in.

Layout: left section navigation, centred article (max 72ch), right "On this page" table of contents, breadcrumbs, "Last updated" line, previous/next links, client-side search over titles and headings.

Required pages:
1. **Overview**: what the system is and is not.
2. **Concepts**: Self-Sovereign Identity, DID, Verifiable Credential, Issuer / Holder / Verifier, selective disclosure, revocation. Plain English first, standard terms second.
3. **On-chain vs off-chain**: table of what is stored where (from the project slide).
4. **Architecture**: the five-layer model (section 6) as a flat, labelled diagram plus a per-layer description.
5. **Guides**: Issue a credential, Share a proof, Verify a credential, Revoke a credential. Numbered steps, expected result for each.
6. **Verification outcomes**: the decision table in section 5.2.
7. **Security model & limitations**: threat notes, key management, what the demo simulates, GDPR / immutability tension.
8. **API reference**: every endpoint with method, path, role required, request and response examples, error codes.
9. **Demo accounts & test data**: personas, credential samples, how to trigger each outcome.
10. **Glossary**.
11. **Changelog / project info**: team, guide, version.

Docs content lives in version-controlled Markdown/MDX files, not hard-coded JSX.

---

## 3. Portal modules

### A. Public home
- Product name, one-sentence description, a visible "Demonstration system, synthetic data only" notice.
- Three actions: `Open citizen wallet`, `Issue a credential`, `Verify a credential`.
- "How it works": Issue, Hold, Present, Verify (four numbered text steps).
- Privacy statement and limitations summary. Links to docs. Plain footer.

### B. Citizen wallet
- Overview: counts of active, expiring soon, revoked; pending sharing requests.
- Credential list: type, issuer, issued, expires, status.
- Credential detail: attributes, issuer DID, credential ID, hash (truncated, copyable), status history.
- **Share a proof**: shows requester, purpose, requested attributes, validity period. Attribute checkboxes limited to what was requested. Explicit `Approve and share` / `Decline`.
- Receipt after sharing: what, to whom, when.
- Sharing history.
- States: expired, revoked, invalid, unavailable.
- Private keys are never displayed or stored in plain text. Recovery is a clearly labelled simulation.

Credential types for the demo: **Identity**, **Age/eligibility**, **Student**, **Address** (synthetic).

### C. Issuer console
- Dashboard, subject selection (sample citizens), issuance form with validation, review and confirm, receipt.
- Credential search, filters, detail.
- Revoke: required reason, confirmation dialog.
- Issuance/revocation history.
- Backend must enforce the issuer role. Hiding buttons is not authorisation.

### D. Verifier portal
- Create verification request (purpose + requested attributes).
- Submit proof (demo flow), or paste/upload a presentation.
- Result page with outcome and each individual check (5.1), disclosed attributes only.
- Verification history for authorised users.

### E. Ledger explorer (admin, labelled **Simulated Ledger** unless a real ledger is wired)
- Event type, record ID, timestamp, issuer identifier, status, previous-hash/block reference.
- Chain integrity check button: recomputes the hash chain and reports pass/fail.
- Never shows names, addresses, ID numbers, attributes, full credentials or keys.

### F. Administration & audit
- Users and roles (seeded admin is acceptable).
- Audit log: actor, action, target reference, result, timestamp, correlation ID. Filter, search, paginate, export CSV.
- Integration health: API, database, ledger adapter, signing service; each with status and last-checked time.
- Retention and deletion settings for off-chain records.

---

## 4. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Separate citizen, issuer, verifier and admin workflows. | Must |
| FR-02 | Sign-in with role assignment; role-aware navigation. | Must |
| FR-03 | Issue credential after validation, review and confirmation. | Must |
| FR-04 | Citizens view credentials and status. | Must |
| FR-05 | Citizens approve or decline sharing requests; decline shares nothing. | Must |
| FR-06 | Verifier validates signature, issuer trust, expiry and status. | Must |
| FR-07 | Authorised issuers revoke credentials with reason. | Must |
| FR-08 | Outcomes distinguish Valid, Invalid, Expired, Revoked, Unable to verify. | Must |
| FR-09 | Security-sensitive actions create audit events. | Must |
| FR-10 | Ledger view contains no personal data. | Must |
| FR-11 | Simulated components are labelled honestly. | Must |
| FR-12 | Loading, empty, success, error and permission-denied states everywhere. | Must |
| FR-13 | Search, filter, sort, pagination on all lists. | Should |
| FR-14 | Receipts for issuance, revocation, sharing and verification. | Should |
| FR-15 | Documentation hub with search (section 2.1). | Must |
| FR-16 | Privacy and demo-data notice page. | Should |
| FR-17 | Ledger chain-integrity check. | Should |
| FR-18 | Integration health page. | Could |
| FR-19 | Print-friendly receipt and credential views. | Could |

---

## 5. Verification logic

### 5.1 Checks (executed server-side, in order)
1. **Structure**: well-formed credential/presentation, supported type.
2. **Signature**: cryptographic signature verifies against the issuer's public key.
3. **Issuer trust**: issuer DID is in the trust registry and active.
4. **Expiry**: current time is within validity period.
5. **Revocation status**: status checked via the ledger adapter.
6. **Disclosure**: returned attributes are a subset of what the citizen consented to.

A database lookup alone is never proof of validity.

### 5.2 Outcome decision table

| Condition | Outcome | Reason code |
|---|---|---|
| Malformed, bad signature, or issuer not trusted | **Invalid** | `MALFORMED`, `BAD_SIGNATURE`, `UNTRUSTED_ISSUER` |
| Status says revoked | **Revoked** | `REVOKED` |
| Past expiry | **Expired** | `EXPIRED` |
| Status or key lookup could not complete (and none of the above determined) | **Unable to verify** | `LEDGER_UNAVAILABLE`, `TIMEOUT` |
| All checks pass | **Valid** | none |

Precedence: Invalid, then Revoked, then Expired, then Unable to verify, then Valid. `Valid` is shown only if every check passed. A failed or incomplete check must never show a success state.

The result page lists each check with a text label (e.g. `Signature valid`, `Issuer trusted`, `Not expired`, `Not revoked`) plus an icon. Never colour alone.

---

## 6. Architecture

### 6.1 Five-layer model (from the project's proposed architecture)

| Layer | Name | Implementation in this project |
|---|---|---|
| 5 | User interface | Next.js pages: citizen wallet, issuer console, verifier portal, admin, docs |
| 4 | API gateway | Route handlers with auth middleware, schema validation, rate limiting, error normalisation |
| 3 | Smart-contract / policy layer | `policy` service: verification rules, access policies, audit logging (simulated "chaincode" as pure TypeScript functions) |
| 2 | Identity layer | DIDs, verifiable credentials, trust registry, signing and verification |
| 1 | Blockchain network | Ledger adapter interface with two implementations: `SimulatedLedger` (hash-chained append-only table) and an optional `FabricLedger` stub |

Code must reflect these boundaries: layers call downward only; the UI never touches the ledger or keys directly.

### 6.2 Stack (reference)
- Next.js (App Router) + TypeScript + React
- Tailwind CSS with design tokens (section 7); headless accessible primitives (Radix or shadcn/ui)
- Prisma + SQLite for local demo (PostgreSQL-compatible schema)
- Zod for validation; Auth.js or a simple signed-session implementation with HTTP-only same-site cookies
- `jose` (or Node `crypto`) for Ed25519 signing; credential format **VC-JWT** (W3C VC Data Model), issuer DIDs as `did:web` or `did:key`
- Vitest + Playwright

### 6.3 Ledger adapter interface
```ts
interface LedgerAdapter {
  mode: "simulated" | "fabric";
  recordIssuance(e: { credentialId: string; credentialHash: string; issuerDid: string }): Promise<LedgerReceipt>;
  recordRevocation(e: { credentialId: string; issuerDid: string; reasonCode: string }): Promise<LedgerReceipt>;
  getStatus(credentialId: string): Promise<{ status: "ACTIVE" | "REVOKED"; txRef: string; at: string }>;
  listEvents(q: EventQuery): Promise<Page<LedgerEvent>>;
  verifyIntegrity(): Promise<{ ok: boolean; checked: number; firstBrokenIndex?: number }>;
  health(): Promise<{ status: "up" | "down"; checkedAt: string }>;
}
```
`SimulatedLedger` stores `{index, eventType, recordId, issuerDid, payloadHash, prevHash, hash, timestamp}`; `hash = SHA-256(prevHash + canonical event)`. It is labelled "Simulated Ledger" everywhere it is surfaced.

### 6.4 Selective disclosure (honest implementation)
Use salted-hash selective disclosure (SD-JWT style): each attribute is hashed with a random salt inside the signed credential; the wallet reveals only the chosen attributes with their salts. Derived claims (e.g. "age over 18") are issued as separate attributes by the issuer. **Do not call this zero-knowledge.**

### 6.5 On-chain / off-chain
| On-chain (simulated ledger) | Off-chain (app database / wallet) |
|---|---|
| Issuer DID, credential hash, status / revocation, event type, timestamps | Name, address, ID numbers, biometrics, medical data, full credential contents, consent records |

---

## 7. Visual system: "professional documentation"

### 7.1 Principles
1. Text-first. Tables and lists over cards and charts.
2. One accent colour; semantic colours only for status.
3. Flat: no gradients, glow, glass, blur, parallax, floating shapes, hero illustrations, or decorative blockchain imagery.
4. No animation except 150 ms colour/opacity transitions and focus rings. Respect `prefers-reduced-motion`.
5. Every screen answers: where am I, what can I do, what happens next.

### 7.2 Tokens
| Token | Value | Use |
|---|---|---|
| `--bg` | `#F6F7F9` | page background |
| `--surface` | `#FFFFFF` | panels, tables |
| `--border` | `#D5DBE3` | 1px borders |
| `--text` | `#17202E` | body text |
| `--text-muted` | `#4B5565` | secondary text (min 7:1 on surface) |
| `--primary` | `#17407A` | primary buttons, links, active nav |
| `--primary-hover` | `#0F2F5C` | hover |
| `--success` / bg | `#1B6B3A` / `#E8F4EC` | valid / active |
| `--warning` / bg | `#7A4E00` / `#FFF3D6` | expiring / caution |
| `--danger` / bg | `#A3231F` / `#FBE9E8` | revoked / invalid / destructive |
| `--info` / bg | `#1B4F8F` / `#E8F0FA` | notices, simulated labels |
| `--focus` | `#1A73E8`, 3px outline, 2px offset | focus ring |

Dark mode is optional; if added, it must meet the same contrast targets.

**Typography:** Inter (system-ui fallback). Mono (JetBrains Mono or ui-monospace) for IDs, hashes, DIDs, code. Scale: 28 / 22 / 18 / 16 (body) / 14 (table, helper). Line-height 1.5. Tabular numerals for tables.
**Spacing:** 4-pt scale (4, 8, 12, 16, 24, 32, 48). **Radius:** 4 px. **Borders:** 1 px. **Shadows:** none, except dialogs (single subtle shadow).
**Icons:** one outline set (Lucide), 16/20 px, always paired with a text label for status or critical actions.

### 7.3 Layout
- Authenticated portal: 240 px left sidebar (collapsible to a drawer under 1024 px), 48 px top bar (product name, environment badge **DEMO**, user menu), content max-width 1120 px.
- Docs: three columns (nav 260 px, article 72ch, TOC 220 px); TOC hidden under 1280 px, nav becomes a drawer under 1024 px.
- Every page: breadcrumb, `h1`, one-sentence description, optional primary action aligned right.
- A persistent, non-dismissible banner on portal pages: *"Demonstration system. Synthetic data only."* Ledger pages add *"Simulated Ledger"*.

### 7.4 Components (required, built once and reused)
`AppShell`, `Sidebar`, `Breadcrumbs`, `PageHeader`, `DataTable` (sort, filter, pagination, empty/loading/error), `StatusBadge` (icon + text), `Banner`, `Callout` (note / warning / simulated), `Stepper` (issuance and consent flows), `ConfirmDialog`, `FormField` (label, hint, inline error), `CopyableCode` (truncated hash with copy), `CheckList` (verification checks), `Receipt`, `Toast`, `Skeleton`, `EmptyState`, `DocsLayout`, `DocsToc`, `DocsSearch`, `CodeBlock`, `ApiEndpoint`.

### 7.5 Status vocabulary (single source of truth)
| Status | Badge text | Tone | Icon |
|---|---|---|---|
| ACTIVE / Valid | Active / Valid | success | check-circle |
| EXPIRING | Expires in N days | warning | clock |
| EXPIRED | Expired | warning | clock-alert |
| REVOKED | Revoked | danger | ban |
| INVALID | Invalid | danger | x-circle |
| UNAVAILABLE | Unable to verify | neutral/info | alert-triangle |
| PENDING | Pending | neutral | circle-dashed |
| SIMULATED | Simulated | info | flask |

### 7.6 Copy rules
Plain, specific, sentence case. Verbs on buttons (`Issue credential`, `Revoke credential`, `Approve and share`). Explain cryptographic terms on first use with a link to the glossary. No exclamation marks, emoji or marketing adjectives.

Canonical messages:
- **Consent:** "**Share your credential?** {Service} is requesting {attributes} for {purpose}. Only the items listed below will be shared. You can decline without sharing anything."
- **Verified:** "**Credential verified.** The signature is valid, the issuer is trusted, and the credential is not expired or revoked."
- **Revoked:** "**Credential revoked.** This credential is no longer valid. Contact the issuing organisation if you believe this is incorrect."
- **Unavailable:** "**Verification temporarily unavailable.** We could not check the credential status. No decision has been made. Try again later."
- **Permission denied:** "**You do not have access to this page.** Your role ({role}) cannot perform this action."

### 7.7 Accessibility (WCAG 2.2 AA)
Semantic landmarks, skip link, visible focus, full keyboard operation, labelled form controls, `aria-live` for toasts and verification results, never colour alone, 44 px minimum touch targets on mobile, tables scroll horizontally in a labelled container, reduced-motion support.

---

## 8. Navigation

- **Public:** Home, How it works, Privacy & security, Documentation, Sign in
- **Citizen:** Overview, My credentials, Share a proof, Sharing history, Account & security
- **Issuer:** Overview, Issue credential, Issued credentials, Revocations, Issuance history
- **Verifier:** Overview, Verify credential, Requests, Verification history
- **Admin:** System overview, Ledger activity, Users & roles, Audit logs, Integration health, Settings

Navigation is role-based; permissions are enforced on the server.

---

## 9. Data model (starting point)

`users(id, display_name, email, password_hash, role, status, created_at)`
`issuers(id, organization_name, did, public_key_jwk, trust_status, created_at)`
`credentials(id, subject_user_id, issuer_id, type, issued_at, expires_at, status, credential_hash, jwt_ref, ledger_tx_ref)`
`verification_requests(id, verifier_id, subject_user_id, purpose, requested_attributes, status, created_at, expires_at)`
`consent_records(id, holder_id, request_id, decision, approved_attributes, decided_at)`
`verification_events(id, request_id, verifier_id, outcome, reason_code, checks_json, created_at)`
`audit_events(id, actor_id, action, target_ref, result, correlation_id, created_at)`
`ledger_events(index, event_type, record_id, issuer_did, payload_hash, prev_hash, hash, created_at)`

No private keys in the database. Demo signing keys are generated at seed time and kept in environment-configured files that are git-ignored.

---

## 10. API surface (all validated with Zod, role-checked server-side)

| Method | Path | Role |
|---|---|---|
| POST | `/api/auth/sign-in`, `/api/auth/sign-out` | public |
| GET | `/api/me` | any |
| GET | `/api/wallet/credentials`, `/api/wallet/credentials/:id` | CITIZEN (own only) |
| GET / POST | `/api/wallet/requests`, `/api/wallet/requests/:id/respond` | CITIZEN |
| GET | `/api/issuer/credentials`, `/api/issuer/subjects` | ISSUER |
| POST | `/api/issuer/credentials` | ISSUER |
| POST | `/api/issuer/credentials/:id/revoke` | ISSUER |
| POST | `/api/verifier/requests` | VERIFIER |
| POST | `/api/verifier/verify` | VERIFIER |
| GET | `/api/verifier/history` | VERIFIER |
| GET | `/api/admin/ledger`, `/api/admin/ledger/integrity` | ADMIN |
| GET | `/api/admin/audit`, `/api/admin/users`, `/api/admin/health` | ADMIN |

Errors use a consistent envelope `{ error: { code, message, correlationId } }` and never include stack traces or personal data.

---

## 11. Demo data

Seeded synthetic personas (all clearly fake):
- **Citizens:** Asha Patil, Rohan Deshmukh
- **Issuers:** Demo Municipal Corporation (identity, address), Demo State University (student), Demo Age Authority (age)
- **Verifier:** Demo City Hospital, Demo Public Bank
- **Admin:** Demo Auditor
- One **untrusted issuer** (to demonstrate rejection), one **expired** credential, one **revoked** credential, one scenario with the ledger switched to "unavailable".

Demo accounts and passwords are listed on `/docs/demo-accounts` and in the README. Provide an admin toggle **Simulate ledger outage** to demonstrate `Unable to verify`.

---

## 12. Non-functional requirements

**Security:** server-side authorisation on every protected operation; password hashing with Argon2id or bcrypt; HTTP-only, same-site cookies; CSRF protection; input validation and output encoding; IDOR checks on all by-ID routes; rate limiting on sign-in and sensitive endpoints; secrets only in environment config; never log passwords, keys or credential contents.
**Privacy:** minimum attributes, explicit consent, no personal data on ledger or in logs, documented retention and deletion rules, honest note on immutability vs erasure.
**Reliability:** explicit loading, retry, timeout and unavailable states; no stack traces in UI; pagination on large tables; measure before claiming performance.
**Compatibility:** latest two versions of Chrome, Edge, Firefox, Safari; responsive from 360 px.

---

## 13. Testing and acceptance

Automated tests must cover:
- Citizen cannot issue or revoke; verifier cannot access issuer routes; citizen cannot read another citizen's credentials (IDOR).
- Tampered credential rejected (`BAD_SIGNATURE`); untrusted issuer rejected; expired reported as Expired; revoked reported as Revoked.
- Ledger outage yields `Unable to verify`, never Valid.
- Declined consent shares nothing.
- Disclosed attributes never exceed consented attributes.
- Ledger events and logs contain no personal attributes.
- Ledger chain tampering is detected by the integrity check.
- Forms reject malformed input.
- Keyboard-only run through each journey; axe scan has no serious or critical violations.

**Definition of done:**
- All four roles have a working workflow; issue, share, verify and revoke work end-to-end.
- `/docs` hub complete with all pages in 2.1.
- Simulated components are labelled; no unsupported claims (section 1.2).
- README covers setup, demo accounts, architecture, limitations, ledger mode.
- No real personal data or secrets in the repository.

---

## 14. Delivery phases

1. **Foundation:** project scaffold, design tokens, component library, AppShell, docs layout, auth and roles, seed data.
2. **Core:** issuer console, wallet, verifier portal, credential lifecycle.
3. **Trust:** signing and verification, trust registry, simulated ledger, revocation, audit events.
4. **Docs and quality:** documentation hub content, API reference, accessibility and security tests, README, demo script.

**MVP priority:** issue, share with consent, verify, revoke, before any extra modules (voting, tax, licensing), charts or analytics.

---

## 15. Final design principle

Professional does not mean fancy. At every step the user must know where they are, what they can do, what is requested, what will happen next, whether it worked, why a credential was accepted or rejected, and what data is shared with whom.