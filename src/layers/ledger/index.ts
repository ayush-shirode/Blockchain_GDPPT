import { LedgerAdapter } from "./types";
import { SimulatedLedger } from "./simulated-ledger";
import { FabricLedger } from "./fabric-stub";

export * from "./types";
export * from "./simulated-ledger";
export * from "./fabric-stub";

const simulatedLedgerInstance = new SimulatedLedger();
const fabricLedgerInstance = new FabricLedger();

export function getLedgerAdapter(): LedgerAdapter {
  const mode = process.env.LEDGER_MODE;
  if (mode === "fabric") {
    return fabricLedgerInstance;
  }
  return simulatedLedgerInstance;
}
