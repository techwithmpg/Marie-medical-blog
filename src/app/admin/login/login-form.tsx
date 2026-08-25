"use client";

import * as React from "react";
import { useActionState } from "react";
import { loginAction, type LoginActionResult } from "./actions";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<
    LoginActionResult | null,
    FormData
  >(loginAction, null);

  return (
    <form action={formAction} className="space-y-5" noValidate={false}>
      {state?.error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-md border border-[#C28277] bg-[#FDF5F4] p-3 text-sm text-[#7B3F35]"
        >
          {state.error}
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="admin-email"
          className="block text-xs font-semibold tracking-wider text-[#242321] uppercase"
        >
          Email address
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="marie@example.com"
          className="w-full rounded-md border border-[#D2C9BC] bg-[#FFFDF9] px-3.5 py-2.5 text-sm text-[#242321] transition-colors placeholder:text-[#5E5953]/60 focus-visible:border-[#265D7A] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="admin-password"
          className="block text-xs font-semibold tracking-wider text-[#242321] uppercase"
        >
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••••••"
          className="w-full rounded-md border border-[#D2C9BC] bg-[#FFFDF9] px-3.5 py-2.5 text-sm text-[#242321] transition-colors placeholder:text-[#5E5953]/60 focus-visible:border-[#265D7A] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-11 w-full bg-[#7B3F35] text-white hover:bg-[#68332A] focus-visible:ring-[#265D7A]"
      >
        {isPending ? "Signing in..." : "Sign in to workspace"}
      </Button>
    </form>
  );
}
