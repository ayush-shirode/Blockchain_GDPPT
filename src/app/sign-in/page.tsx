"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, KeyRound, ArrowRight, UserCheck } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Banner } from "@/components/ui/Banner";
import { FormField } from "@/components/ui/FormField";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Sign in failed. Check your credentials.");
      }

      const role = data.data?.user?.role;
      switch (role) {
        case "CITIZEN":
          router.push("/citizen");
          break;
        case "ISSUER":
          router.push("/issuer");
          break;
        case "VERIFIER":
          router.push("/verifier");
          break;
        case "ADMIN":
          router.push("/admin");
          break;
        default:
          router.push("/");
          break;
      }
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred during sign in.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("DemoPassword123!");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      <Banner />
      <TopBar user={null} />

      <main id="main-content" className="flex-1 max-w-portal mx-auto w-full px-4 sm:px-6 py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Demonstration Sign In" },
          ]}
        />

        <div className="max-w-md mx-auto my-6">
          <div className="border border-border rounded bg-surface p-6 shadow-dialog">
            <div className="flex items-center gap-2 mb-2 text-primary font-bold text-sm">
              <KeyRound className="w-5 h-5 text-primary" aria-hidden="true" />
              <span>Portal Sign In</span>
            </div>
            <h1 className="text-xl font-bold text-text mb-1">Access Demonstration Portal</h1>
            <p className="text-xs text-text-muted mb-6 leading-relaxed">
              Sign in with one of the pre-seeded synthetic test personas to access role-specific workflows.
            </p>

            {error && (
              <div
                role="alert"
                className="mb-4 p-3 rounded border border-danger/40 bg-danger-bg text-danger text-xs font-medium"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField id="email" label="Email Address" required>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.gov"
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text placeholder:text-text-muted"
                />
              </FormField>

              <FormField id="password" label="Password" required>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text placeholder:text-text-muted"
                />
              </FormField>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? "Signing in..." : "Sign in to Portal"}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>

            {/* Quick-Fill Synthetic Personas */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-text mb-3">
                <UserCheck className="w-4 h-4 text-primary" aria-hidden="true" />
                <span>Quick-Select Demo Personas:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickFill("asha.patil@example.gov")}
                  className="p-2 text-left rounded border border-border bg-bg hover:bg-surface hover:border-primary transition-colors"
                >
                  <strong className="block text-text font-semibold">Asha Patil</strong>
                  <span className="text-[11px] text-text-muted">Citizen (Active Credentials)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill("rohan.deshmukh@example.gov")}
                  className="p-2 text-left rounded border border-border bg-bg hover:bg-surface hover:border-primary transition-colors"
                >
                  <strong className="block text-text font-semibold">Rohan Deshmukh</strong>
                  <span className="text-[11px] text-text-muted">Citizen (Address & Rogue Cred)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill("issuer.muni@example.gov")}
                  className="p-2 text-left rounded border border-border bg-bg hover:bg-surface hover:border-primary transition-colors"
                >
                  <strong className="block text-text font-semibold">Municipal Corp</strong>
                  <span className="text-[11px] text-text-muted">Issuer (Identity & Address)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill("issuer.univ@example.gov")}
                  className="p-2 text-left rounded border border-border bg-bg hover:bg-surface hover:border-primary transition-colors"
                >
                  <strong className="block text-text font-semibold">State University</strong>
                  <span className="text-[11px] text-text-muted">Issuer (Student Credentials)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill("verifier.hospital@example.gov")}
                  className="p-2 text-left rounded border border-border bg-bg hover:bg-surface hover:border-primary transition-colors"
                >
                  <strong className="block text-text font-semibold">City Hospital</strong>
                  <span className="text-[11px] text-text-muted">Verifier (Age Verification)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill("admin.auditor@example.gov")}
                  className="p-2 text-left rounded border border-border bg-bg hover:bg-surface hover:border-primary transition-colors"
                >
                  <strong className="block text-text font-semibold">Demo Auditor</strong>
                  <span className="text-[11px] text-text-muted">Administrator (Ledger & Audit)</span>
                </button>
              </div>
              <p className="mt-3 text-[11px] text-text-muted text-center">
                Default demonstration password: <code className="font-mono bg-bg px-1 py-0.5 rounded">DemoPassword123!</code>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-surface py-6 px-4 text-xs text-text-muted text-center no-print">
        <span>Digital Identity & E-Governance Demonstration Prototype</span>
      </footer>
    </div>
  );
}
