# On-Chain vs Off-Chain Storage

A fundamental principle of privacy-preserving blockchain architecture is the strict segregation of **on-chain ledger state** from **off-chain identity data**. 

Placing citizen personal data on an immutable blockchain ledger violates the **GDPR Article 17 "Right to Erasure"** and creates permanent privacy liabilities. This portal enforces a strict zero-PII ledger boundary.

---

## Architectural Comparison Matrix

The table below delineates the exact storage boundaries implemented across the five layers of the portal:

| Data Asset | Storage Location | Cryptographic Nature | Accessibility |
|---|---|---|---|
| **Citizen Personal Attributes** (Name, DOB, Address, Photo) | **Off-Chain** (Holder Wallet / Relational DB) | Plaintext JSON or AES-256 encrypted at rest | Accessible only to authenticated citizen (Holder) |
| **Complete VC-JWT Tokens** | **Off-Chain** (Citizen Wallet) | JWS Compact Serialization signed with Ed25519 | Exchanged peer-to-peer via Verifiable Presentations |
| **Private Cryptographic Keys** | **Off-Chain** (`.keys/` keystore / Secure Enclave) | Ed25519 seed bytes (never logged or transmitted) | Held strictly by Issuer or Citizen device |
| **Credential Issuance Hashes** | **On-Chain** (`ledger_events` table) | Nonce-salted SHA-256 digest ($\text{digest} = \text{SHA-256}(\text{VC})$) | Publicly verifiable via ledger explorer |
| **Revocation Registry State** | **On-Chain** (`ledger_events` table) | Canonical revocation reason code & issuer DID | Publicly queryable by verifiers |
| **Issuer Trust Registry** | **On-Chain / Registry Table** | Issuer DID, Organization Name, Public Key, Status | Public read-only trust registry |
| **Block Headers & Merkle Hashes** | **On-Chain** (`ledger_events` table) | Cryptographic block digest chaining ($H_n = \text{SHA-256}(H_{n-1} \parallel \text{data})$) | Publicly auditable via `verifyIntegrity()` |
| **Verification & Consent Logs** | **Off-Chain** (`audit_events` table) | Ephemeral metadata (actor ID, timestamp, outcome) | Admin / Compliance auditor only (retention pruned) |

---

## Why Personal Identifiable Information (PII) Never Goes On-Chain

### 1. Immutability vs Right to Erasure (GDPR)
Blockchains and distributed ledgers are designed to be append-only and tamper-evident; data committed to a block cannot be deleted or rewritten without breaking subsequent cryptographic hash pointers. 

If a citizen's personal data (such as their national identification number or residential address) is written to a block, compliance with legal erasure requests becomes architecturally impossible.

### 2. Quantum Resistance and Future Decryption Risk
Even if personal data is encrypted before writing to a public or consortium ledger, encrypted ciphertext stored permanently on-chain is vulnerable to **"Store Now, Decrypt Later"** attacks as quantum cryptanalysis advances. By storing only irreversible one-way cryptographic hashes, the system eliminates this exposure surface.

### 3. Correlation and Surveillance Prevention
If full credentials or static identifiers are broadcast on-chain, observers can perform graph analysis to correlate a citizen's transactions across multiple government services. Using off-chain verifiable presentations combined with salted hashes ensures that verifiers cannot cross-correlate presentation events.

---

## Data Flow During Credential Issuance

```
[ Government Issuer ]
        │
        ├─ 1. Generates VC with claims: { name: "Asha Patil", degree: "B.Tech" }
        ├─ 2. Computes irreversible hash: SHA-256(VC) = 8f4a2b9...
        ├─ 3. Commits ONLY the hash to Ledger:
        │     { eventType: "CREDENTIAL_ISSUED", hash: "8f4a2b9...", issuerDid: "did:key:..." }
        │
        └─ 4. Transmits full signed VC-JWT directly to Citizen Wallet (Off-Chain)
```

During verification, the relying party checks that:
1. The credential signature matches the issuer's public key.
2. The credential's status on the ledger is not revoked.

At no point does the verifier or the ledger store or expose raw citizen attributes to unauthorized parties.
