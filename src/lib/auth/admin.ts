import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface AuthenticatedAdmin {
  id: string;
  email?: string;
}

/**
 * Server-side authorization gate for protected admin routes and actions.
 *
 * Verifies:
 * 1. Cryptographic token validity and presence of claims.sub via getClaims().
 * 2. Admin allowlist membership via authenticated RPC public.is_admin().
 *
 * Acts strictly as an authorization gate. Does not attempt session cookie mutation
 * from within Server Components.
 */
export async function requireAdmin(): Promise<AuthenticatedAdmin> {
  const supabase = await createClient();

  // 1. Cryptographic token & claims verification
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const claims = claimsData?.claims;

  if (claimsError || !claims?.sub) {
    redirect("/admin/login");
  }

  // 2. Authorize allowlist membership against private.admin_users
  const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin");

  if (rpcError || isAdmin !== true) {
    redirect("/admin/login");
  }

  return {
    id: claims.sub as string,
    email: claims.email as string | undefined,
  };
}
