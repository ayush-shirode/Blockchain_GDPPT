export interface LedgerReceipt {
  txRef: string;
  index: number;
  hash: string;
  prevHash: string;
  timestamp: string;
}

export interface LedgerEventRecord {
  index: number;
  eventType: "ISSUANCE" | "REVOCATION";
  recordId: string;
  issuerDid: string;
  payloadHash: string;
  prevHash: string;
  hash: string;
  createdAt: Date;
}

export interface EventQuery {
  page?: number;
  pageSize?: number;
  eventType?: string;
  issuerDid?: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LedgerAdapter {
  mode: "simulated" | "fabric";
  recordIssuance(e: {
    credentialId: string;
    credentialHash: string;
    issuerDid: string;
  }): Promise<LedgerReceipt>;
  recordRevocation(e: {
    credentialId: string;
    issuerDid: string;
    reasonCode: string;
  }): Promise<LedgerReceipt>;
  getStatus(
    credentialId: string
  ): Promise<{ status: "ACTIVE" | "REVOKED"; txRef: string; at: string }>;
  listEvents(q: EventQuery): Promise<Page<LedgerEventRecord>>;
  verifyIntegrity(): Promise<{
    ok: boolean;
    checked: number;
    firstBrokenIndex?: number;
  }>;
  health(): Promise<{ status: "up" | "down"; checkedAt: string }>;
}
