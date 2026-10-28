import React from "react";
import { CodeBlock } from "./CodeBlock";

interface ApiEndpointProps {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  role: "PUBLIC" | "CITIZEN" | "ISSUER" | "VERIFIER" | "ADMIN" | "ANY";
  description: string;
  requestExample?: string;
  responseExample: string;
  errorCodes?: { code: string; status: number; description: string }[];
}

export function ApiEndpoint({
  method,
  path,
  role,
  description,
  requestExample,
  responseExample,
  errorCodes,
}: ApiEndpointProps) {
  const methodColor = {
    GET: "bg-info-bg text-info border-info/30",
    POST: "bg-success-bg text-success border-success/30",
    PUT: "bg-warning-bg text-warning border-warning/30",
    DELETE: "bg-danger-bg text-danger border-danger/30",
  }[method];

  return (
    <div className="border border-border rounded bg-surface p-5 my-6 text-sm">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span
          className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${methodColor}`}
        >
          {method}
        </span>
        <code className="font-mono text-sm font-semibold text-text">{path}</code>
        <span className="ml-auto text-xs font-mono font-medium px-2 py-0.5 rounded bg-bg text-text-muted border border-border">
          Role: {role}
        </span>
      </div>

      <p className="text-text-muted text-xs leading-relaxed mb-4">
        {description}
      </p>

      {requestExample && (
        <div className="mb-4">
          <span className="text-xs font-semibold text-text uppercase tracking-wide block mb-1">
            Request Body (JSON)
          </span>
          <CodeBlock code={requestExample} title="Request Payload" />
        </div>
      )}

      <div className="mb-4">
        <span className="text-xs font-semibold text-text uppercase tracking-wide block mb-1">
          Response Body (JSON)
        </span>
        <CodeBlock code={responseExample} title="200 OK Response" />
      </div>

      {errorCodes && errorCodes.length > 0 && (
        <div>
          <span className="text-xs font-semibold text-text uppercase tracking-wide block mb-2">
            Possible Error Codes
          </span>
          <div className="border border-border rounded overflow-hidden">
            <table className="w-full text-left text-xs divide-y divide-border">
              <thead className="bg-bg text-text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Error Code</th>
                  <th className="px-3 py-2 font-medium">Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {errorCodes.map((err, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 font-mono">{err.status}</td>
                    <td className="px-3 py-2 font-mono font-semibold text-danger">
                      {err.code}
                    </td>
                    <td className="px-3 py-2 text-text-muted">
                      {err.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
