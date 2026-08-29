import { type Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminCategoryRecords } from "@/lib/admin/categories";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata: Metadata = {
  title: "Categories | Marie Medere Workspace",
  description: "Manage editorial Categories and permanent public topic URLs.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await getAdminCategoryRecords();

  return <CategoryManager categories={categories} />;
}
