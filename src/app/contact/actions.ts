"use server";

import { createClient } from "@/lib/supabase/server";
import {
  contactSubmissionSchema,
  isHoneypotTriggered,
  type SubmissionActionResult,
} from "@/lib/public-submissions";

export type ContactActionState = SubmissionActionResult<{
  name?: string[];
  email?: string[];
  subject?: string[];
  message?: string[];
  website?: string[];
}>;

/**
 * Public Server Action for submitting a contact inquiry.
 * Inserts only name, email, subject, and message.
 * Normalization, status=new, system timestamps/UUID, and rate limits
 * are enforced by the database and trigger guards.
 */
export async function submitContactAction(
  _prevState: ContactActionState | null,
  formData: FormData,
): Promise<ContactActionState> {
  // 1. Check honeypot field
  const honeypot = formData.get("website");
  if (isHoneypotTriggered(honeypot)) {
    return {
      success: true,
      message: "Your inquiry has been submitted.",
    };
  }

  // 2. Parse and validate input data
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    website: formData.get("website") ?? "",
  };

  const parsed = contactSubmissionSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Please correct the errors in the form before submitting.",
    };
  }

  const { name, email, subject, message } = parsed.data;

  try {
    const supabase = await createClient();

    // 3. Narrow insert of only allowed public columns
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      subject,
      message,
    });

    if (error) {
      return {
        success: false,
        message:
          "We couldn't submit your inquiry right now. Please wait a little and try again.",
      };
    }

    return {
      success: true,
      message: "Your inquiry has been submitted.",
    };
  } catch {
    return {
      success: false,
      message:
        "We couldn't submit your inquiry right now. Please wait a little and try again.",
    };
  }
}
