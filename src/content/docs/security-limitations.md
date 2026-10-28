# Security Model & Limitations

This document provides a transparent overview of the security architecture, threat model, cryptographic key management practices, and operational boundaries of the demonstration portal.

---

## Threat Model and Countermeasures

| Threat Vector | Attack Scenario | Architectural Countermeasure |
|---|---|---|
| **Credential Forgery** | An attacker modifies attribute values (e.g. changing date of birth) in transit. | **Ed25519 Cryptographic Signatures**: Modifying any byte in the claims payload invalidates the JWS compact signature. Check 2 fails with `BAD_SIGNATURE`. |
| **Unauthorized Issuance** | A rogue organization issues fake credentials to citizens. | **Issuer Trust Registry**: Even if a rogue entity signs a valid signature, their DID is rejected at Check 3 with `UNTRUSTED_ISSUER`. |
| **Replay Attacks** | An intercepted Verifiable Presentation is re-sent to an unauthorized relying party. | **Verifier Nonces & Expiry**: Presentations include ephemeral `nonce` challenges and short validity timestamps (`exp`), preventing replay outside the active session. |
| **Insecure Direct Object Reference (IDOR)** | An authenticated citizen tampers with API URLs to view another citizen's credentials. | **Server-Side Ownership Enforcement**: Route handlers verify that `req.user.id === credential.holderId` before returning records. |
| **Ledger History Tampering** | An attacker directly alters a database row in the ledger table. | **SHA-256 Hash Chaining**: Every block contains the hash of the preceding block. Running `verifyIntegrity()` recalculates the chain and identifies altered blocks. |
| **Ledger Outage Hijacking** | A network partition makes revocation status inaccessible. | **Fail-Safe Defaults**: When the ledger is unreachable, verification fails with **Unable to verify** (`LEDGER_UNAVAILABLE`), preventing unauthorized acceptance. |

---

## Cryptographic Key Management

### Prototype Implementation
1. **Asymmetric Algorithm**: Ed25519 (`EdDSA` over Curve25519), offering high performance and 128-bit security levels.
2. **Seed Generation**: Demo keys are generated during database seeding (`npm run seed`) and written to the git-ignored `.keys/` directory.
3. **Strict Isolation**: Private keys are never returned in API payloads, logged to standard output, committed to git, or stored in browser local storage.

### Production Production Hardening Recommendations
In an enterprise deployment, software keys in local directories must be replaced with:
- **Hardware Security Modules (HSMs)**: Enterprise issuers must store root private keys in FIPS 140-2 Level 3 certified HSMs via PKCS#11 or cloud KMS (e.g. AWS CloudHSM, Google Cloud HSM).
- **Secure Enclaves on Mobile Devices**: Citizen wallets should bind identity keys to biometric hardware chips (Apple Secure Enclave, Android StrongBox Keymaster) via WebAuthn / Passkeys.
- **Key Rotation Protocols**: Automated periodic key rotation and revocation policies governed by smart contract multi-signature quorum.

---

## What This Demo Simulates

To ensure rapid local development and straightforward academic evaluation without requiring multi-node enterprise infrastructure, several components use honest simulations:

1. **SimulatedLedger vs Enterprise Blockchain**:
   - The default ledger engine is `SimulatedLedger`. It implements real cryptographic SHA-256 hash chaining and Merkle state transitions on top of relational storage.
   - It is not a distributed Byzantine Fault Tolerant (PBFT) or Raft consensus network running across multiple cloud nodes. A production system would wire the `FabricLedger` adapter to a Hyperledger Fabric channel.
2. **Wallet Key Recovery**:
   - The citizen "Key Recovery" feature in the wallet simulates backup restoration using pre-seeded identity records. It does not implement multi-party social recovery (Shamir's Secret Sharing) or distributed threshold cryptography.
3. **Synthetic Identity Data**:
   - All citizens, identification numbers, and addresses are synthetically generated test personas. No real personal records exist in the repository or database.

---

## GDPR Immutability Tension

The European Union General Data Protection Regulation (GDPR) mandates the **Right to Erasure** (Article 17) and **Data Minimization** (Article 5). By contrast, distributed ledger technology relies on permanent immutability.

This portal resolves the GDPR-blockchain tension through three strict architectural boundaries:
1. **Zero Personal Data On-Chain**: No names, email addresses, phone numbers, or national identity codes are ever written to the ledger.
2. **Irreversible Salted Hashes**: On-chain issuance events contain only one-way cryptographic digests ($\text{SHA-256}(\text{nonce} \parallel \text{VC})$). Without the off-chain credential, the hash cannot be reversed to reveal identity.
3. **Prunable Off-Chain Logs**: Off-chain relational tables (audit events, verification sessions) are subject to automated retention purging based on configurable administrative retention policies.
