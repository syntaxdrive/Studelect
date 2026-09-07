"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  Zap,
  ShieldCheck,
  Users,
  Building2,
  MessageSquare,
  ArrowRight,
  HelpCircle,
  BarChart3,
  FileSpreadsheet,
  Lock,
  Award,
  ChevronDown,
} from "lucide-react";

export default function PricingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2348000000000";

  const getWhatsAppLink = (planName: string, voters: string, price: string) => {
    const text = `Hello StudElect Support, I am an ELCOM Chairman / Student Executive. I would like to activate the ${planName} (${voters} at ${price}) for our upcoming campus election.`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  const plans = [
    {
      id: "micro",
      name: "Micro Tier",
      badge: "Small Depts & Halls",
      voters: "Up to 250 Voters",
      votersCount: 250,
      priceNgn: "15,000",
      description: "Ideal for small academic departments, residential halls, and student clubs.",
      popular: false,
      ctaText: "Choose Micro (₦15k)",
    },
    {
      id: "department",
      name: "Department Pro",
      badge: "Most Popular",
      voters: "Up to 1,000 Voters",
      votersCount: 1000,
      priceNgn: "30,000",
      description: "Perfect for medium to large academic departments conducting annual elections.",
      popular: true,
      ctaText: "Choose Dept Pro (₦30k)",
    },
    {
      id: "faculty",
      name: "Faculty Pro",
      badge: "Full Faculties",
      voters: "Up to 3,000 Voters",
      votersCount: 3000,
      priceNgn: "65,000",
      description: "Designed for full faculties (Science, Law, Engineering, Social Sciences).",
      popular: false,
      ctaText: "Choose Faculty Pro (₦65k)",
    },
    {
      id: "sug",
      name: "SUG / Apex",
      badge: "Campus-Wide",
      voters: "3,000+ / Unlimited",
      votersCount: 35000,
      priceNgn: "150,000+",
      description: "University-wide scale for apex Student Union Governments and Student Representative Councils.",
      popular: false,
      ctaText: "Contact for SUG Plan",
    },
  ];

  const allFeaturesIncluded = [
    "Unlimited Contested Offices & Candidate Profiles with Photos",
    "Treasurer Excel / CSV Dues Compliance Matcher",
    "Decoupled Blind Cryptographic Ballot Tokens (100% Anonymous)",
    "Instant ₦0 PIN Slip Generator & Self-Service Portal Lookup (Zero SMS Fees)",
    "Real-Time Multi-Color Bar Charts & Demographic Turnout Donut Charts",
    "Live Press Room & Observer SHA-256 Merkle Audit Ledger",
    "Cryptographic Single-Vote Enforcement (Zero Multiple Voting)",
    "Official Printable / Exportable Certificate of Return with QR Verification",
    "Dedicated SuperAdmin Setup & Activation in under 15 Minutes",
  ];

  const faqs = [
    {
      q: "How does payment work?",
      a: "StudElect operates on a transparent Pay-Per-Use model. When you click 'Select Plan', you are connected directly to our Platform SuperAdmin on WhatsApp. We discuss your election schedule, you make a direct bank transfer, and your organization is activated on the platform in under 15 minutes.",
    },
    {
      q: "Why is voter capacity the only difference between plans?",
      a: "We believe in zero artificial feature restrictions. Every student organization—from a 100-student department to a 30,000-student SUG—deserves the exact same military-grade cryptographic secrecy, live charts, and dues screening tools. You only pay for the server capacity required for your voter size.",
    },
    {
      q: "What happens if more students register than our plan limit?",
      a: "No problem at all. If your voter registration exceeds your initial tier (e.g. you picked 250 voters but 320 registered), you can simply message the SuperAdmin on WhatsApp to top up your quota with a quick difference payment without interrupting voting.",
    },
    {
      q: "Are there any hidden SMS or telecom charges?",
      a: "None. Competitors charge ₦4–₦6 per SMS that frequently fail due to Nigerian telco DND issues. StudElect uses instant, tamper-proof ₦0 PIN generation slips and direct self-service portal lookups, saving your association thousands of naira in SMS bills.",
    },
    {
      q: "Can we test the platform before our official election day?",
      a: "Yes. When your organization is activated, your ELCOM admin can create mock candidates and test ballot casting. The SuperAdmin can wipe test votes with a single click right before official polls open.",
    },
  ];

  return (
    <div className="space-y-16 py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-700 text-xs font-semibold shadow-xs">
          <Zap className="w-3.5 h-3.5 text-blue-600" />
          <span>Transparent Pay-Per-Use Pricing</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900">
          Simple, Fair Pricing Based Solely on Voter Size
        </h1>

        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
          Every plan includes <strong>100% of all platform features</strong>. Zero feature gating, zero hidden SMS fees. Choose your electorate size and activate your campus election instantly via WhatsApp.
        </p>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-6 rounded-2xl bg-white border transition flex flex-col justify-between ${
              plan.popular
                ? "border-zinc-900 shadow-md ring-1 ring-zinc-900"
                : "border-zinc-200 shadow-xs hover:border-zinc-400"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-zinc-900 text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-xs">
                {plan.badge}
              </span>
            )}

            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase">
                  {plan.badge}
                </span>
                <h3 className="text-lg font-bold text-zinc-900 mt-0.5">{plan.name}</h3>
                <p className="text-xs text-zinc-500 mt-1 min-h-[36px]">{plan.description}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 block">
                  ELECTORATE CAPACITY
                </span>
                <span className="text-sm font-bold text-zinc-900 block font-mono">
                  {plan.voters}
                </span>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-bold text-zinc-500 font-mono">₦</span>
                  <span className="text-3xl font-bold font-mono text-zinc-900">{plan.priceNgn}</span>
                  <span className="text-xs text-zinc-500 font-medium">/ election</span>
                </div>
                <span className="text-[11px] text-zinc-400 block mt-0.5">Pay-per-use • No recurring bills</span>
              </div>
            </div>

            <div className="pt-6">
              <a
                href={getWhatsAppLink(plan.name, plan.voters, `₦${plan.priceNgn}`)}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs ${
                  plan.popular
                    ? "bg-zinc-900 hover:bg-zinc-800 text-white"
                    : "border border-zinc-300 hover:bg-zinc-100 text-zinc-800 bg-white"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{plan.ctaText}</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Matrix Notice (All Features Included for Everyone) */}
      <div className="p-8 rounded-3xl bg-zinc-900 text-white space-y-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
              100% UNLOCKED CAPABILITIES
            </span>
            <h2 className="text-xl sm:text-2xl font-bold mt-1">
              Included in Every Single Plan — Zero Feature Gating
            </h2>
          </div>
          <span className="px-3.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-mono">
            No Artificial Paywalls
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allFeaturesIncluded.map((feat, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-300">
              <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-blue-400" />
              </div>
              <span className="leading-relaxed">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Institutional Campus License Banner (Deans & Student Affairs) */}
      <div className="p-8 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-zinc-800" />
            <span className="text-xs font-mono font-bold uppercase text-zinc-500">
              INSTITUTIONAL PARTNERSHIP
            </span>
          </div>
          <h3 className="text-lg font-bold text-zinc-900">
            Dean of Student Affairs / University-Wide Annual Retainer
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Need an annual multi-tenant deployment covering the central SUG, all 14 Faculties, 85+ Departments, and Halls of Residence with official university audit compliance? Speak with our engineering leadership.
          </p>
        </div>

        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
            "Hello StudElect Support, I am inquiring on behalf of University Management / Dean of Student Affairs regarding an annual campus-wide multi-tenant license."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition flex items-center gap-2 flex-shrink-0 shadow-xs"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Discuss Campus License</span>
        </a>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">Frequently Asked Questions</h2>
          <p className="text-xs text-zinc-500">Everything you need to know about our Pay-Per-Use pricing model.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-zinc-200 bg-white overflow-hidden transition"
            >
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4 text-left font-bold text-xs sm:text-sm text-zinc-900 flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform ${
                    activeFaq === idx ? "rotate-180 text-zinc-900" : ""
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-4 text-xs text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
