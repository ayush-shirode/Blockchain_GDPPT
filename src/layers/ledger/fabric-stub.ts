import {
  LedgerAdapter,
  LedgerReceipt,
  LedgerEventRecord,
  EventQuery,
  Page,
} from "./types";

/**
 * Hyperledger Fabric Stub implementation.
 * As documented in spec section 6.3, this stub documents the enterprise
 * permissioned blockchain integration points while throwing an explicit
 * "not configured" error in this prototype.
 */
export class FabricLedger implements LedgerAdapter {
  readonly mode = "fabric" as const;

  async health(): Promise<{ status: "up" | "down"; checkedAt: string }> {
    return {
      status: "down",
      checkedAt: new Date().toISOString(),
    };
  }

  async recordIssuance(): Promise<LedgerReceipt> {
    throw new Error(
      "FABRIC_NOT_CONFIGURED: Hyperledger Fabric network connection profile is not configured in this prototype environment."
    );
  }

  async recordRevocation(): Promise<LedgerReceipt> {
    throw new Error(
      "FABRIC_NOT_CONFIGURED: Hyperledger Fabric network connection profile is not configured in this prototype environment."
    );
  }

  async getStatus(): Promise<{
    status: "ACTIVE" | "REVOKED";
    txRef: string;
    at: string;
  }> {
    throw new Error(
      "FABRIC_NOT_CONFIGURED: Hyperledger Fabric network connection profile is not configured in this prototype environment."
    );
  }

  async listEvents(): Promise<Page<LedgerEventRecord>> {
    throw new Error(
      "FABRIC_NOT_CONFIGURED: Hyperledger Fabric network connection profile is not configured in this prototype environment."
    );
  }

  async verifyIntegrity(): Promise<{
    ok: boolean;
    checked: number;
    firstBrokenIndex?: number;
  }> {
    throw new Error(
      "FABRIC_NOT_CONFIGURED: Hyperledger Fabric network connection profile is not configured in this prototype environment."
    );
  }
}
