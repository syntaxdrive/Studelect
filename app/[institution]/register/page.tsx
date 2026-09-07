"use client";

import React, { use } from "react";
import Link from "next/link";
import { ArrowLeft, Vote, ArrowRight, ShieldCheck } from "lucide-react";

export default function StudentRegisterRedirectPage({
  params,
}: {
  params: Promise<{ institution: string }>;
}) {
  const resolvedParams = use(params);
  const instSlug = (resolvedParams?.institution || "ui").toLowerCase();

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-900 mx-auto flex items-center justify-center">
        <Vote className="w-6 h-6" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-zinc-900">
          Select Your Association to Register
        </h1>
        <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
          Student voter profiles and PINs are issued directly by specific associations (e.g. NACOS, NESA, SUG). Please select your association to activate your profile with an organization-scoped PIN.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3 text-xs">
        <span className="font-semibold text-zinc-700 block text-[11px] uppercase">
          Quick Association Links:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Link
            href={`/${instSlug}/nacos`}
            className="p-3 rounded-lg bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-xs transition text-left flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-zinc-900">NACOS Computer Science</p>
              <p className="font-mono text-[10px] text-zinc-500">/{instSlug}/nacos</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400" />
          </Link>

          <Link
            href={`/${instSlug}/nesa`}
            className="p-3 rounded-lg bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-xs transition text-left flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-zinc-900">NESA Economics</p>
              <p className="font-mono text-[10px] text-zinc-500">/{instSlug}/nesa</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400" />
          </Link>
        </div>
      </div>

      <div>
        <Link
          href={`/${instSlug}`}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 font-semibold underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>View All Campus Associations →</span>
        </Link>
      </div>
    </div>
  );
}
