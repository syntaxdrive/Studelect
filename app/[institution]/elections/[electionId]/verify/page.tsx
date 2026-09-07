"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { MOCK_ELECTIONS } from "@/lib/mock-data";
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Lock,
} from "lucide-react";

export default function VerifyReceiptPage({
  params,
}: {
  params: Promise<{ institution: string; electionId: string }>;
}) {
  const resolvedParams = use(params);
  const election =
    MOCK_ELECTIONS.find((e) => e.id === resolvedParams.electionId) ||
    MOCK_ELECTIONS[0];

  const [searchCode, setSearchCode] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    found: boolean;
    blockNumber?: number;
    timestamp?: string;
    blockHash?: string;
  } | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    setHasSearched(true);
    const cleaned = searchCode.trim().toUpperCase();
    if (cleaned.startsWith("SE-") || cleaned.length >= 8) {
      setVerificationResult({
        found: true,
        blockNumber: 845,
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toLocaleString("en-NG"),
        blockHash: "0x8f2b3a9c7d1e0f4a5b6c7d8e9f0a1b2c3d4e5f6a",
      });
    } else {
      setVerificationResult({
        found: false,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <Link
          href={`/${resolvedParams.institution}`}
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Campus Portal</span>
        </Link>
        <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Public Audit Ledger
        </span>
        <h1 className="text-xl font-bold text-zinc-900 mt-0.5">
          Verify Cast Ballot Inclusion
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Search your anonymous receipt hash to verify that your ballot is counted in the official tally.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm space-y-4">
        <form onSubmit={handleVerify} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold uppercase text-zinc-700 mb-1">
              Receipt Hash
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. SE-8K2P-9M4Q-7B1X"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 rounded-md border border-zinc-300 focus:ring-1 focus:ring-zinc-900 focus:outline-none uppercase font-mono font-medium"
                required
              />
              <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white font-medium transition text-xs"
          >
            Search Ledger
          </button>
        </form>

        <div className="pt-2 border-t border-zinc-100 flex items-center gap-2 text-[11px]">
          <span className="text-zinc-400">Sample code:</span>
          <button
            type="button"
            onClick={() => setSearchCode("SE-8K2P-9M4Q-7B1X")}
            className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-mono font-semibold hover:bg-zinc-200"
          >
            SE-8K2P-9M4Q-7B1X
          </button>
        </div>
      </div>

      {hasSearched && verificationResult && (
        <div>
          {verificationResult.found ? (
            <div className="p-5 rounded-lg bg-zinc-50 border border-zinc-300 space-y-4 text-xs">
              <div className="flex items-center gap-2 font-bold text-zinc-900">
                <CheckCircle2 className="w-5 h-5 text-zinc-900" />
                <span>Ballot Inclusion Confirmed</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-zinc-700">
                <div>
                  <span className="text-zinc-500 block">Ledger Block</span>
                  <span className="font-mono font-bold">#{verificationResult.blockNumber}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Timestamp</span>
                  <span className="font-mono">{verificationResult.timestamp}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-zinc-500 block">Block Hash</span>
                  <span className="font-mono text-[10px] text-zinc-800 break-all">{verificationResult.blockHash}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200 text-zinc-500 text-[11px] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-zinc-600" />
                <span>Ballot choices remain completely private and decoupled from voter identity.</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Receipt Hash Not Found</p>
                <p className="text-zinc-600 mt-0.5">Please check the code entered against your official slip.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
