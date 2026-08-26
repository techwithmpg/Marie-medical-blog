"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export interface MessageStatusActionResult {
  success: boolean;
  message: string;
  error?: string;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ALLOWED_MESSAGE_OPERATIONS = ["read", "archive", "restore"] as const;
type MessageOperation = (typeof ALLOWED_MESSAGE_OPERATIONS)[number];

export async function updateContactMessageStatusAction(
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const messageId = formData.get("messageId");
  const operation = formData.get("operation");

  if (typeof messageId !== "string" || !UUID_REGEX.test(messageId)) {
    return;
  }

  if (
    typeof operation !== "string" ||
    !ALLOWED_MESSAGE_OPERATIONS.includes(operation as MessageOperation)
  ) {
    return;
  }

  const op = operation as MessageOperation;
  const targetStatus = op === "archive" ? "archived" : "read";

  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from("contact_messages")
    .update({
      status: targetStatus,
    })
    .eq("id", messageId);

  if (updateError) {
    return;
  }

  revalidatePath("/admin/messages");
}
