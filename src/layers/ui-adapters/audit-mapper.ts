export function formatAuditAction(action: string): string {
  const map: Record<string, string> = {
    USER_LOGIN: "User Sign In",
    USER_LOGOUT: "User Sign Out",
    ISSUE_CREDENTIAL: "Issue Verifiable Credential",
    REVOKE_CREDENTIAL: "Revoke Credential",
    CONSENT_SHARE: "Consent & Share Proof",
    VERIFY_PROOF: "Verify Credential Presentation",
    LEDGER_OUTAGE_TOGGLE: "Toggle Ledger Outage Simulation",
    INTEGRITY_CHECK: "Verify Ledger Hash-Chain Integrity",
  };
  return map[action] || action.replace(/_/g, " ");
}
