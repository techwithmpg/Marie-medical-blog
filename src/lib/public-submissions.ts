import { z } from "zod";

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Public Comment Submission Validation Schema
 * Matches database invariants on public.comments
 */
export const commentSubmissionSchema = z.object({
  articleId: z
    .string()
    .regex(UUID_REGEX, { message: "Invalid article identifier." }),
  commenterName: z
    .string()
    .trim()
    .min(1, { message: "Please enter your name." })
    .max(100, { message: "Name cannot exceed 100 characters." }),
  commenterEmail: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, { message: "Please enter your email address." })
    .email({ message: "Please enter a valid email address." })
    .max(255, { message: "Email cannot exceed 255 characters." }),
  body: z
    .string()
    .trim()
    .min(1, { message: "Please enter a comment." })
    .max(2000, { message: "Comment cannot exceed 2,000 characters." }),
  website: z.string().optional().default(""),
});

export type CommentSubmissionInput = z.infer<typeof commentSubmissionSchema>;

/**
 * Public Contact Inquiry Validation Schema
 * Matches database invariants on public.contact_messages
 */
export const contactSubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Please enter your name." })
    .max(100, { message: "Name cannot exceed 100 characters." }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, { message: "Please enter your email address." })
    .email({ message: "Please enter a valid email address." })
    .max(255, { message: "Email cannot exceed 255 characters." }),
  subject: z
    .string()
    .trim()
    .min(1, { message: "Please enter a subject." })
    .max(200, { message: "Subject cannot exceed 200 characters." }),
  message: z
    .string()
    .trim()
    .min(1, { message: "Please enter a message." })
    .max(5000, { message: "Message cannot exceed 5,000 characters." }),
  website: z.string().optional().default(""),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;

/**
 * Shared Action Response Contract for Public Forms
 */
export interface SubmissionActionResult<
  TFieldErrors = Record<string, string[] | undefined>,
> {
  success: boolean;
  message?: string;
  fieldErrors?: TFieldErrors;
}

export function isHoneypotTriggered(val: unknown): boolean {
  return typeof val === "string" && val.trim().length > 0;
}
