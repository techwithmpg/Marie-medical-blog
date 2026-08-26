import { createClient } from "@/lib/supabase/server";

export type AdminMessageStatus = "new" | "read" | "archived";

export interface AdminContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: AdminMessageStatus;
  created_at: string;
}

/**
 * Loads contact messages for the admin inbox with optional status filtering.
 * Explicitly selects only defined columns.
 * Orders: created_at DESC, id DESC.
 */
export async function getAdminContactMessages(
  statusFilter?: string,
): Promise<AdminContactMessage[]> {
  const supabase = await createClient();

  let query = supabase
    .from("contact_messages")
    .select("id, name, email, subject, message, status, created_at")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (
    statusFilter === "new" ||
    statusFilter === "read" ||
    statusFilter === "archived"
  ) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load contact messages: ${error.message}`);
  }

  return (data || []) as AdminContactMessage[];
}

/**
 * Loads a single contact message by ID without side effects.
 * Merely reading or fetching does NOT mutate message status.
 */
export async function getAdminContactMessageById(
  id: string,
): Promise<AdminContactMessage | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, subject, message, status, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load contact message: ${error.message}`);
  }

  if (!data) return null;

  return data as AdminContactMessage;
}
