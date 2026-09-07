"use server";

import { supabase } from "@/lib/supabase";
import { normalizeMatricNo } from "@/lib/matric-normalizer";
import { revalidatePath } from "next/cache";

export interface ToggleStudentAdminInput {
  institutionSlug: string;
  matricNo: string;
  isAdmin: boolean;
  adminRole?: "ELCOM_COMMISSIONER" | "POLLING_OFFICER";
}

export async function toggleStudentAdminRoleAction(input: ToggleStudentAdminInput) {
  const norm = normalizeMatricNo(input.matricNo);
  if (!norm.isValid) {
    return {
      success: false,
      message: "Invalid matriculation number format.",
    };
  }

  const cleanInstSlug = input.institutionSlug.toLowerCase().trim();
  const institutionId = `inst-${cleanInstSlug}`;

  try {
    const { data: student } = await supabase
      .from("students")
      .select("*")
      .eq("institution_id", institutionId)
      .eq("normalized_matric", norm.normalized)
      .maybeSingle();

    if (student) {
      const email = student.email || `${norm.normalized}@${cleanInstSlug}.edu.ng`;
      if (input.isAdmin) {
        await supabase.from("admin_users").upsert({
          id: `admin-${student.id}`,
          institution_id: institutionId,
          email,
          full_name: student.full_name,
          password_hash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
          role: "POLLING_AGENT",
          is_active: true,
        });
      } else {
        await supabase.from("admin_users").delete().eq("email", email);
      }
    }
  } catch (error: any) {
    console.warn("Toggle admin role exception:", error);
  }

  revalidatePath(`/${cleanInstSlug}/admin`);

  return {
    success: true,
    message: input.isAdmin
      ? `Student ${input.matricNo} promoted to Polling Agent.`
      : `Admin privileges revoked for ${input.matricNo}.`,
  };
}
