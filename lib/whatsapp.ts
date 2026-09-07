/**
 * StudElect SuperAdmin WhatsApp Support Configuration & Message Generator
 * SuperAdmin WhatsApp: 09164221215 (International format: +2349164221215)
 */

export const SUPERADMIN_WHATSAPP_RAW = "09164221215";
export const SUPERADMIN_WHATSAPP_INTL = "2349164221215";

export type AdminWhatsAppReason =
  | "QUOTA_TOPUP"
  | "EMERGENCY_SUPPORT"
  | "LICENSE_ACTIVATION"
  | "PAYMENT_CONFIRMATION"
  | "BALLOT_AUDIT"
  | "GENERAL_INQUIRY";

export interface WhatsAppContext {
  institutionName?: string;
  institutionSlug?: string;
  orgName?: string;
  orgSlug?: string;
  adminName?: string;
  adminRole?: string;
  currentQuota?: number;
  registeredCount?: number;
  electionId?: string;
  planName?: string;
}

/**
 * Generate a pre-filled, highly relevant WhatsApp URL to the SuperAdmin
 */
export function buildSuperAdminWhatsAppUrl(
  reason: AdminWhatsAppReason = "GENERAL_INQUIRY",
  ctx: WhatsAppContext = {}
): string {
  const inst = ctx.institutionName || (ctx.institutionSlug ? ctx.institutionSlug.toUpperCase() : "Campus");
  const org = ctx.orgName || (ctx.orgSlug ? ctx.orgSlug.toUpperCase() : "ELCOM");
  const admin = ctx.adminName ? `${ctx.adminName} (${ctx.adminRole || "ELCOM Admin"})` : "ELCOM Administrator";

  let body = "";

  switch (reason) {
    case "QUOTA_TOPUP":
      body =
        `*URGENT: VOTER QUOTA TOP-UP REQUEST*\n\n` +
        `Hello SuperAdmin, I am ${admin} for *${org}* at *${inst}*.\n\n` +
        `📊 *Current Capacity:* ${ctx.currentQuota || 500} voters\n` +
        `👥 *Registered Voters:* ${ctx.registeredCount || 0} registered\n\n` +
        `Our registration has reached capacity. We would like to immediately purchase an additional voter quota bump to accommodate more students without voting interruption. Please send invoice details.`;
      break;

    case "EMERGENCY_SUPPORT":
      body =
        `🚨 *CRITICAL ELECTION TECHNICAL EMERGENCY*\n\n` +
        `Hello SuperAdmin, this is ${admin} for *${org}* at *${inst}*.\n\n` +
        `We are currently running election ID: *${ctx.electionId || "elec-live"}*.\n` +
        `We need immediate real-time technical assistance on our ELCOM portal desk. Please acknowledge as soon as possible.`;
      break;

    case "LICENSE_ACTIVATION":
      body =
        `*ELECTION LICENSE ACTIVATION REQUEST*\n\n` +
        `Hello SuperAdmin, I am ${admin} from *${inst}*.\n\n` +
        `We are setting up our official election for *${org}* under the *${ctx.planName || "Micro Tier (500 Voters - ₦15,000)"}*.\n` +
        `Kindly guide us through instant license verification and unlocking our ELCOM desk.`;
      break;

    case "PAYMENT_CONFIRMATION":
      body =
        `*PAYMENT CONFIRMATION & CLEARANCE*\n\n` +
        `Hello SuperAdmin, I am ${admin} representing *${org}* (${inst}).\n\n` +
        `We have initiated / completed our payment for our election license. Please find our proof of transfer attached. Kindly unlock our active polling status.`;
      break;

    case "BALLOT_AUDIT":
      body =
        `*BALLOT AUDIT & CERTIFICATION REQUEST*\n\n` +
        `Hello SuperAdmin, I am ${admin} for *${org}* at *${inst}*.\n\n` +
        `Our election polls have concluded. We would like a certified cryptographic audit ledger extract and SuperAdmin compliance clearance for the declaration of results.`;
      break;

    case "GENERAL_INQUIRY":
    default:
      body =
        `*STUDENT ELECTORAL COMMISSION (ELCOM) SUPPORT*\n\n` +
        `Hello SuperAdmin, I am ${admin} from *${org}* (${inst}).\n\n` +
        `I am reaching out from the ELCOM Operations Desk regarding our platform setup, technical queries, or electoral guidelines.`;
      break;
  }

  return `https://wa.me/${SUPERADMIN_WHATSAPP_INTL}?text=${encodeURIComponent(body)}`;
}
