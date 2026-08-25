import { type Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { ShieldCheck, UserCheck, KeyRound, Database } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | Marie Medere Workspace",
  description: "Editorial workspace and administrative overview.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  return (
    <div className="space-y-8">
      {/* Editorial Workspace Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-2 rounded-full bg-[#3D5A4C]" />
          <span className="text-xs font-semibold tracking-wider text-[#3D5A4C] uppercase">
            Workspace Authenticated
          </span>
        </div>
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#242321]">
          Editorial Overview
        </h2>
        <p className="text-sm text-[#5E5953]">
          Single-author administration for Marie Medere.
        </p>
      </div>

      {/* Security & System Status Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[#D2C9BC] bg-[#FFFDF9] p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-[#E8E2D7] p-2 text-[#7B3F35]">
              <UserCheck className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#5E5953]">
                Admin Identity
              </p>
              <p className="font-serif text-sm font-semibold text-[#242321]">
                {admin.email || "Allowlisted Admin"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[#D2C9BC] bg-[#FFFDF9] p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-[#E8E2D7] p-2 text-[#3D5A4C]">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#5E5953]">Access Gate</p>
              <p className="font-serif text-sm font-semibold text-[#242321]">
                public.is_admin() Active
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[#D2C9BC] bg-[#FFFDF9] p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-[#E8E2D7] p-2 text-[#265D7A]">
              <KeyRound className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#5E5953]">
                Session Security
              </p>
              <p className="font-serif text-sm font-semibold text-[#242321]">
                SSR Token Refresh Active
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[#D2C9BC] bg-[#FFFDF9] p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-[#E8E2D7] p-2 text-[#7B3F35]">
              <Database className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#5E5953]">Data Access</p>
              <p className="font-serif text-sm font-semibold text-[#242321]">
                Protected by RLS
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Environment Notice */}
      <div className="rounded-lg border border-[#D2C9BC] bg-[#FFFDF9] p-6 shadow-xs">
        <h3 className="font-serif text-base font-semibold text-[#242321]">
          Administrative Security Boundary
        </h3>
        <p className="mt-1 text-sm text-[#5E5953]">
          The Stage-4 authentication foundation is active. Content drafting,
          category assignments, comment moderation, and media management will be
          configured across subsequent authorized implementation stages.
        </p>
      </div>
    </div>
  );
}
