"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { getInstitutionBySlug } from "@/lib/db/institutions";
import { getElectionsByInstitution } from "@/lib/db/elections";
import { lookupStudentStatusAction } from "@/app/actions/student-register";
import {
  Vote,
  BarChart3,
  Search,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Key,
  UserPlus,
  Building2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Lock,
} from "lucide-react";

export default function CampusHubPage({
  params,
}: {
  params: Promise<{ institution: string }>;
}) {
  const resolvedParams = use(params);
  const instSlug = (resolvedParams?.institution || "ui").toLowerCase();
  const [institution, setInstitution] = useState<any>(null);
  const [elections, setElections] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"ELECTIONS" | "CHECK_PIN" | "VERIFY_RECEIPT">("ELECTIONS");

  // Student PIN & Status Lookup State
  const [lookupMatric, setLookupMatric] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const inst = await getInstitutionBySlug(instSlug);
      const elecs = await getElectionsByInstitution(instSlug);
      setInstitution(inst);
      setElections(elecs);
    }
    loadData();
  }, [instSlug]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupMatric.trim()) return;

    setIsLookingUp(true);
    setLookupError(null);
    setLookupResult(null);

    const res = await lookupStudentStatusAction({
      institutionSlug: resolvedParams.institution,
      matricNo: lookupMatric.trim(),
    });

    setIsLookingUp(false);

    if (res.success && res.student) {
      setLookupResult(res.student);
    } else {
      setLookupError(res.message || "Matriculation number not found.");
    }
  };

  if (!institution) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-xs text-zinc-500">
        Loading campus workspace...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Campus Branded Header */}
      <div className="border-b border-zinc-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={`/logos/${institution.slug}.svg`}
            alt={institution.name}
            className="w-14 h-14 object-contain flex-shrink-0"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800">
                {institution.code}
              </span>
              <span className="text-xs text-zinc-500">Official Student Election Portal</span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">{institution.name}</h1>
            <p className="text-xs text-zinc-500">{institution.tagline}</p>
          </div>
        </div>

        {/* Student-Focused Action Header */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("CHECK_PIN")}
            className="px-3.5 py-2 rounded-lg border border-zinc-300 text-zinc-700 hover:bg-zinc-50 transition flex items-center gap-1.5 font-semibold"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
            <span>Verify Voter Status</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ELECTIONS")}
            className="px-3.5 py-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Vote className="w-3.5 h-3.5" />
            <span>Choose Association & Vote ({elections.length})</span>
          </button>
        </div>
      </div>

      {/* How to Vote Quick Guide Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-xl bg-zinc-900 text-white text-xs shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center font-bold text-xs flex-shrink-0 text-white">
            1
          </div>
          <div>
            <p className="font-bold text-white text-sm">Select Your Association</p>
            <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
              Click your department (NACOS), faculty (NESA), or SUG poll below.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center font-bold text-xs flex-shrink-0 text-white">
            2
          </div>
          <div>
            <p className="font-bold text-white text-sm">Register / Enter PIN</p>
            <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
              First-time voters get their organization-scoped PIN directly on that page.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center font-bold text-xs flex-shrink-0 text-white">
            3
          </div>
          <div>
            <p className="font-bold text-white text-sm">Cast & Track Receipt</p>
            <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
              Submit your anonymous vote and copy your cryptographic receipt hash.
            </p>
          </div>
        </div>
      </div>

      {/* Campus Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-2 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("ELECTIONS")}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === "ELECTIONS"
              ? "bg-zinc-900 text-white shadow-xs"
              : "text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          <Vote className="w-4 h-4" />
          <span>Active Association Elections ({elections.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("CHECK_PIN")}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === "CHECK_PIN"
              ? "bg-zinc-900 text-white shadow-xs"
              : "text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Lookup My PIN & Dues</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("VERIFY_RECEIPT")}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === "VERIFY_RECEIPT"
              ? "bg-zinc-900 text-white shadow-xs"
              : "text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Verify Ballot Receipt</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACTIVE ASSOCIATION ELECTIONS */}
      {/* ========================================================================= */}
      {activeTab === "ELECTIONS" && (
        <div className="space-y-4">
          {elections.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-center space-y-2">
              <Vote className="w-8 h-8 text-zinc-400 mx-auto" />
              <div>
                <p className="text-sm font-bold text-zinc-800">No Active Elections Currently Open</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Elections for SUG, Faculty, Department, and Halls will appear here when opened by your ELCOM.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {elections.map((election) => {
                const orgCodeSlug = election.orgId
                  .replace(/^org-/, "")
                  .replace(new RegExp(`^${institution.slug}-`, "i"), "")
                  .toLowerCase() || "nesa";
                const orgPortalUrl = `/${institution.slug}/${orgCodeSlug}`;

                return (
                  <div
                    key={election.id}
                    className="p-5 rounded-xl bg-white border border-zinc-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-zinc-300 transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                            election.status === "LIVE"
                              ? "bg-zinc-900 text-white border border-zinc-900"
                              : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                          }`}
                        >
                          {election.status === "LIVE" ? "Polls Open" : "Upcoming"}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500">
                          {election.academicSession}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-800 uppercase">
                            /{institution.slug}/{orgCodeSlug}
                          </span>
                          <span className="text-[11px] font-semibold text-zinc-500 uppercase">
                            {election.orgName}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-zinc-900 mt-1">
                          {election.title}
                        </h3>
                        <p className="text-xs text-zinc-500 line-clamp-2 mt-1">
                          {election.description}
                        </p>
                      </div>

                      <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] text-zinc-600">
                        {election.requireDuesPayment && (
                          <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                            Dues Required
                          </span>
                        )}
                        {election.requireFullTimeOnly && (
                          <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                            Full-Time Only
                          </span>
                        )}
                        {election.requireGoodDisciplinaryStanding && (
                          <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                            SDC Cleared
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                      <Link
                        href={orgPortalUrl}
                        className="px-3.5 py-2 rounded-lg border border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold transition flex items-center gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Get PIN / Info</span>
                      </Link>

                      <Link
                        href={orgPortalUrl}
                        className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Vote className="w-3.5 h-3.5" />
                        <span>Enter Polling Booth</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CHECK VOTER STATUS & CLEARANCE (SECURE / NO PUBLIC PIN)           */}
      {/* ========================================================================= */}
      {activeTab === "CHECK_PIN" && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4 text-xs">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-zinc-900" />
                <h2 className="text-base font-bold text-zinc-900">
                  Student Voter Status & Accreditation Lookup
                </h2>
              </div>
              <p className="text-zinc-500 text-xs mt-0.5">
                Enter your matriculation number to verify your electoral enrollment and dues standing.
              </p>
            </div>

            <form onSubmit={handleLookup} className="space-y-3">
              <div>
                <label className="block font-semibold uppercase text-zinc-700 mb-1">
                  Matriculation / Registration Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 21/52HA045"
                  value={lookupMatric}
                  onChange={(e) => setLookupMatric(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 focus:ring-1 focus:ring-zinc-900 focus:outline-none uppercase font-mono text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLookingUp}
                className="w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-bold transition text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isLookingUp ? "Checking Electoral Roll..." : "Verify Voter Status"}</span>
              </button>
            </form>

            {lookupError && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}

            {lookupResult && (
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-4 pt-3">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <div>
                    <h3 className="font-bold text-zinc-900 text-sm">{lookupResult.fullName}</h3>
                    <span className="font-mono text-zinc-500 text-xs">{lookupResult.matricNo}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 text-[10px] font-mono">
                    {lookupResult.department} • {lookupResult.level}L
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-white border border-zinc-200 flex items-center justify-between">
                    <span className="text-zinc-600 font-medium">Association Dues:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        lookupResult.duesPaid
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {lookupResult.duesPaid ? "✓ PAID" : "✗ UNPAID"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-zinc-200 flex items-center justify-between">
                    <span className="text-zinc-600 font-medium">Ballot Access:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        lookupResult.disciplinaryStatus === "GOOD_STANDING"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {lookupResult.disciplinaryStatus === "GOOD_STANDING"
                        ? "✓ CLEARED"
                        : "✗ SUSPENDED"}
                    </span>
                  </div>
                </div>

                {/* Privacy & Anti-Impersonation Box */}
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      <span>Voter PIN Security Shield</span>
                    </div>
                    <span className="font-mono text-xs font-bold bg-amber-200/70 px-2 py-0.5 rounded text-amber-950">
                      {lookupResult.maskedPin || "PIN-••••-••••"}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    <strong>Ballot Privacy Protected:</strong> To prevent third-party impersonation, access PINs are confidential and are never revealed on public lookup screens. Use the PIN you received upon profile activation or contact your ELCOM commissioner if you misplaced it.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("ELECTIONS")}
                  className="w-full py-2.5 rounded-lg bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Vote className="w-3.5 h-3.5" />
                  <span>Choose Association & Proceed to Vote →</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: VERIFY BALLOT RECEIPT */}
      {/* ========================================================================= */}
      {activeTab === "VERIFY_RECEIPT" && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4 text-xs">
            <div>
              <h2 className="text-base font-bold text-zinc-900">
                Cryptographic Audit Ledger Verification
              </h2>
              <p className="text-zinc-500 text-xs mt-0.5">
                Verify that your ballot has been counted in the immutable Merkle tree without revealing your vote.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold uppercase text-zinc-700 mb-1">
                  Ballot Receipt Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. SE-8K2P-9M4Q-7B1X"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 focus:ring-1 focus:ring-zinc-900 focus:outline-none uppercase font-mono text-sm"
                />
              </div>

              <button
                type="button"
                className="w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-bold transition text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify on Public Ledger</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
