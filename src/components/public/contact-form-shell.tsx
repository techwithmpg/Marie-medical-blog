import * as React from "react";
import { Button } from "@/components/ui/button";
import { TopicImprint } from "@/components/evidence/topic-imprint";
import { cn } from "@/lib/utils";

interface ContactFormShellProps {
  className?: string;
}

export function ContactFormShell({ className }: ContactFormShellProps) {
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
        <TopicImprint variant="muted">Notice</TopicImprint>
      </div>

      {/* Non-live informational badge */}
      <div
        role="status"
        aria-live="polite"
        className="rounded-xs border border-[#D2C9BC] bg-[#E8E2D7]/40 px-4 py-3 text-xs leading-relaxed text-[#5E5953]"
      >
        <strong className="font-semibold text-[#242321]">Notice:</strong> This
        form is currently not accepting direct online submissions. Direct
        messaging will be enabled in a future update.
      </div>

      <form className="space-y-5" noValidate>
        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="contact-name"
            className="block font-sans text-xs font-semibold tracking-wider text-[#242321] uppercase"
          >
            Full Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            disabled
            placeholder="Full Name"
            className="h-11 w-full rounded-md border border-[#D2C9BC] bg-[#F6F1E8]/50 px-3.5 font-sans text-sm text-[#242321] placeholder:text-[#918579] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-75"
          />
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label
            htmlFor="contact-email"
            className="block font-sans text-xs font-semibold tracking-wider text-[#242321] uppercase"
          >
            Email Address
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            disabled
            placeholder="email@domain.com"
            className="h-11 w-full rounded-md border border-[#D2C9BC] bg-[#F6F1E8]/50 px-3.5 font-sans text-sm text-[#242321] placeholder:text-[#918579] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-75"
          />
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <label
            htmlFor="contact-subject"
            className="block font-sans text-xs font-semibold tracking-wider text-[#242321] uppercase"
          >
            Subject
          </label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            disabled
            placeholder="Subject"
            className="h-11 w-full rounded-md border border-[#D2C9BC] bg-[#F6F1E8]/50 px-3.5 font-sans text-sm text-[#242321] placeholder:text-[#918579] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-75"
          />
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label
            htmlFor="contact-message"
            className="block font-sans text-xs font-semibold tracking-wider text-[#242321] uppercase"
          >
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            disabled
            placeholder="Message"
            className="w-full resize-y rounded-md border border-[#D2C9BC] bg-[#F6F1E8]/50 p-3.5 font-sans text-sm text-[#242321] placeholder:text-[#918579] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-75"
          />
        </div>

        {/* Action button */}
        <div className="pt-2">
          <Button
            type="button"
            disabled
            variant="default"
            size="lg"
            className="w-full cursor-not-allowed opacity-60 sm:w-auto"
          >
            Submit (Currently Unavailable)
          </Button>
        </div>
      </form>
    </div>
  );
}
