# Scripted Demo Walkthrough

This script provides an evaluative, 10-minute walkthrough demonstrating each core feature and all five verification outcomes of the **Digital Identity & E-Governance Portal**.

---

## Preparation (1 Minute)

1. Ensure the application is seeded and running:
   ```bash
   npm run seed
   npm run dev
   ```
2. Open your browser to `http://localhost:3000`.
3. Note the top persistent notice banner:  
   *"Demonstration system. Synthetic data only."*

---

## Part 1: Public Portal & Documentation Hub (2 Minutes)

1. **Inspect Home Page (`/`)**:
   - Note the flat, enterprise typography-first design (GOV.UK / Stripe Docs aesthetic). No decorative gradients or marketing buzzwords.
   - Point out the three entry actions: **Open Citizen Wallet**, **Issue a Credential**, **Verify a Credential**.
2. **Visit the Documentation Hub (`/docs`)**:
   - Click **Documentation** in the top navigation bar.
   - Press <kbd>⌘K</kbd> (or <kbd>Ctrl+K</kbd>) to test the client-side search indexing. Search for *"decision table"* and navigate directly.
   - Navigate to `/docs/architecture`: view the flat, labelled SVG diagram of the **Five-Layer Model**.
   - Navigate to `/docs/on-chain-vs-off-chain`: review the privacy storage matrix demonstrating that zero PII is committed to the blockchain.

---

## Part 2: Citizen Wallet & Selective Disclosure (2.5 Minutes)

1. **Sign In as Citizen**:
   - Go to `/sign-in`.
   - Click the one-click demo persona **Asha Patil** (`asha.patil@example.gov`).
2. **Inspect Wallet Credentials (`/citizen/credentials`)**:
   - View the active **Identity Credential**, the **Expired Student Credential**, and the **Revoked Address Credential**.
   - Click on the Identity Credential to inspect the claim details, issuer DID, and truncated SHA-256 hash.
3. **Exercise Selective Disclosure (`/citizen/share`)**:
   - Navigate to **Share Proof** (`/citizen/share`).
   - Select the pending KYC verification request from *Metro Commercial Bank*.
   - Notice the requested attributes: *Full Name*, *Date of Birth*, and *Address*.
   - Uncheck *Address* to demonstrate data minimization.
   - Click **Approve and Share Proof**.
   - Note the **Sharing Receipt** confirming which attributes were disclosed and which remained masked via cryptographic salted hashes.

---

## Part 3: Verifier Portal & Five Verification Outcomes (2.5 Minutes)

1. **Navigate to Verifier Portal (`/verifier/verify`)**:
   - Open `/verifier/verify` in a new tab or sign in as **City General Hospital**.
2. **Demonstrate Outcome 1: VALID**:
   - Click preset **Load Valid Identity Credential**.
   - Click **Execute Verification**.
   - Point out the green **VALID** badge and the individual passing status for each of the six checks.
3. **Demonstrate Outcome 2: INVALID**:
   - Click preset **Load Tampered Signature**.
   - Click **Execute Verification**.
   - Point out the red **INVALID** badge and the failure code `BAD_SIGNATURE`.
4. **Demonstrate Outcome 3: EXPIRED**:
   - Click preset **Load Expired Student Credential**.
   - Click **Execute Verification**.
   - Point out the amber **EXPIRED** badge. Checks 1-3 pass, but Check 4 fails.
5. **Demonstrate Outcome 4: REVOKED**:
   - Click preset **Load Revoked Address Credential**.
   - Click **Execute Verification**.
   - Point out the red **REVOKED** badge with reason `DOCUMENT_SUPERSEDED`.
6. **Demonstrate Outcome 5: UNABLE TO VERIFY**:
   - Sign in as Admin (`admin.auditor@example.gov`), go to `/admin/health`, and toggle **Simulate Ledger Outage** to ON.
   - Return to `/verifier/verify` and verify the valid credential.
   - Point out that the system fails safe: it reports **UNABLE TO VERIFY** (`LEDGER_UNAVAILABLE`), never an erroneous valid state.
   - Return to `/admin/health` and restore ledger connectivity.

---

## Part 4: Issuer Console & Credential Lifecycle (1.5 Minutes)

1. **Sign In as Issuer**:
   - Sign in as **Municipal Corporation** (`issuer.muni@example.gov`).
2. **Issue a New Credential (`/issuer/issue`)**:
   - Select citizen *Rohan Deshmukh*.
   - Select schema *Residential Address Credential*.
   - Click **Review and Sign Credential**.
   - Confirm issuance in the modal.
   - Review the issuance receipt showing block index, block hash, and Ed25519 signature.
3. **Revoke a Credential (`/issuer/revocations`)**:
   - Navigate to `/issuer/revocations`.
   - Select a credential, choose reason code `SUSPECTED_COMPROMISE`, and confirm.
   - Note the on-chain revocation confirmation.

---

## Part 5: Admin Console & Cryptographic Audit (1.5 Minutes)

1. **Inspect Ledger Activity (`/admin/ledger`)**:
   - Sign in as Admin (`admin.auditor@example.gov`).
   - Navigate to `/admin/ledger`.
   - Point out the **Simulated Ledger** banner.
   - Review the append-only block rows: note that blocks display hashes, timestamps, and event types, but **zero personal data**.
2. **Verify Cryptographic Chain Integrity**:
   - Click the **Check Chain Integrity** button.
   - The system re-hashes all blocks sequentially from Genesis to Head and reports **CHAIN INTEGRITY VALID**.
3. **Inspect Audit Trail (`/admin/audit`)**:
   - Filter by `CREDENTIAL_ISSUED` or `CREDENTIAL_REVOKED`.
   - Click **Export CSV** to demonstrate audit compliance reporting.
