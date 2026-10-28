# Terminology & Glossary

This glossary provides standardized definitions for cryptographic, identity, and distributed systems terminology used throughout the portal.

---

### Decentralized Identifier (DID)
A globally unique URI that does not rely on a centralized authority, directory service, or domain registrar. DIDs enable entities to cryptographically prove control over their identifier. Formatted as `did:<method>:<method-specific-id>`.

### did:key
A specific DID method where the identifier is a self-describing, deterministic representation of a cryptographic public key using multicodec prefixes and base58-btc encoding. Requires no external ledger lookup to resolve public keys.

### Ed25519 / EdDSA
Edwards-curve Digital Signature Algorithm over Curve25519. Provides high performance, immunity to side-channel timing attacks, and 128-bit security levels with compact 64-byte signatures and 32-byte public keys.

### Hash Chaining
A cryptographic data structure where each record or block incorporates the cryptographic hash of the preceding record ($H_n = \text{SHA-256}(H_{n-1} \parallel \text{data})$). Any tampering with historical records breaks the hash chain for all subsequent blocks.

### Holder
The entity (typically a citizen or resident) that receives verifiable credentials from issuers, stores them in an off-chain digital wallet, and generates verifiable presentations for relying parties.

### Issuer
An authoritative institution (such as a municipal registry, university, or licensing board) that asserts claims about a subject, signs them into a Verifiable Credential using its private key, and publishes revocation metadata to the ledger.

### Merkle State Transition
The cryptographic update of a global state root derived from the combined leaves of an event tree. Allows verifiers to prove membership or non-membership of a specific revocation record without downloading the entire ledger.

### Personally Identifiable Information (PII)
Any data that can be used to distinguish or trace an individual&apos;s identity, such as full name, date of birth, home address, or national identity numbers. In this system, PII is strictly forbidden from on-chain storage.

### Relying Party (Verifier)
An organization or service (such as a hospital, university admissions department, or bank) that requests and verifies cryptographic credentials to establish qualifications or eligibility.

### Revocation Registry
An on-chain append-only registry recording the revocation status of issued credentials. Allows verifiers to confirm that a credential has not been canceled by the issuing authority without contacting the authority directly.

### Salted-Hash Selective Disclosure (SD-JWT Pattern)
A mechanism where individual credential attributes are hashed independently with cryptographically random salts. The holder can reveal selected attribute-salt pairs while withholding others, allowing relying parties to verify authentic issuance without viewing redacted data.

### Self-Sovereign Identity (SSI)
A digital identity paradigm centered on the individual, giving citizens independent ownership and control of their digital credentials without dependence on centralized identity providers.

### SimulatedLedger
An in-process, SHA-256 hash-chained append-only event engine implemented in this prototype. Demonstrates tamper-evident ledger mechanics, event querying, and outage simulation without requiring an external multi-node consortium network.

### Trust Registry
A canonical governance registry mapping approved issuer DIDs to their legal entity names, verification public keys, and operational status (`ACTIVE`, `SUSPENDED`, `REVOKED`).

### Verifiable Credential (VC)
A tamper-evident credential whose authorship and authenticity can be cryptographically proven. Standardized by the W3C Verifiable Credentials Data Model v1.1.

### Verifiable Presentation (VP)
Data derived from one or more verifiable credentials, packaged by the holder with proof of possession and selective disclosure for submission to a relying party.

### Zero-Knowledge Proof (ZKP)
A cryptographic protocol by which one party can prove to another that a statement is true without revealing any information beyond the statement's validity. **Clarification**: This prototype uses salted-hash selective disclosure, *not* ZKP.
