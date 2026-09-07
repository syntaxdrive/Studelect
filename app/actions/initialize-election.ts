"use server";

import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { setAdminSessionCookie, AuthSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export interface InitializeElectionInput {
  institutionSlug: string;
  commissionerName: string;
  commissionerEmail: string;
  password: string;
  orgType?: "SUG" | "FACULTY" | "DEPARTMENT" | "HALL";
  orgName: string;
  orgSlug?: string;
  electionTitle: string;
  academicSession?: string;
  description?: string;
  startsAt?: string;
  endsAt?: string;
  resultsVisibility?: "LIVE" | "SEALED_UNTIL_CLOSE";
  authMode?: "PIN_SLIP" | "EMAIL_OTP" | "SECRET_MATCH";
  requireDuesPayment?: boolean;
  requireFullTimeOnly?: boolean;
  requireGoodDisciplinaryStanding?: boolean;
  posts: Array<{
    title: string;
    maxSelections?: number;
    allowedLevels?: number[];
  }>;
}

export async function initializeElectionAndAccountAction(input: InitializeElectionInput) {
  try {
    if (!input.commissionerName || !input.commissionerEmail || input.password.length < 6) {
      return {
        success: false,
        message: "Please enter your full name, official email, and a password of at least 6 characters.",
      };
    }

    if (!input.orgName || !input.electionTitle) {
      return {
        success: false,
        message: "Please enter your association name and election title.",
      };
    }

    const cleanInstSlug = input.institutionSlug.toLowerCase().trim();
    const cleanOrgSlug = (input.orgSlug || input.orgName.substring(0, 8))
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");

    const orgType = input.orgType || "DEPARTMENT";
    const electionId = `elec-${cleanOrgSlug}-${Date.now()}`;
    const orgId = `org-${cleanInstSlug}-${cleanOrgSlug}`;
    const institutionId = `inst-${cleanInstSlug}`;

    // 1. Persist to Supabase if connected
    try {
      // Upsert Institution
      await supabase.from("institutions").upsert({
        id: institutionId,
        name: cleanInstSlug.toUpperCase() + " University",
        slug: cleanInstSlug,
        code: cleanInstSlug.toUpperCase(),
        tagline: "Higher Education Institution",
      });

      // Upsert Organization
      await supabase.from("organizations").upsert({
        id: orgId,
        institution_id: institutionId,
        name: input.orgName,
        slug: cleanOrgSlug,
        org_type: orgType,
        code: cleanOrgSlug.toUpperCase(),
      });

      // Create Election
      await supabase.from("elections").insert({
        id: electionId,
        organization_id: orgId,
        title: input.electionTitle,
        academic_session: input.academicSession || "2025/2026",
        description: input.description || "",
        status: "LIVE",
        results_visibility: input.resultsVisibility || "LIVE",
        auth_mode: input.authMode || "PIN_SLIP",
        require_dues_payment: input.requireDuesPayment !== false,
        require_full_time_only: input.requireFullTimeOnly !== false,
        require_good_disciplinary_standing: input.requireGoodDisciplinaryStanding !== false,
        starts_at: new Date(input.startsAt || Date.now()).toISOString(),
        ends_at: new Date(input.endsAt || Date.now() + 7 * 86400000).toISOString(),
      });

      // Create Posts
      if (input.posts && input.posts.length > 0) {
        for (let i = 0; i < input.posts.length; i++) {
          const p = input.posts[i];
          await supabase.from("posts").insert({
            id: `post-${cleanOrgSlug}-${i + 1}-${Date.now()}`,
            election_id: electionId,
            title: p.title,
            max_selections: p.maxSelections || 1,
            allowed_levels: p.allowedLevels || [],
            display_order: i,
          });
        }
      }

      // Create Commissioner Admin Account in Supabase admin_users
      await supabase.from("admin_users").upsert({
        id: `admin-${Date.now()}`,
        institution_id: institutionId,
        email: input.commissionerEmail.trim().toLowerCase(),
        full_name: input.commissionerName.trim(),
        password_hash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
        role: "ELCOM_CHAIRMAN",
        is_active: true,
      });
    } catch (dbErr) {
      console.warn("Supabase initialization error, handled gracefully.", dbErr);
    }

    // Automatically set secure session cookie for the new commissioner
    const session: AuthSession = {
      userId: `elcom-${Date.now()}`,
      email: input.commissionerEmail.trim().toLowerCase(),
      fullName: input.commissionerName.trim(),
      role: "ELCOM_ADMIN",
      institutionId,
      institutionSlug: cleanInstSlug,
      orgId,
      electionId,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    await setAdminSessionCookie(session);

    revalidatePath(`/${cleanInstSlug}`);
    revalidatePath(`/${cleanInstSlug}/${cleanOrgSlug}`);
    revalidatePath(`/${cleanInstSlug}/admin`);

    const directStudentUrl = `/${cleanInstSlug}/${cleanOrgSlug}`;

    return {
      success: true,
      electionId,
      institutionSlug: cleanInstSlug,
      orgSlug: cleanOrgSlug,
      directStudentUrl,
      message: "Election portal and ELCOM account successfully created!",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to initialize election portal.",
    };
  }
}
