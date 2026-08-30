"use client";

import * as React from "react";
import { PenLine, X } from "lucide-react";

import { ContactFormShell } from "@/components/public/contact-form-shell";
import { Button } from "@/components/ui/button";

export function HomeContactBanner() {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <>
      <section aria-label="Professional inquiries" className="pt-5">
        <div className="flex flex-col gap-5 border border-subtle-divider bg-[#FFF9F0]/55 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="flex min-w-0 items-center gap-4">
            <div className="border-brand-oxide/55 text-brand-oxide flex h-11 w-11 shrink-0 items-center justify-center rounded-full border">
              <PenLine
                aria-hidden="true"
                strokeWidth={1.45}
                className="h-5 w-5"
              />
            </div>

            <div className="min-w-0">
              <h2 className="font-serif text-base leading-snug font-medium text-ink sm:text-lg">
                Professional medical writing inquiries
              </h2>

              <p className="text-muted-ink mt-1 text-xs leading-relaxed sm:text-sm">
                For editorial discussions and publication communications.
              </p>
            </div>
          </div>

          <Button
            ref={triggerRef}
            type="button"
            size="default"
            onClick={openDialog}
            className="shrink-0 sm:min-w-32"
          >
            Get in Touch
          </Button>
        </div>
      </section>

      <dialog
        ref={dialogRef}
        aria-labelledby="home-contact-dialog-title"
        onClose={() => triggerRef.current?.focus()}
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            closeDialog();
          }
        }}
        className="m-auto max-h-[92vh] w-[min(92vw,44rem)] overflow-y-auto rounded-md border border-subtle-divider bg-[#FFFDF9] p-0 text-ink shadow-2xl backdrop:bg-[#242321]/35 backdrop:backdrop-blur-[2px]"
      >
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-subtle-divider bg-[#FFFDF9]/95 px-5 py-4 backdrop-blur-sm sm:px-7">
          <div>
            <p
              id="home-contact-dialog-title"
              className="font-serif text-xl font-medium text-ink"
            >
              Professional Inquiry
            </p>

            <p className="text-muted-ink mt-0.5 text-xs">
              Send a message through the secure inquiry form.
            </p>
          </div>

          <button
            type="button"
            onClick={closeDialog}
            aria-label="Close contact form"
            className="text-muted-ink hover:border-brand-oxide hover:text-brand-oxide flex h-10 w-10 items-center justify-center rounded-md border border-subtle-divider transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
          >
            <X aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
          </button>
        </div>

        <ContactFormShell className="rounded-none border-0 bg-[#FFFDF9] shadow-none" />
      </dialog>
    </>
  );
}
