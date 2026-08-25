import { type Metadata } from "next";
import { LoginForm } from "./login-form";
import { TopicImprint } from "@/components/evidence/topic-imprint";

export const metadata: Metadata = {
  title: "Admin Sign In | Marie Medere",
  description: "Administrative access for Marie Medere Editorial Workspace.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F1E8] px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-[#D2C9BC] bg-[#FFFDF9] p-8 shadow-xs">
        <div className="space-y-3 text-center">
          <div className="flex justify-center">
            <TopicImprint>Editorial Workspace</TopicImprint>
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#242321]">
            Marie Medere
          </h1>
          <p className="text-xs text-[#5E5953]">
            Single-author medical writing and editorial administration.
          </p>
        </div>

        <LoginForm />

        <div className="border-t border-[#D2C9BC]/60 pt-4 text-center">
          <p className="text-[11px] text-[#5E5953]/80">
            Authorized editorial access only. All sessions are cryptographically
            verified.
          </p>
        </div>
      </div>
    </div>
  );
}
