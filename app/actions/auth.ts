"use server";

import { authenticateAdmin } from "@/lib/auth/admin-session";
import { setAdminSessionCookie, clearAdminSessionCookie, getAdminSession, AuthSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export interface LoginInput {
  email: string;
  password: string;
}

export async function loginAction(input: LoginInput) {
  try {
    const authResult = await authenticateAdmin(input.email, input.password);

    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        message: authResult.message || "Invalid email or password.",
      };
    }

    const user = authResult.user;
    const session: AuthSession = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      institutionId: user.institutionId,
      institutionSlug: user.institutionSlug || "unilag",
      orgId: user.orgId,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    // Set secure HTTP-only cookie
    await setAdminSessionCookie(session);

    return {
      success: true,
      role: user.role,
      institutionSlug: user.institutionSlug || "unilag",
      message: "Authenticated successfully.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Authentication error occurred.",
    };
  }
}

export async function logoutAction() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}

export async function getCurrentUserSession(): Promise<AuthSession | null> {
  return await getAdminSession();
}
