"use client";

import * as React from "react";
import { useActionState } from "react";
import {
  submitContactAction,
  type ContactActionState,
} from "@/app/contact/actions";
import { Button } from "@/components/ui/button";
import { TopicImprint } from "@/components/evidence/topic-imprint";
import { cn } from "@/lib/utils";

interface ContactFormShellProps {
  className?: string;
}

const initialContactState: ContactActionState = {
  success: false,
};

export function ContactFormShell({ className }: ContactFormShellProps) {
  const [state, formAction, isPending] = useActionState(
    submitContactAction,
    initialContactState,
  );

  const formRef = React.useRef<HTMLFormElement>(null);
  const [prevActionState, setPrevActionState] = React.useState(state);
  const [subjectLen, setSubjectLen] = React.useState(0);
  const [messageLen, setMessageLen] = React.useState(0);
  const [hasEditedSinceResult, setHasEditedSinceResult] = React.useState(false);
  const isHydrated = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Synchronize local edit tracking & counters when action state transitions
  if (state !== prevActionState) {
    setPrevActionState(state);
    setHasEditedSinceResult(false);
    if (state.success) {
      setSubjectLen(0);
      setMessageLen(0);
    }
  }

  React.useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  const showFeedback = Boolean(state.message && !hasEditedSinceResult);

  return (
    <div
      className={cn(
        "space-y-6 rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-6 sm:p-8",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-serif text-xl font-medium text-[#242321]">
          Send an Inquiry
        </span>
        <TopicImprint variant="muted">Direct</TopicImprint>
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
        data-hydrated={isHydrated ? "true" : "false"}
        className="space-y-5"
        noValidate
      >
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
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="contact-name"
            className="block font-sans text-xs font-semibold tracking-wider text-[#242321] uppercase"
          >
            Full Name <span className="text-[#8B261D]">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            maxLength={100}
            autoComplete="name"
            placeholder="Full Name"
            aria-invalid={Boolean(state.fieldErrors?.name)}
            aria-describedby={
              state.fieldErrors?.name ? "contact-name-error" : undefined
            }
            className={`h-11 w-full rounded-md border bg-[#F6F1E8]/50 px-3.5 font-sans text-sm text-[#242321] placeholder:text-[#918579] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none ${
              state.fieldErrors?.name ? "border-[#8B261D]" : "border-[#D2C9BC]"
            }`}
          />
          {state.fieldErrors?.name && (
            <p
              id="contact-name-error"
              className="text-xs text-[#8B261D]"
              role="alert"
            >
              {state.fieldErrors.name[0]}
            </p>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label
            htmlFor="contact-email"
            className="block font-sans text-xs font-semibold tracking-wider text-[#242321] uppercase"
          >
            Email Address <span className="text-[#8B261D]">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            maxLength={255}
            autoComplete="email"
            placeholder="email@domain.com"
            aria-invalid={Boolean(state.fieldErrors?.email)}
            aria-describedby={
              state.fieldErrors?.email ? "contact-email-error" : undefined
            }
            className={`h-11 w-full rounded-md border bg-[#F6F1E8]/50 px-3.5 font-sans text-sm text-[#242321] placeholder:text-[#918579] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none ${
              state.fieldErrors?.email ? "border-[#8B261D]" : "border-[#D2C9BC]"
            }`}
          />
          {state.fieldErrors?.email && (
            <p
              id="contact-email-error"
              className="text-xs text-[#8B261D]"
              role="alert"
            >
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="contact-subject"
              className="block font-sans text-xs font-semibold tracking-wider text-[#242321] uppercase"
            >
              Subject <span className="text-[#8B261D]">*</span>
            </label>
            <span
              id="contact-subject-counter"
              className="text-[11px] text-[#7A746B] tabular-nums"
            >
              {subjectLen} / 200
            </span>
          </div>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            required
            maxLength={200}
            placeholder="Subject"
            onChange={(e) => setSubjectLen(e.target.value.length)}
            onInput={(e) =>
              setSubjectLen((e.target as HTMLInputElement).value.length)
            }
            aria-invalid={Boolean(state.fieldErrors?.subject)}
            aria-describedby={
              state.fieldErrors?.subject
                ? "contact-subject-error contact-subject-counter"
                : "contact-subject-counter"
            }
            className={`h-11 w-full rounded-md border bg-[#F6F1E8]/50 px-3.5 font-sans text-sm text-[#242321] placeholder:text-[#918579] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none ${
              state.fieldErrors?.subject
                ? "border-[#8B261D]"
                : "border-[#D2C9BC]"
            }`}
          />
          {state.fieldErrors?.subject && (
            <p
              id="contact-subject-error"
              className="text-xs text-[#8B261D]"
              role="alert"
            >
              {state.fieldErrors.subject[0]}
            </p>
          )}
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="contact-message"
              className="block font-sans text-xs font-semibold tracking-wider text-[#242321] uppercase"
            >
              Message <span className="text-[#8B261D]">*</span>
            </label>
            <span
              id="contact-message-counter"
              className="text-[11px] text-[#7A746B] tabular-nums"
            >
              {messageLen} / 5000
            </span>
          </div>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            required
            maxLength={5000}
            placeholder="Please detail your inquiry or editorial discussion topic..."
            onChange={(e) => setMessageLen(e.target.value.length)}
            onInput={(e) =>
              setMessageLen((e.target as HTMLTextAreaElement).value.length)
            }
            aria-invalid={Boolean(state.fieldErrors?.message)}
            aria-describedby={
              state.fieldErrors?.message
                ? "contact-message-error contact-message-counter"
                : "contact-message-counter"
            }
            className={`w-full resize-y rounded-md border bg-[#F6F1E8]/50 p-3.5 font-sans text-sm text-[#242321] placeholder:text-[#918579] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none ${
              state.fieldErrors?.message
                ? "border-[#8B261D]"
                : "border-[#D2C9BC]"
            }`}
          />
          {state.fieldErrors?.message && (
            <p
              id="contact-message-error"
              className="text-xs text-[#8B261D]"
              role="alert"
            >
              {state.fieldErrors.message[0]}
            </p>
          )}
        </div>

        {/* Action button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isPending}
            variant="default"
            size="lg"
            className="h-11 w-full sm:w-auto"
          >
            {isPending ? "Submitting..." : "Send Inquiry"}
          </Button>
        </div>
      </form>
    </div>
  );
}
