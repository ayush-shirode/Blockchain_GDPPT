# Verification Outcomes & Logic

Verification in a decentralized identity system must never rely on a simple database boolean flag. The relying party must independently prove the cryptographic authenticity, authority, validity period, and revocation status of the credential.

This document details the **six-step server-side verification pipeline** and the **outcome decision table** specified in Section 5 of the architectural requirements.

---

## The Six Verification Checks

Every credential or presentation submitted to `/api/verifier/verify` is processed through the following six sequential checks in the policy layer:

```
[ Inbound Credential / Presentation ]
                 │
                 ▼
  [ Check 1: Structure & Syntax ] ───(Malformed)───► [ Outcome: INVALID ]
                 │ (Passed)
                 ▼
  [ Check 2: Cryptographic Signature ] ───(Bad Signature)───► [ Outcome: INVALID ]
                 │ (Passed)
                 ▼
  [ Check 3: Issuer Trust Registry ] ───(Untrusted DID)───► [ Outcome: INVALID ]
                 │ (Passed)
                 ▼
  [ Check 4: Expiration Window ] ───(Expired)───► [ Outcome: EXPIRED ]
                 │ (Passed)
                 ▼
  [ Check 5: Ledger Revocation Status ] ───(Revoked)───► [ Outcome: REVOKED ]
                 │                        └──(Ledger Down)──► [ Outcome: UNABLE TO VERIFY ]
                 │ (Passed)
                 ▼
  [ Check 6: Selective Disclosure ] ───(Tampered Disclosures)───► [ Outcome: INVALID ]
                 │ (Passed)
                 ▼
          [ Outcome: VALID ]
```

### 1. Structure Check
- **Verification Rule**: The input token must be a valid JWT compact serialization or W3C JSON-LD credential conforming to RFC 7519 and the W3C Verifiable Credentials Data Model v1.1.
- **Failure Code**: `MALFORMED`

### 2. Signature Check
- **Verification Rule**: The cryptographic signature in the JWS envelope must verify mathematically against the issuer&apos;s Ed25519 public key using `EdDSA`.
- **Failure Code**: `BAD_SIGNATURE`

### 3. Issuer Trust Check
- **Verification Rule**: The issuer DID (`iss`) extracted from the credential header/payload must exist in the **Issuer Trust Registry** and have an `ACTIVE` governance status.
- **Failure Code**: `UNTRUSTED_ISSUER`

### 4. Expiry Check
- **Verification Rule**: The current system epoch time must be less than or equal to the `exp` / `validUntil` timestamp.
- **Failure Code**: `EXPIRED`

### 5. Revocation Status Check
- **Verification Rule**: The verification engine queries the active `LedgerAdapter` for any append-only revocation events matching the unique credential ID.
- **Revoked Code**: `REVOKED`
- **Fault Code**: `LEDGER_UNAVAILABLE` (if the ledger adapter times out, fails, or is in simulated outage mode).

### 6. Disclosure Conformance Check
- **Verification Rule**: When evaluating a Verifiable Presentation with selective disclosure, all disclosed attribute values and salts must hash to digests present in the issuer&apos;s signed payload.
- **Failure Code**: `DISCLOSURE_MISMATCH`

---

## Verification Decision Table

Outcomes are evaluated in strict order of precedence. Under no circumstances may a failed or incomplete check produce a "Valid" result:

| Priority | Condition / Failure Trigger | System Outcome | Reason Code | Technical Meaning |
|---|---|---|---|---|
| **1** | Malformed token, invalid Ed25519 signature, or untrusted issuer | **Invalid** | `MALFORMED`<br>`BAD_SIGNATURE`<br>`UNTRUSTED_ISSUER` | Credential is forged, altered, or issued by an unauthorized actor. |
| **2** | Ledger records an append-only revocation event | **Revoked** | `REVOKED` | Credential was legitimately issued but subsequently canceled by the authority. |
| **3** | Current timestamp exceeds expiration timestamp | **Expired** | `EXPIRED` | Credential has exceeded its operational validity window. |
| **4** | Ledger adapter fails, times out, or simulation is active | **Unable to verify** | `LEDGER_UNAVAILABLE`<br>`TIMEOUT` | Status cannot be proven cryptographically. Fails safe. |
| **5** | All six verification checks pass without exception | **Valid** | *None* | Credential is mathematically authentic, active, and fully trusted. |

---

## Precedence and Fail-Safe Rules

1. **Strict Precedence Hierarchy**:
   $$\text{Invalid} \succ \text{Revoked} \succ \text{Expired} \succ \text{Unable to verify} \succ \text{Valid}$$
   For example, if a credential has both a forged cryptographic signature *and* an expired date, the outcome is **Invalid** (`BAD_SIGNATURE`), never Expired.
2. **Fail-Safe Default**:
   If the blockchain network or ledger adapter becomes unreachable, the system returns **Unable to verify**. The portal never grants access or reports a credential as valid when status cannot be confirmed.
3. **Multi-Sensory Status Indication**:
   Per WCAG 2.2 Section 1.4.1 (Use of Color), every verification outcome renders both an explicit text label and a unique SVG icon (e.g. checkmark, cross, clock, slashed circle, or alert triangle). Status is never communicated by color alone.
