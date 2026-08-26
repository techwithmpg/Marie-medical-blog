"use client";

import * as React from "react";
import { useActionState } from "react";
import {
  submitCommentAction,
  type CommentActionState,
} from "@/app/blog/[slug]/actions";
import { Button } from "@/components/ui/button";

interface CommentFormProps {
  articleId: string;
}

const initialCommentState: CommentActionState = {
  success: false,
};

export function CommentForm({ articleId }: CommentFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitCommentAction,
    initialCommentState,
  );

  const formRef = React.useRef<HTMLFormElement>(null);
  const [prevActionState, setPrevActionState] = React.useState(state);
  const [hasEditedSinceResult, setHasEditedSinceResult] = React.useState(false);

  // Synchronize local edit tracking when action state transitions
  if (state !== prevActionState) {
    setPrevActionState(state);
    setHasEditedSinceResult(false);
  }

  React.useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  const showFeedback = Boolean(state.message && !hasEditedSinceResult);

  return (
    <div className="space-y-6 rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-6 sm:p-8">
      <div className="space-y-1">
        <h3 className="font-serif text-lg font-medium text-[#242321]">
          Leave a Comment
        </h3>
        <p className="text-xs text-[#5E5953]">
          Comments are reviewed before they appear publicly. Your email is used
          only for moderation and is never published.
        </p>
      </div>

      {/* Global Action Feedback */}
      {showFeedback && state.message && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-xs border px-4 py-3 text-xs leading-relaxed ${
            state.success
              ? "border-[#4A6B5B]/40 bg-[#F0F5F2] text-[#2D4539]"
              : "border-[#8B261D]/30 bg-[#FBF2F1] text-[#6A1A14]"
          }`}
        >
          {state.message}
        </div>
      )}

      <form
        ref={formRef}
        action={formAction}
        onInput={() => setHasEditedSinceResult(true)}
        className="space-y-5"
        noValidate
      >
        {/* Hidden Article ID */}
        <input type="hidden" name="articleId" value={articleId} />

        {/* Off-screen Honeypot Field */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-9999px",
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <label htmlFor="comment-website">Website</label>
          <input
            id="comment-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Name Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="commenter-name"
            className="block font-sans text-xs font-semibold tracking-wider text-[#242321] uppercase"
          >
            Name <span className="text-[#8B261D]">*</span>
          </label>
          <input
            id="commenter-name"
            name="commenterName"
            type="text"
            required
            maxLength={100}
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={Boolean(state.fieldErrors?.commenterName)}
            aria-describedby={
              state.fieldErrors?.commenterName
                ? "commenter-name-error"
                : undefined
            }
            className={`h-11 w-full rounded-md border bg-[#F6F1E8]/50 px-3.5 font-sans text-sm text-[#242321] placeholder:text-[#918579] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none ${
              state.fieldErrors?.commenterName
                ? "border-[#8B261D]"
                : "border-[#D2C9BC]"
            }`}
          />
          {state.fieldErrors?.commenterName && (
            <p
              id="commenter-name-error"
              className="text-xs text-[#8B261D]"
              role="alert"
            >
              {state.fieldErrors.commenterName[0]}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="commenter-email"
              className="block font-sans text-xs font-semibold tracking-wider text-[#242321] uppercase"
            >
              Email Address <span className="text-[#8B261D]">*</span>
            </label>
            <span
              id="comment-email-note"
              className="text-[11px] text-[#7A746B]"
            >
              Private / never published
            </span>
          </div>
          <input
            id="commenter-email"
            name="commenterEmail"
            type="email"
            required
            maxLength={255}
            autoComplete="email"
            placeholder="email@domain.com"
            aria-invalid={Boolean(state.fieldErrors?.commenterEmail)}
            aria-describedby={
              state.fieldErrors?.commenterEmail
                ? "commenter-email-error comment-email-note"
                : "comment-email-note"
            }
            className={`h-11 w-full rounded-md border bg-[#F6F1E8]/50 px-3.5 font-sans text-sm text-[#242321] placeholder:text-[#918579] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none ${
              state.fieldErrors?.commenterEmail
                ? "border-[#8B261D]"
                : "border-[#D2C9BC]"
            }`}
          />
          {state.fieldErrors?.commenterEmail && (
            <p
              id="commenter-email-error"
              className="text-xs text-[#8B261D]"
              role="alert"
            >
              {state.fieldErrors.commenterEmail[0]}
            </p>
          )}
        </div>

        {/* Comment Body Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="comment-body"
            className="block font-sans text-xs font-semibold tracking-wider text-[#242321] uppercase"
          >
            Comment <span className="text-[#8B261D]">*</span>
          </label>
          <textarea
            id="comment-body"
            name="body"
            rows={4}
            required
            maxLength={2000}
            placeholder="Share your thoughts on this publication..."
            aria-invalid={Boolean(state.fieldErrors?.body)}
            aria-describedby={
              state.fieldErrors?.body ? "comment-body-error" : undefined
            }
            className={`w-full resize-y rounded-md border bg-[#F6F1E8]/50 p-3.5 font-sans text-sm text-[#242321] placeholder:text-[#918579] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none ${
              state.fieldErrors?.body ? "border-[#8B261D]" : "border-[#D2C9BC]"
            }`}
          />
          {state.fieldErrors?.body && (
            <p
              id="comment-body-error"
              className="text-xs text-[#8B261D]"
              role="alert"
            >
              {state.fieldErrors.body[0]}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isPending}
            variant="default"
            size="lg"
            className="h-11 w-full sm:w-auto"
          >
            {isPending ? "Submitting..." : "Submit Comment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
