"use server";

import { createClient } from "@/lib/supabase/server";
import {
  commentSubmissionSchema,
  isHoneypotTriggered,
  type SubmissionActionResult,
} from "@/lib/public-submissions";

export type CommentActionState = SubmissionActionResult<{
  articleId?: string[];
  commenterName?: string[];
  commenterEmail?: string[];
  body?: string[];
  website?: string[];
}>;

/**
 * Public Server Action for submitting a comment on a published article.
 * Inserts only article_id, commenter_name, commenter_email, and body.
 * Normalization, status=pending, system timestamps/UUID, and rate limits
 * are enforced by the database and trigger guards.
 */
export async function submitCommentAction(
  _prevState: CommentActionState | null,
  formData: FormData,
): Promise<CommentActionState> {
  // 1. Check honeypot field
  const honeypot = formData.get("website");
  if (isHoneypotTriggered(honeypot)) {
    return {
      success: true,
      message:
        "Thank you. Your comment has been submitted for moderation and will appear only if approved.",
    };
  }

  // 2. Parse and validate input data
  const rawData = {
    articleId: formData.get("articleId"),
    commenterName: formData.get("commenterName"),
    commenterEmail: formData.get("commenterEmail"),
    body: formData.get("body"),
    website: formData.get("website") ?? "",
  };

  const parsed = commentSubmissionSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Please correct the errors in the form before submitting.",
    };
  }

  const { articleId, commenterName, commenterEmail, body } = parsed.data;

  try {
    const supabase = await createClient();

    // 3. Narrow insert of only allowed public columns
    const { error } = await supabase.from("comments").insert({
      article_id: articleId,
      commenter_name: commenterName,
      commenter_email: commenterEmail,
      body: body,
    });

    if (error) {
      // Restrained generic message to avoid leaking database internals or rate limit details
      return {
        success: false,
        message:
          "We couldn't submit your comment right now. Please wait a little and try again.",
      };
    }

    return {
      success: true,
      message:
        "Thank you. Your comment has been submitted for moderation and will appear only if approved.",
    };
  } catch {
    return {
      success: false,
      message:
        "We couldn't submit your comment right now. Please wait a little and try again.",
    };
  }
}
