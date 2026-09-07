"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PRICING_PLANS,
  MOCK_INVOICES,
  TenantInvoice,
  PricingPlan,
} from "@/lib/billing/payment-engine";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Building2,
  DollarSign,
  Download,
  Plus,
  RefreshCw,
  Search,
  Check,
} from "lucide-react";

export default function SuperAdminBillingPage() {
  const [invoices, setInvoices] = useState<TenantInvoice[]>(MOCK_INVOICES);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PAID" | "PENDING_APPROVAL">("ALL");

  const totalCollected = invoices.reduce(
    (sum, inv) => (inv.status === "PAID" ? sum + inv.amountNGN : sum),
    0
  );

  const pendingAmount = invoices.reduce(
    (sum, inv) => (inv.status === "PENDING_APPROVAL" ? sum + inv.amountNGN : sum),
    0
  );

  const handleApproveBankTransfer = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: "PAID",
              paidAt: new Date().toISOString(),
            }
          : inv
      )
    );
  };

  const filteredInvoices = invoices.filter((inv) =>
    filterStatus === "ALL" ? true : inv.status === filterStatus
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <Link
            href="/super-admin"
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Super Admin Hub</span>
          </Link>
          <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Revenue & Settlements
          </span>
          <h1 className="text-2xl font-bold text-zinc-900 mt-0.5">
            Tenant Billing & Licensing Management
          </h1>
        </div>

        <span className="px-3 py-1.5 rounded-md bg-zinc-100 text-zinc-800 text-xs font-mono font-medium">
          Paystack • Flutterwave • Direct Settlement
        </span>
      </div>

      {/* Revenue Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-white border border-zinc-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase">
            Total Revenue Settled
          </span>
          <p className="text-2xl font-bold text-zinc-900">
            ₦{totalCollected.toLocaleString()}
          </p>
          <p className="text-[11px] text-zinc-500">Paid to platform bank account</p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-zinc-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase">
            Pending Bank Approvals
          </span>
          <p className="text-2xl font-bold text-zinc-900">
            ₦{pendingAmount.toLocaleString()}
          </p>
          <p className="text-[11px] text-zinc-500">Union bank transfer drafts</p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-zinc-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase">
            Payment Gateway Status
          </span>
          <div className="flex items-center gap-2 pt-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-bold text-zinc-900">Paystack (Live)</span>
          </div>
          <p className="text-[11px] text-zinc-500">Auto-split settlements enabled</p>
        </div>
      </div>

      {/* Pricing Tiers Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
          <h2 className="text-base font-bold text-zinc-900">Active Pricing Tiers</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className="p-5 rounded-lg bg-white border border-zinc-200 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800">
                  {plan.targetTier}
                </span>
                <h3 className="text-base font-bold text-zinc-900">{plan.name}</h3>
                <p className="text-xl font-bold text-zinc-900 font-mono">
                  ₦{plan.priceNGN.toLocaleString()}
                  <span className="text-xs font-normal text-zinc-500"> / election</span>
                </p>
                <p className="text-xs text-zinc-500 font-mono">
                  Max: {plan.voterLimit.toLocaleString()} voters
                </p>

                <ul className="space-y-1 text-xs text-zinc-600 pt-2 border-t border-zinc-100">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="text-zinc-900 text-xs">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices & Union Bank Transfer Table */}
      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Tenant Invoices & Payments</h2>
            <p className="text-xs text-zinc-500">
              Manage automated Paystack settlements and manual departmental union bank transfers.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setFilterStatus("ALL")}
              className={`px-2.5 py-1 rounded-md transition ${
                filterStatus === "ALL" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              All Invoices
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("PAID")}
              className={`px-2.5 py-1 rounded-md transition ${
                filterStatus === "PAID" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              Paid
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("PENDING_APPROVAL")}
              className={`px-2.5 py-1 rounded-md transition ${
                filterStatus === "PENDING_APPROVAL" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              Pending Approval
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-600 font-semibold border-y border-zinc-200">
              <tr>
                <th className="p-3">Invoice ID</th>
                <th className="p-3">Institution & Org</th>
                <th className="p-3">Election Title</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Gateway / Ref</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-50">
                  <td className="p-3 font-mono font-bold text-zinc-900">{inv.id}</td>
                  <td className="p-3">
                    <span className="font-bold text-zinc-900 block">{inv.orgName}</span>
                    <span className="text-zinc-500 text-[11px]">{inv.institutionName}</span>
                  </td>
                  <td className="p-3 text-zinc-800">{inv.electionTitle}</td>
                  <td className="p-3 font-mono font-bold text-zinc-900">
                    ₦{inv.amountNGN.toLocaleString()}
                  </td>
                  <td className="p-3 font-mono text-[11px]">
                    <span className="text-zinc-900 font-semibold block">{inv.paymentMethod}</span>
                    <span className="text-zinc-500">{inv.paymentReference}</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        inv.status === "PAID"
                          ? "bg-zinc-900 text-white"
                          : "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}
                    >
                      {inv.status === "PAID" ? "PAID" : "PENDING APPROVAL"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {inv.status === "PENDING_APPROVAL" ? (
                      <button
                        type="button"
                        onClick={() => handleApproveBankTransfer(inv.id)}
                        className="px-2.5 py-1 rounded bg-zinc-900 text-white text-[11px] font-medium hover:bg-zinc-800 transition"
                      >
                        Approve Transfer
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="text-zinc-500 hover:text-zinc-900 text-[11px] font-mono inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
