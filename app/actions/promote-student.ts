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
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("institution_id", institutionId)
      .eq("normalized_matric", norm.normalized)
      .maybeSingle();

    if (studentError || !student) {
      return {
        success: false,
        message: `Student with matric ${input.matricNo} not found in voter register.`,
      };
    }

    let email = (student.email || "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      email = `${norm.normalized.toLowerCase().replace(/[^a-z0-9]/g, "")}@${cleanInstSlug}.edu.ng`;
      // Sync back to student profile
      await supabase.from("students").update({ email }).eq("id", student.id);
    }

    const assignedRole = input.adminRole || "ELCOM_COMMISSIONER";

    if (input.isAdmin) {
      const { error: upsertError } = await supabase.from("admin_users").upsert({
        id: `admin-${student.id}`,
        institution_id: institutionId,
        email,
        full_name: student.full_name,
        password_hash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
        role: assignedRole,
        is_active: true,
      });

      if (upsertError) {
        console.warn("Failed to insert admin_user:", upsertError);
        return {
          success: false,
          message: `Database error granting admin role: ${upsertError.message}`,
        };
      }
    } else {
      await supabase.from("admin_users").delete().eq("email", email);
      await supabase.from("admin_users").delete().eq("id", `admin-${student.id}`);
    }

    revalidatePath(`/${cleanInstSlug}/admin`);

    return {
      success: true,
      email,
      message: input.isAdmin
        ? `Promoted ${student.full_name} to ${assignedRole}! Login Email: ${email} | Password: elcom2026`
        : `Admin privileges revoked for ${student.full_name} (${student.matric_no}).`,
    };
  } catch (error: any) {
    console.warn("Toggle admin role exception:", error);
    return {
      success: false,
      message: error.message || "Failed to update admin role.",
    };
  }
}
