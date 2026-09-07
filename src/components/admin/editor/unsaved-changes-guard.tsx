"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react";

export function UnsavedChangesGuard({ active }: { active: boolean }) {
  const [pendingHref, setPendingHref] = React.useState<string | null>(null);
  const bypassRef = React.useRef(false);
  const activeRef = React.useRef(active);
  const navigationSourceRef = React.useRef<HTMLAnchorElement | null>(null);

  React.useEffect(() => {
    activeRef.current = active;
  }, [active]);

  React.useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!activeRef.current || bypassRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        !activeRef.current ||
        bypassRef.current ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      )
        return;

      const destination = new URL(anchor.href, window.location.href);
      const current = new URL(window.location.href);
      if (
        destination.origin !== current.origin ||
        destination.href === current.href ||
        (destination.pathname === current.pathname &&
          destination.search === current.search &&
          destination.hash)
      )
        return;

      event.preventDefault();
      navigationSourceRef.current = anchor;
      setPendingHref(destination.href);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, []);

  return (
    <Dialog.Root
      open={pendingHref !== null}
      onOpenChange={(open) => {
        if (!open) {
          setPendingHref(null);
          window.requestAnimationFrame(() =>
            navigationSourceRef.current?.focus(),
          );
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-xs transition-opacity duration-[var(--admin-motion-standard)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-subtle-divider bg-paper p-6 shadow-xl transition-[opacity,transform] duration-[var(--admin-motion-standard)] ease-[var(--admin-ease-emphasis)] focus:outline-none data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0 motion-reduce:transition-none motion-reduce:data-[ending-style]:scale-100 motion-reduce:data-[starting-style]:scale-100">
          <Dialog.Title className="font-serif text-xl font-semibold text-ink">
            Leave with unsaved changes?
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-relaxed text-ink-muted">
            Your latest edits have not been saved. Stay here to keep working, or
            leave and discard those changes.
          </Dialog.Description>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Dialog.Close className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-control-border bg-paper px-4 py-2 text-sm font-semibold text-ink hover:bg-subtle-field/60 focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none">
              Stay and continue editing
            </Dialog.Close>
            <button
              type="button"
              onClick={() => {
                if (!pendingHref) return;
                bypassRef.current = true;
                window.location.assign(pendingHref);
              }}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-paper hover:bg-[#852E2E] focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
            >
              Leave without saving
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
