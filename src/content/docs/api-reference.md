# API Reference

All portal operations communicate via RESTful HTTP JSON route handlers. This reference documents each endpoint, required authorization roles, request schemas, response envelopes, and error codes.

---

## Response Envelope Standard

Every API response adheres to the standardized envelope defined in Section 10 of the specification:

### Success Response
```json
{
  "ok": true,
  "data": {
    "key": "value"
  }
}
```

### Error Response
```json
{
  "ok": false,
  "error": {
    "code": "BAD_SIGNATURE",
    "message": "Cryptographic signature failed mathematical verification.",
    "correlationId": "corr-uuid-9876",
    "details": null
  }
}
```

---

## Authentication Endpoints

### 1. Sign In
- **Method**: `POST`
- **Path**: `/api/auth/sign-in`
- **Role Required**: `PUBLIC`
- **Rate Limit**: 10 requests per minute per IP.
- **Request Body**:
```json
{
  "email": "asha.patil@example.gov",
  "password": "Password123!"
}
```
- **Response**: Sets HTTP-only, SameSite=Strict cookie `session_token`.
```json
{
  "ok": true,
  "data": {
    "user": {
      "id": "usr-citizen-1",
      "email": "asha.patil@example.gov",
      "displayName": "Asha Patil",
      "role": "CITIZEN"
    }
  }
}
```

### 2. Current User Profile
- **Method**: `GET`
- **Path**: `/api/me`
- **Role Required**: `ANY` (Authenticated)
- **Response**:
```json
{
  "ok": true,
  "data": {
    "user": {
      "id": "usr-citizen-1",
      "email": "asha.patil@example.gov",
      "displayName": "Asha Patil",
      "role": "CITIZEN",
      "issuer": null
    }
  }
}
```

---

## Citizen Wallet Endpoints

### 3. List Wallet Credentials
- **Method**: `GET`
- **Path**: `/api/wallet/credentials`
- **Role Required**: `CITIZEN` (Enforces IDOR check: returns only caller&apos;s credentials)
- **Response**:
```json
{
  "ok": true,
  "data": {
    "credentials": [
      {
        "id": "cred-uuid-101",
        "type": "IdentityCredential",
        "issuerDid": "did:key:z6MkuTjN9zX...",
        "issuerName": "Municipal Corporation",
        "status": "VALID",
        "issuanceDate": "2026-01-15T09:00:00Z",
        "expirationDate": "2028-01-15T09:00:00Z"
      }
    ]
  }
}
```

### 4. Respond to Sharing Request
- **Method**: `POST`
- **Path**: `/api/wallet/requests/[id]/respond`
- **Role Required**: `CITIZEN`
- **Request Body**:
```json
{
  "action": "APPROVE",
  "disclosedAttributes": ["fullName", "dateOfBirth"]
}
```
- **Response**: Returns the signed Verifiable Presentation with salted hashes.

---

## Issuer Console Endpoints

### 5. Issue Verifiable Credential
- **Method**: `POST`
- **Path**: `/api/issuer/credentials`
- **Role Required**: `ISSUER`
- **Request Body**:
```json
{
  "subjectId": "usr-citizen-1",
  "type": "IdentityCredential",
  "claims": {
    "fullName": "Asha Patil",
    "nationalIdDigest": "sha256-a94f8fe5...",
    "dateOfBirth": "1994-06-12",
    "nationality": "IN"
  },
  "validityDays": 730
}
```
- **Response**:
```json
{
  "ok": true,
  "data": {
    "credentialId": "cred-uuid-202",
    "blockIndex": 42,
    "blockHash": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
    "jwt": "eyJhbGciOiJFZERTQSI..."
  }
}
```

### 6. Revoke Credential
- **Method**: `POST`
- **Path**: `/api/issuer/credentials/[id]/revoke`
- **Role Required**: `ISSUER` (Must match issuing authority)
- **Request Body**:
```json
{
  "reason": "DOCUMENT_SUPERSEDED"
}
```

---

## Verifier Portal Endpoints

### 7. Execute Credential Verification
- **Method**: `POST`
- **Path**: `/api/verifier/verify`
- **Role Required**: `PUBLIC` or `VERIFIER`
- **Rate Limit**: 30 requests per minute per IP.
- **Request Body**:
```json
{
  "presentationJwt": "eyJhbGciOiJFZERTQSI...",
  "verifierDid": "did:key:z6MkuHospital..."
}
```
- **Response**:
```json
{
  "ok": true,
  "data": {
    "outcome": "VALID",
    "checks": {
      "structure": { "passed": true, "label": "Structure valid" },
      "signature": { "passed": true, "label": "Signature authentic" },
      "issuerTrust": { "passed": true, "label": "Issuer trusted" },
      "expiry": { "passed": true, "label": "Not expired" },
      "revocation": { "passed": true, "label": "Not revoked" },
      "disclosure": { "passed": true, "label": "Disclosure consented" }
    },
    "disclosedClaims": {
      "fullName": "Asha Patil",
      "dateOfBirth": "1994-06-12"
    }
  }
}
```

---

## Administration & Ledger Endpoints

### 8. Inspect Ledger Activity
- **Method**: `GET`
- **Path**: `/api/admin/ledger`
- **Role Required**: `ADMIN`
- **Query Parameters**: `pageSize=20`, `page=1`
- **Response**: Returns paginated ledger event blocks with zero PII.

### 9. Check Ledger Chain Integrity
- **Method**: `POST`
- **Path**: `/api/admin/ledger/integrity`
- **Role Required**: `ADMIN`
- **Response**:
```json
{
  "ok": true,
  "data": {
    "isValid": true,
    "totalBlocks": 14,
    "lastVerifiedAt": "2026-10-28T11:45:00Z"
  }
}
```

### 10. Toggle Simulated Outage
- **Method**: `POST`
- **Path**: `/api/admin/ledger/simulate-outage`
- **Role Required**: `ADMIN`
- **Request Body**:
```json
{
  "simulateOutage": true
}
```
