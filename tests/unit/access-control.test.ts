import { describe, it, expect } from "vitest";
import {
  requireRole,
  assertOwnership,
  AuthorizationError,
  SessionUser,
} from "@/layers/policy/access-control";

describe("Access Control & IDOR Checks", () => {
  const citizenUser: SessionUser = {
    id: "usr-citizen-1",
    email: "citizen@example.gov",
    displayName: "Citizen User",
    role: "CITIZEN",
  };

  const issuerUser: SessionUser = {
    id: "usr-issuer-1",
    email: "issuer@example.gov",
    displayName: "Issuer Officer",
    role: "ISSUER",
    issuerId: "iss-1",
  };

  it("should allow authorized roles and reject unauthorized roles", () => {
    expect(() => requireRole(citizenUser, ["CITIZEN"])).not.toThrow();
    expect(() => requireRole(issuerUser, ["ISSUER"])).not.toThrow();

    // Citizen attempting issuer action
    expect(() => requireRole(citizenUser, ["ISSUER"])).toThrow(AuthorizationError);

    // Unauthenticated user
    expect(() => requireRole(null, ["CITIZEN"])).toThrow(AuthorizationError);
  });

  it("should prevent IDOR by asserting resource ownership", () => {
    // Current user owns resource
    expect(() =>
      assertOwnership("usr-citizen-1", citizenUser.id, "credential")
    ).not.toThrow();

    // Current user attempts to access another user's resource
    expect(() =>
      assertOwnership("usr-citizen-other", citizenUser.id, "credential")
    ).toThrow(AuthorizationError);
  });
});
