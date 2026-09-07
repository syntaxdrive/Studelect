export interface PricingPlan {
  id: string;
  name: string;
  targetTier: "DEPARTMENT" | "FACULTY" | "SUG" | "CAMPUS_ENTERPRISE";
  priceNGN: number;
  voterLimit: number;
  features: string[];
}

export interface TenantInvoice {
  id: string;
  institutionId: string;
  institutionName: string;
  orgName: string;
  electionTitle: string;
  planId: string;
  amountNGN: number;
  paymentMethod: "PAYSTACK" | "FLUTTERWAVE" | "BANK_TRANSFER";
  paymentReference: string;
  status: "PAID" | "PENDING_APPROVAL" | "OVERDUE";
  issuedAt: string;
  paidAt?: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "plan-dept",
    name: "Departmental / Hall License",
    targetTier: "DEPARTMENT",
    priceNGN: 35000,
    voterLimit: 2500,
    features: [
      "Up to 2,500 registered voters",
      "₦0 Scratch PIN Slip generator",
      "Association dues compliance gate",
      "Decoupled anonymous balloting",
      "Public receipt audit ledger",
    ],
  },
  {
    id: "plan-faculty",
    name: "Faculty Association License",
    targetTier: "FACULTY",
    priceNGN: 75000,
    voterLimit: 8000,
    features: [
      "Up to 8,000 registered voters",
      "Multi-departmental post routing",
      "SDC Disciplinary Blacklist sync",
      "Live & Sealed results modes",
      "Exportable PDF Declaration Certificates",
    ],
  },
  {
    id: "plan-sug",
    name: "SUG Apex Campus License",
    targetTier: "SUG",
    priceNGN: 250000,
    voterLimit: 75000,
    features: [
      "Up to 75,000 registered voters",
      "High-concurrency Redis write buffer (10k+ votes/min)",
      "Multi-Signature Dean of Student Affairs sign-off",
      "DND-Bypassing transactional SMS/WhatsApp OTP failover",
      "Dedicated Election Day engineer on standby",
    ],
  },
  {
    id: "plan-enterprise",
    name: "Annual Campus Institutional License",
    targetTier: "CAMPUS_ENTERPRISE",
    priceNGN: 1500000,
    voterLimit: 150000,
    features: [
      "Unlimited SUG, Faculty, Departmental & Hall elections",
      "Direct ICT Centre single-sign-on (SSO) integration",
      "Custom branded subdomains (e.g. vote.unilag.edu.ng)",
      "Full administrative control for Dean of Student Affairs",
      "Dedicated server instance & SLA guarantee",
    ],
  },
];

// Clean Production Store (Invoices flow from Paystack / Flutterwave webhooks)
export const MOCK_INVOICES: TenantInvoice[] = [];
