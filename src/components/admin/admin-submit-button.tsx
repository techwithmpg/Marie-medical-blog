"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  pendingLabel: string;
}

export function AdminSubmitButton({
  children,
  pendingLabel,
  className,
  disabled,
  ...props
}: AdminSubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-disabled={disabled || pending}
      className={cn(className, "disabled:cursor-wait disabled:opacity-60")}
      {...props}
    >
      {pending ? (
        <>
          <Loader2
            className="size-3.5 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
          <span>{pendingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
