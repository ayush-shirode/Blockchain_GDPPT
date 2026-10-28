# User Guides & Workflows

This document provides step-by-step instructions for completing the four primary workflows in the digital identity lifecycle. Each guide includes prerequisites, procedural steps, and the expected system outcome.

---

## Guide 1: Issue a Verifiable Credential

**Role Required**: `ISSUER`  
**Route**: `/issuer/issue`

### Overview
Government issuers validate a citizen's eligibility and issue a tamper-proof VC-JWT credential signed with the authority's Ed25519 private key.

### Step-by-Step Procedure
1. **Sign In as an Issuer**:
   - Navigate to `/sign-in`.
   - Select the demo persona **Municipal Corporation** (`issuer.muni@example.gov`) or use one-click sign-in.
2. **Access the Issuance Console**:
   - Click **Issue Credential** in the sidebar navigation or go directly to `/issuer/issue`.
3. **Select Citizen Subject**:
   - Choose a registered citizen from the subject selector (e.g., *Asha Patil*). The system automatically populates the recipient's decentralized identifier (`did:key:...`).
4. **Select Credential Type**:
   - Choose from the four supported schemas:
     - **Identity Credential**: Full name, national ID digest, date of birth, nationality.
     - **Age / Eligibility Credential**: Age over 18 flag, date of birth, jurisdiction.
     - **Student Credential**: University name, degree program, graduation year, student status.
     - **Residential Address Credential**: Street address, city, postal code, state.
5. **Review and Confirm**:
   - Fill in the required claim fields.
   - Click **Review and Sign Credential**.
   - A modal displays the raw JSON payload and the issuer's signing DID. Click **Confirm Issuance**.

### Expected Result
- The system signs the VC-JWT using the issuer's Ed25519 private key.
- An append-only event (`CREDENTIAL_ISSUED`) is written to the ledger containing the SHA-256 digest of the credential.
- An **Issuance Receipt** is displayed showing the Credential ID, Ledger Block Index, and Issuer Signature.
- The credential appears immediately in the citizen's wallet.

---

## Guide 2: Share a Proof (Selective Disclosure)

**Role Required**: `CITIZEN`  
**Route**: `/citizen/share`

### Overview
Citizens exercise self-sovereign control over their personal data by selectively revealing only the specific claims requested by a relying party.

### Step-by-Step Procedure
1. **Sign In as a Citizen**:
   - Sign in as **Asha Patil** (`asha.patil@example.gov`).
2. **Review Pending Requests**:
   - Navigate to `/citizen/share`.
   - Select an active sharing request from the list (or create a simulated request from the Verifier portal).
3. **Inspect Request Parameters**:
   - Review the relying party's organization name, the stated purpose of verification, and the requested attributes.
4. **Exercise Selective Disclosure**:
   - Check the boxes for the attributes you consent to share.
   - Unchecked attributes will remain redacted using cryptographic salted hashes.
5. **Submit Authorization**:
   - Click **Approve and Share Proof** to generate the signed Verifiable Presentation.
   - *Alternative*: Click **Decline Request**. Declining transmits zero data and logs a declined consent event.

### Expected Result
- A verifiable presentation is created containing salted hashes for redacted attributes.
- A **Consent Receipt** is generated recording the target verifier, consented attributes, and timestamp.
- The sharing event is added to the citizen's **Sharing History** log.

---

## Guide 3: Verify a Credential or Presentation

**Role Required**: `VERIFIER` (or public evaluator)  
**Route**: `/verifier/verify`

### Overview
Relying parties independently evaluate credentials or presentations against the six-step verification pipeline without contacting the issuing authority directly.

### Step-by-Step Procedure
1. **Sign In as a Verifier**:
   - Sign in as **City General Hospital** (`verifier.hospital@example.gov`).
2. **Open the Verification Console**:
   - Navigate to `/verifier/verify`.
3. **Select or Paste a Presentation**:
   - **Option A (Presets)**: Select one of the pre-configured test scenarios:
     - *Valid Identity Presentation*
     - *Expired Student Credential*
     - *Revoked Address Credential*
     - *Untrusted Issuer Presentation*
     - *Tampered Cryptographic Signature*
   - **Option B (Manual)**: Paste a raw VC-JWT compact serialization token into the input area.
4. **Execute Verification**:
   - Click **Verify Credential**.

### Expected Result
- The server executes all six verification checks in order:
  1. Structure Validation
  2. Signature Verification (Ed25519)
  3. Trust Registry Status
  4. Expiry Check
  5. Ledger Revocation Lookup
  6. Disclosure Consent Conformance
- An unambiguous outcome badge is returned: **Valid**, **Invalid**, **Expired**, **Revoked**, or **Unable to verify**.
- Each check displays an explicit status label and icon (never colour alone).

---

## Guide 4: Revoke a Credential

**Role Required**: `ISSUER`  
**Route**: `/issuer/revocations`

### Overview
Issuers revoke compromised, outdated, or superseded credentials by publishing an immutable revocation event to the distributed ledger.

### Step-by-Step Procedure
1. **Sign In as the Authorised Issuer**:
   - Sign in with the issuer account that originally signed the credential.
2. **Navigate to Revocations**:
   - Go to `/issuer/revocations`.
3. **Select Target Credential**:
   - Locate the active credential in the table and click **Revoke Credential**.
4. **Specify Reason Code**:
   - Select a standard revocation reason from the dropdown:
     - `SUSPECTED_COMPROMISE`
     - `DOCUMENT_SUPERSEDED`
     - `ADMINISTRATIVE_CANCELLATION`
     - `FRAUDULENT_ISSUANCE`
5. **Confirm Revocation**:
   - Confirm the irreversible action in the modal dialog.

### Expected Result
- An append-only `CREDENTIAL_REVOKED` block is committed to the ledger with the credential ID and reason code.
- The credential status in the database transitions to `REVOKED`.
- Any subsequent attempt to verify this credential returns the outcome **Revoked** with reason `REVOKED`.
