"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface LoginActionResult {
  error?: string;
}

const GENERIC_AUTH_ERROR = "Unable to sign in with those credentials.";

export async function loginAction(
  prevState: LoginActionResult | null,
  formData: FormData,
): Promise<LoginActionResult> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: GENERIC_AUTH_ERROR };
  }

  const supabase = await createClient();

  // 1. Authenticate credentials with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data?.user) {
    return { error: GENERIC_AUTH_ERROR };
  }

  // 2. Authorize allowlist membership against private.admin_users
  const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin");

  if (rpcError || isAdmin !== true) {
    // Valid credentials but not on admin allowlist: sign out and return generic error
    await supabase.auth.signOut();
    return { error: GENERIC_AUTH_ERROR };
  }

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
