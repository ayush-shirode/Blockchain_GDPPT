import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { formatIssuerDid } from "../src/layers/identity/did";
import { generateIssuerKeyPair } from "../src/layers/identity/key-manager";
import { createSaltedClaims } from "../src/layers/identity/selective-disclosure";
import { createAndSignVcJwt } from "../src/layers/identity/vc-jwt";
import { computeSha256, computeEventHash } from "../src/layers/ledger/simulated-ledger";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "DemoPassword123!";
const GENESIS_PREV_HASH = "0".repeat(64);

async function main() {
  console.log("--- Starting Seed: Digital Identity & E-Governance Portal ---");

  // Clear existing records
  await prisma.auditEvent.deleteMany({});
  await prisma.verificationEvent.deleteMany({});
  await prisma.consentRecord.deleteMany({});
  await prisma.verificationRequest.deleteMany({});
  await prisma.credential.deleteMany({});
  await prisma.ledgerEvent.deleteMany({});
  await prisma.issuer.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.systemSetting.deleteMany({});

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // 1. Seed System Settings
  await prisma.systemSetting.createMany({
    data: [
      { key: "LEDGER_OUTAGE_SIMULATION", value: "false" },
      { key: "DATA_RETENTION_DAYS", value: "365" },
      { key: "REQUIRE_CONSENT_SIGNATURE", value: "true" },
    ],
  });

  // 2. Seed Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: "admin.auditor@example.gov",
      displayName: "Demo Auditor",
      passwordHash,
      role: "ADMIN",
    },
  });

  // 3. Seed Citizen Users
  const asha = await prisma.user.create({
    data: {
      email: "asha.patil@example.gov",
      displayName: "Asha Patil",
      passwordHash,
      role: "CITIZEN",
    },
  });

  const rohan = await prisma.user.create({
    data: {
      email: "rohan.deshmukh@example.gov",
      displayName: "Rohan Deshmukh",
      passwordHash,
      role: "CITIZEN",
    },
  });

  // 4. Seed Verifier Users
  const hospitalUser = await prisma.user.create({
    data: {
      email: "verifier.hospital@example.gov",
      displayName: "Demo City Hospital Verifier",
      passwordHash,
      role: "VERIFIER",
    },
  });

  const bankUser = await prisma.user.create({
    data: {
      email: "verifier.bank@example.gov",
      displayName: "Demo Public Bank Verifier",
      passwordHash,
      role: "VERIFIER",
    },
  });

  // 5. Seed Issuers (Users + Issuer Profiles + KeyPairs)
  const issuerDefs = [
    {
      orgName: "Demo Municipal Corporation",
      email: "issuer.muni@example.gov",
      slug: "demo-municipal-corporation",
      trustStatus: "TRUSTED",
    },
    {
      orgName: "Demo State University",
      email: "issuer.univ@example.gov",
      slug: "demo-state-university",
      trustStatus: "TRUSTED",
    },
    {
      orgName: "Demo Age Authority",
      email: "issuer.age@example.gov",
      slug: "demo-age-authority",
      trustStatus: "TRUSTED",
    },
    {
      orgName: "Untrusted Rogue Authority",
      email: "issuer.rogue@example.gov",
      slug: "untrusted-rogue-authority",
      trustStatus: "UNTRUSTED",
    },
  ];

  const issuersMap = new Map<string, { issuerId: string; did: string; slug: string }>();

  for (const def of issuerDefs) {
    const user = await prisma.user.create({
      data: {
        email: def.email,
        displayName: `${def.orgName} Officer`,
        passwordHash,
        role: "ISSUER",
      },
    });

    const did = formatIssuerDid(def.slug);
    const keyPair = await generateIssuerKeyPair(def.slug);

    const issuer = await prisma.issuer.create({
      data: {
        userId: user.id,
        organizationName: def.orgName,
        did,
        publicKeyJwk: JSON.stringify(keyPair.publicKeyJwk),
        trustStatus: def.trustStatus,
      },
    });

    issuersMap.set(def.slug, { issuerId: issuer.id, did, slug: def.slug });
  }

  // 6. Helper to issue and record on simulated ledger
  let currentPrevHash = GENESIS_PREV_HASH;

  async function issueAndRecord(params: {
    subjectUserId: string;
    issuerSlug: string;
    type: string;
    attributes: Record<string, string | number | boolean>;
    issuedAt: Date;
    expiresAt: Date;
    status: "ACTIVE" | "REVOKED" | "EXPIRED";
    revocationReason?: string;
  }) {
    const issuerMeta = issuersMap.get(params.issuerSlug)!;
    const { saltedClaims, claimsHashes } = createSaltedClaims(params.attributes);
    const credentialId = `urn:uuid:${crypto.randomUUID()}`;

    const { jwtRaw, credentialHash } = await createAndSignVcJwt(
      {
        jti: credentialId,
        iss: issuerMeta.did,
        sub: `urn:uuid:${params.subjectUserId}`,
        type: params.type,
        claimsHashes,
        issuedAt: params.issuedAt,
        expiresAt: params.expiresAt,
      },
      issuerMeta.slug
    );

    // Record on ledger
    const payloadCanonical = JSON.stringify({
      credentialId,
      credentialHash,
      issuerDid: issuerMeta.did,
      eventType: "ISSUANCE",
    });
    const payloadHash = computeSha256(payloadCanonical);
    const hash = computeEventHash({
      prevHash: currentPrevHash,
      payloadHash,
      eventType: "ISSUANCE",
      recordId: credentialId,
      issuerDid: issuerMeta.did,
    });

    const ledgerEvt = await prisma.ledgerEvent.create({
      data: {
        eventType: "ISSUANCE",
        recordId: credentialId,
        issuerDid: issuerMeta.did,
        payloadHash,
        prevHash: currentPrevHash,
        hash,
        createdAt: params.issuedAt,
      },
    });
    currentPrevHash = hash;

    let ledgerTxRef = `sim-tx-${ledgerEvt.index}-${hash.slice(0, 12)}`;

    // If revoked, create revocation ledger event
    let revokedAt: Date | null = null;
    if (params.status === "REVOKED") {
      revokedAt = new Date();
      const revPayload = JSON.stringify({
        credentialId,
        issuerDid: issuerMeta.did,
        reasonCode: params.revocationReason || "SUSPECTED_COMPROMISE",
        eventType: "REVOCATION",
      });
      const revPayloadHash = computeSha256(revPayload);
      const revHash = computeEventHash({
        prevHash: currentPrevHash,
        payloadHash: revPayloadHash,
        eventType: "REVOCATION",
        recordId: credentialId,
        issuerDid: issuerMeta.did,
      });

      const revEvt = await prisma.ledgerEvent.create({
        data: {
          eventType: "REVOCATION",
          recordId: credentialId,
          issuerDid: issuerMeta.did,
          payloadHash: revPayloadHash,
          prevHash: currentPrevHash,
          hash: revHash,
          createdAt: revokedAt,
        },
      });
      currentPrevHash = revHash;
      ledgerTxRef = `sim-tx-${revEvt.index}-${revHash.slice(0, 12)}`;
    }

    const cred = await prisma.credential.create({
      data: {
        id: credentialId,
        subjectUserId: params.subjectUserId,
        issuerId: issuerMeta.issuerId,
        type: params.type,
        claimsData: JSON.stringify(saltedClaims),
        claimsHashes: JSON.stringify(claimsHashes),
        credentialHash,
        jwtRaw,
        status: params.status,
        revocationReason: params.revocationReason || null,
        revokedAt,
        issuedAt: params.issuedAt,
        expiresAt: params.expiresAt,
        ledgerTxRef,
      },
    });

    return cred;
  }

  // 7. Seed Credentials for Asha Patil
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const oneYearFuture = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const pastExpiry = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // A. Active Identity Credential
  await issueAndRecord({
    subjectUserId: asha.id,
    issuerSlug: "demo-municipal-corporation",
    type: "IdentityCredential",
    attributes: {
      fullName: "Asha Patil",
      dateOfBirth: "1998-05-14",
      residentDistrict: "Central Metro",
      citizenshipVerified: true,
    },
    issuedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    expiresAt: oneYearFuture,
    status: "ACTIVE",
  });

  // B. Active Student Credential
  await issueAndRecord({
    subjectUserId: asha.id,
    issuerSlug: "demo-state-university",
    type: "StudentCredential",
    attributes: {
      studentName: "Asha Patil",
      university: "Demo State University",
      program: "B.Tech Computer Science",
      graduationYear: 2026,
      studentId: "STU-2022-7589",
    },
    issuedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    expiresAt: oneYearFuture,
    status: "ACTIVE",
  });

  // C. Active Age/Eligibility Credential
  await issueAndRecord({
    subjectUserId: asha.id,
    issuerSlug: "demo-age-authority",
    type: "AgeCredential",
    attributes: {
      subjectName: "Asha Patil",
      isOver18: true,
      isOver21: true,
      jurisdiction: "State E-Services",
    },
    issuedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    expiresAt: oneYearFuture,
    status: "ACTIVE",
  });

  // D. Expired Credential (to demonstrate EXPIRED outcome)
  await issueAndRecord({
    subjectUserId: asha.id,
    issuerSlug: "demo-state-university",
    type: "StudentCredential",
    attributes: {
      studentName: "Asha Patil",
      university: "Demo State University",
      program: "Diploma in Information Security",
      studentId: "DIP-2021-0012",
    },
    issuedAt: oneYearAgo,
    expiresAt: pastExpiry,
    status: "EXPIRED",
  });

  // E. Revoked Credential (to demonstrate REVOKED outcome)
  await issueAndRecord({
    subjectUserId: asha.id,
    issuerSlug: "demo-municipal-corporation",
    type: "IdentityCredential",
    attributes: {
      fullName: "Asha Patil",
      dateOfBirth: "1998-05-14",
      legacyIdNumber: "OLD-ID-449102",
    },
    issuedAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
    expiresAt: oneYearFuture,
    status: "REVOKED",
    revocationReason: "SUPERSEDED_BY_NEW_CREDENTIAL",
  });

  // 8. Seed Credentials for Rohan Deshmukh
  // A. Active Address Credential
  await issueAndRecord({
    subjectUserId: rohan.id,
    issuerSlug: "demo-municipal-corporation",
    type: "AddressCredential",
    attributes: {
      fullName: "Rohan Deshmukh",
      addressLine1: "Flat 402, Shanti Heights",
      city: "Metro City",
      postalCode: "400012",
      residencyType: "Permanent Resident",
    },
    issuedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    expiresAt: oneYearFuture,
    status: "ACTIVE",
  });

  // B. Credential issued by UNTRUSTED ROGUE AUTHORITY (to demonstrate UNTRUSTED_ISSUER)
  await issueAndRecord({
    subjectUserId: rohan.id,
    issuerSlug: "untrusted-rogue-authority",
    type: "IdentityCredential",
    attributes: {
      fullName: "Rohan Deshmukh",
      unverifiedStatus: "VIP Pass",
    },
    issuedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    expiresAt: oneYearFuture,
    status: "ACTIVE",
  });

  // 9. Seed Verification Requests
  // A. Demo City Hospital requesting Age & Identity from Asha
  await prisma.verificationRequest.create({
    data: {
      verifierId: hospitalUser.id,
      verifierName: "Demo City Hospital",
      subjectUserId: asha.id,
      purpose: "Patient admission age verification & identity confirmation",
      requestedAttributes: JSON.stringify(["fullName", "isOver18"]),
      validitySeconds: 7200,
      status: "PENDING",
      expiresAt: new Date(Date.now() + 7200 * 1000),
    },
  });

  // B. Demo Public Bank requesting Address & Identity from Rohan
  await prisma.verificationRequest.create({
    data: {
      verifierId: bankUser.id,
      verifierName: "Demo Public Bank",
      subjectUserId: rohan.id,
      purpose: "Address verification for savings account application",
      requestedAttributes: JSON.stringify(["fullName", "city", "postalCode"]),
      validitySeconds: 3600,
      status: "PENDING",
      expiresAt: new Date(Date.now() + 3600 * 1000),
    },
  });

  // 10. Seed Initial Audit Log Events
  await prisma.auditEvent.createMany({
    data: [
      {
        actorId: adminUser.id,
        action: "USER_LOGIN",
        result: "SUCCESS",
        correlationId: "seed-init-01",
      },
      {
        actorId: null,
        action: "INTEGRITY_CHECK",
        result: "SUCCESS",
        correlationId: "seed-init-02",
      },
    ],
  });

  console.log("✔ Seed completed successfully!");
  console.log("Synthetic demo accounts available:");
  console.log("  Admin: admin.auditor@example.gov / DemoPassword123!");
  console.log("  Citizen: asha.patil@example.gov / DemoPassword123!");
  console.log("  Citizen: rohan.deshmukh@example.gov / DemoPassword123!");
  console.log("  Issuer (Muni): issuer.muni@example.gov / DemoPassword123!");
  console.log("  Issuer (Univ): issuer.univ@example.gov / DemoPassword123!");
  console.log("  Issuer (Age): issuer.age@example.gov / DemoPassword123!");
  console.log("  Issuer (Rogue): issuer.rogue@example.gov / DemoPassword123!");
  console.log("  Verifier (Hospital): verifier.hospital@example.gov / DemoPassword123!");
  console.log("  Verifier (Bank): verifier.bank@example.gov / DemoPassword123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
