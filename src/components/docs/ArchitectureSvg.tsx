import React from "react";

export function ArchitectureSvg({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full overflow-x-auto border border-border rounded bg-surface p-6 my-6 ${className}`}>
      <div className="min-w-[680px]">
        <svg
          viewBox="0 0 760 520"
          className="w-full h-auto text-text"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Canvas */}
          <rect width="760" height="520" fill="#FFFFFF" rx="4" />

          {/* Title */}
          <text x="380" y="28" textAnchor="middle" fontSize="14" fontWeight="700" fill="#17202E">
            Five-Layer Architectural Model & Unidirectional Control Flow
          </text>
          <text x="380" y="46" textAnchor="middle" fontSize="11" fill="#4B5565">
            Strict isolation: Layers call downward only. UI never touches private keys or the ledger directly.
          </text>

          {/* LAYER 5: USER INTERFACE */}
          <g transform="translate(40, 65)">
            <rect width="680" height="65" rx="4" fill="#F6F7F9" stroke="#17407A" strokeWidth="2" />
            <rect width="130" height="22" rx="3" fill="#17407A" x="12" y="10" />
            <text x="77" y="25" textAnchor="middle" fontSize="10" fontWeight="700" fill="#FFFFFF">
              LAYER 5: USER INTERFACE
            </text>
            <text x="155" y="25" fontSize="11" fontWeight="600" fill="#17202E">
              Presentation & Task Portals (Next.js App Router)
            </text>
            {/* Sub components */}
            <rect x="12" y="38" width="120" height="20" rx="3" fill="#FFFFFF" stroke="#D5DBE3" />
            <text x="72" y="52" textAnchor="middle" fontSize="10" fill="#17202E">Citizen Wallet</text>

            <rect x="142" y="38" width="120" height="20" rx="3" fill="#FFFFFF" stroke="#D5DBE3" />
            <text x="202" y="52" textAnchor="middle" fontSize="10" fill="#17202E">Issuer Console</text>

            <rect x="272" y="38" width="120" height="20" rx="3" fill="#FFFFFF" stroke="#D5DBE3" />
            <text x="332" y="52" textAnchor="middle" fontSize="10" fill="#17202E">Verifier Portal</text>

            <rect x="402" y="38" width="120" height="20" rx="3" fill="#FFFFFF" stroke="#D5DBE3" />
            <text x="462" y="52" textAnchor="middle" fontSize="10" fill="#17202E">Admin & Ledger Explorer</text>

            <rect x="532" y="38" width="136" height="20" rx="3" fill="#FFFFFF" stroke="#D5DBE3" />
            <text x="600" y="52" textAnchor="middle" fontSize="10" fill="#17202E">Documentation Hub (/docs)</text>
          </g>

          {/* Arrow 5 -> 4 */}
          <path d="M 380 130 L 380 150" stroke="#17407A" strokeWidth="2" strokeDasharray="3 3" />
          <polygon points="376,148 380,154 384,148" fill="#17407A" />

          {/* LAYER 4: API GATEWAY */}
          <g transform="translate(40, 155)">
            <rect width="680" height="65" rx="4" fill="#F6F7F9" stroke="#D5DBE3" strokeWidth="1.5" />
            <rect width="130" height="22" rx="3" fill="#4B5565" x="12" y="10" />
            <text x="77" y="25" textAnchor="middle" fontSize="10" fontWeight="700" fill="#FFFFFF">
              LAYER 4: API GATEWAY
            </text>
            <text x="155" y="25" fontSize="11" fontWeight="600" fill="#17202E">
              Route Handlers, Authentication & Input Validation
            </text>
            {/* Sub components */}
            <rect x="12" y="38" width="150" height="20" rx="3" fill="#FFFFFF" stroke="#D5DBE3" />
            <text x="87" y="52" textAnchor="middle" fontSize="10" fill="#17202E">HTTP-only Session Cookies</text>

            <rect x="172" y="38" width="150" height="20" rx="3" fill="#FFFFFF" stroke="#D5DBE3" />
            <text x="247" y="52" textAnchor="middle" fontSize="10" fill="#17202E">Zod Schema Validation</text>

            <rect x="332" y="38" width="160" height="20" rx="3" fill="#FFFFFF" stroke="#D5DBE3" />
            <text x="412" y="52" textAnchor="middle" fontSize="10" fill="#17202E">Sliding Window Rate Limiter</text>

            <rect x="502" y="38" width="166" height="20" rx="3" fill="#FFFFFF" stroke="#D5DBE3" />
            <text x="585" y="52" textAnchor="middle" fontSize="10" fill="#17202E">Standard Error Envelope</text>
          </g>

          {/* Arrow 4 -> 3 */}
          <path d="M 380 220 L 380 240" stroke="#17407A" strokeWidth="2" strokeDasharray="3 3" />
          <polygon points="376,238 380,244 384,238" fill="#17407A" />

          {/* LAYER 3: POLICY / SMART-CONTRACT */}
          <g transform="translate(40, 245)">
            <rect width="680" height="65" rx="4" fill="#F6F7F9" stroke="#D5DBE3" strokeWidth="1.5" />
            <rect width="130" height="22" rx="3" fill="#4B5565" x="12" y="10" />
            <text x="77" y="25" textAnchor="middle" fontSize="10" fontWeight="700" fill="#FFFFFF">
              LAYER 3: POLICY
            </text>
            <text x="155" y="25" fontSize="11" fontWeight="600" fill="#17202E">
              Verification Rules, Access Policies & Audit Logging
            </text>
            {/* Sub components */}
            <rect x="12" y="38" width="200" height="20" rx="3" fill="#FFFFFF" stroke="#D5DBE3" />
            <text x="112" y="52" textAnchor="middle" fontSize="10" fill="#17202E">6-Step Verification Engine (Spec 5.1)</text>

            <rect x="222" y="38" width="190" height="20" rx="3" fill="#FFFFFF" stroke="#D5DBE3" />
            <text x="317" y="52" textAnchor="middle" fontSize="10" fill="#17202E">Decision Table Precedence (Spec 5.2)</text>

            <rect x="422" y="38" width="120" height="20" rx="3" fill="#FFFFFF" stroke="#D5DBE3" />
            <text x="482" y="52" textAnchor="middle" fontSize="10" fill="#17202E">RBAC & IDOR Guards</text>

            <rect x="552" y="38" width="116" height="20" rx="3" fill="#FFFFFF" stroke="#D5DBE3" />
            <text x="610" y="52" textAnchor="middle" fontSize="10" fill="#17202E">Off-Chain Audit Trail</text>
          </g>

          {/* Arrow 3 -> 2 */}
          <path d="M 380 310 L 380 330" stroke="#17407A" strokeWidth="2" strokeDasharray="3 3" />
          <polygon points="376,328 380,334 384,328" fill="#17407A" />

          {/* LAYER 2: IDENTITY LAYER */}
          <g transform="translate(40, 335)">
            <rect width="680" height="65" rx="4" fill="#F6F7F9" stroke="#D5DBE3" strokeWidth="1.5" />
            <rect width="130" height="22" rx="3" fill="#4B5565" x="12" y="10" />
            <text x="77" y="25" textAnchor="middle" fontSize="10" fontWeight="700" fill="#FFFFFF">
              LAYER 2: IDENTITY
            </text>
            <text x="155" y="25" fontSize="11" fontWeight="600" fill="#17202E">
              Decentralized Identifiers & Cryptographic Credentials
            </text>
            {/* Sub components */}
            <rect x="12" y="38" width="140" height="20" rx="3" fill="#FFFFFF" stroke="#D5DBE3" />
            <text x="82" y="52" textAnchor="middle" fontSize="10" fill="#17202E">Issuer Trust Registry</text>

            <rect x="162" y="38" width="160" height="20" rx="3" fill="#FFFFFF" stroke="#D5DBE3" />
            <text x="242" y="52" textAnchor="middle" fontSize="10" fill="#17202E">Ed25519 Signing (jose)</text>

            <rect x="332" y="38" width="150" height="20" rx="3" fill="#FFFFFF" stroke="#D5DBE3" />
            <text x="407" y="52" textAnchor="middle" fontSize="10" fill="#17202E">W3C VC-JWT Data Model</text>

            <rect x="492" y="38" width="176" height="20" rx="3" fill="#FFFFFF" stroke="#D5DBE3" />
            <text x="580" y="52" textAnchor="middle" fontSize="10" fill="#17202E">Salted-Hash SD-JWT (Spec 6.4)</text>
          </g>

          {/* Arrow 2 -> 1 */}
          <path d="M 380 400 L 380 420" stroke="#17407A" strokeWidth="2" strokeDasharray="3 3" />
          <polygon points="376,418 380,424 384,418" fill="#17407A" />

          {/* LAYER 1: BLOCKCHAIN NETWORK & LEDGER */}
          <g transform="translate(40, 425)">
            <rect width="680" height="75" rx="4" fill="#F6F7F9" stroke="#17407A" strokeWidth="2" />
            <rect width="130" height="22" rx="3" fill="#17407A" x="12" y="10" />
            <text x="77" y="25" textAnchor="middle" fontSize="10" fontWeight="700" fill="#FFFFFF">
              LAYER 1: LEDGER
            </text>
            <text x="155" y="25" fontSize="11" fontWeight="600" fill="#17202E">
              Immutable Verification Metadata (LedgerAdapter Interface)
            </text>
            {/* Sub components */}
            <rect x="12" y="38" width="230" height="26" rx="3" fill="#FFFFFF" stroke="#D5DBE3" />
            <text x="127" y="54" textAnchor="middle" fontSize="10" fontWeight="600" fill="#17407A">
              SimulatedLedger (Active)
            </text>
            <text x="127" y="66" textAnchor="middle" fontSize="8" fill="#4B5565">
              Append-only SHA-256 hash-chain + verifyIntegrity()
            </text>

            <rect x="252" y="38" width="190" height="26" rx="3" fill="#FFFFFF" stroke="#D5DBE3" />
            <text x="347" y="54" textAnchor="middle" fontSize="10" fontWeight="600" fill="#17202E">
              FabricLedger (Stub)
            </text>
            <text x="347" y="66" textAnchor="middle" fontSize="8" fill="#4B5565">
              Documented integration (throws &quot;not configured&quot;)
            </text>

            <rect x="452" y="38" width="216" height="26" rx="3" fill="#FFFFFF" stroke="#D5DBE3" />
            <text x="560" y="54" textAnchor="middle" fontSize="10" fontWeight="600" fill="#A3231F">
              Outage Simulator Toggle
            </text>
            <text x="560" y="66" textAnchor="middle" fontSize="8" fill="#4B5565">
              Simulates network partition (&quot;Unable to verify&quot;)
            </text>
          </g>
        </svg>
      </div>
      <p className="mt-3 text-xs text-text-muted text-center font-mono">
        Figure 1: Five-layer model architecture with cryptographic and ledger boundaries.
      </p>
    </div>
  );
}
