"use client";

import { useState, type ReactElement } from "react";
import { Dialog } from "@base-ui/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";

interface ConfirmationDialogBaseProps {
  trigger: ReactElement;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  disabled?: boolean;
}

type ConfirmationDialogProps = ConfirmationDialogBaseProps &
  (
    | {
        onConfirm: () => void | Promise<void>;
        action?: never;
        fields?: never;
        pendingLabel?: never;
      }
    | {
        action: (formData: FormData) => void | Promise<void>;
        fields: Record<string, string>;
        pendingLabel: string;
        onConfirm?: never;
      }
  );

export function ConfirmationDialog({
  trigger,
  title,
  description,
  confirmLabel,
  onConfirm,
  action,
  fields,
  pendingLabel,
  destructive = false,
  disabled = false,
}: ConfirmationDialogProps) {
  const [open, setOpen] = useState(false);
  const confirmClassName = cn(
    "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-paper transition-colors duration-[var(--admin-motion-fast)] focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none motion-reduce:transition-none",
    destructive
      ? "bg-destructive hover:bg-[#852E2E]"
      : "bg-oxide hover:bg-oxide-link",
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger render={trigger} disabled={disabled} />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-xs transition-opacity duration-[var(--admin-motion-standard)] ease-[var(--admin-ease-standard)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-subtle-divider bg-paper p-6 shadow-xl transition-[opacity,transform] duration-[var(--admin-motion-standard)] ease-[var(--admin-ease-emphasis)] focus:outline-none data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0 motion-reduce:transition-none motion-reduce:data-[ending-style]:scale-100 motion-reduce:data-[starting-style]:scale-100">
          <Dialog.Title className="pr-9 font-serif text-xl font-semibold text-ink">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-relaxed text-ink-muted">
            {description}
          </Dialog.Description>

          <Dialog.Close className="absolute top-4 right-4 inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-ink-muted transition-colors duration-[var(--admin-motion-fast)] hover:bg-subtle-field hover:text-ink focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none motion-reduce:transition-none">
            <X className="size-4" />
            <span className="sr-only">Close confirmation</span>
          </Dialog.Close>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Dialog.Close className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-control-border bg-paper px-4 py-2 text-sm font-semibold text-ink transition-colors duration-[var(--admin-motion-fast)] hover:bg-subtle-field/60 focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none motion-reduce:transition-none">
              Cancel
            </Dialog.Close>
            {action ? (
              <form
                action={async (formData) => {
                  await action(formData);
                  setOpen(false);
                }}
              >
                {Object.entries(fields).map(([name, value]) => (
                  <input key={name} type="hidden" name={name} value={value} />
                ))}
                <AdminSubmitButton
                  pendingLabel={pendingLabel}
                  className={confirmClassName}
                >
                  {confirmLabel}
                </AdminSubmitButton>
              </form>
            ) : (
              <Dialog.Close onClick={onConfirm} className={confirmClassName}>
                {confirmLabel}
              </Dialog.Close>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
