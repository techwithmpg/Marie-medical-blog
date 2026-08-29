"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import {
  createCategorySchema,
  deleteCategorySchema,
  flattenCategoryErrors,
  generateCategorySlug,
  getCategoryFormFields,
  isCategoryReferenceError,
  isDuplicateCategorySlugError,
  updateCategorySchema,
  type CategoryFieldErrors,
} from "@/lib/admin/category-validation";

export interface CategoryActionResult {
  success: boolean;
  message: string;
  fieldErrors?: CategoryFieldErrors;
  error?:
    | "INVALID_PAYLOAD"
    | "VALIDATION_FAILED"
    | "DUPLICATE_SLUG"
    | "NOT_FOUND"
    | "CATEGORY_IN_USE"
    | "PERSISTENCE_FAILED";
}

interface CategoryArticleContext {
  slug: string;
  status: string;
}

function invalidPayloadResult(): CategoryActionResult {
  return {
    success: false,
    message: "The Category request was not valid. Please try again.",
    error: "INVALID_PAYLOAD",
  };
}

function validationResult(
  fieldErrors: CategoryFieldErrors,
): CategoryActionResult {
  return {
    success: false,
    message: "Please correct the highlighted Category fields.",
    fieldErrors,
    error: "VALIDATION_FAILED",
  };
}

function revalidateCategoryAuthoringSurfaces(): void {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/articles/new");
  revalidatePath("/admin/articles/[id]", "page");
}

function revalidateCategoryPublicSurfaces(
  categorySlug: string,
  articles: CategoryArticleContext[] = [],
): void {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/portfolio");
  revalidatePath(`/topics/${categorySlug}`);

  for (const article of articles) {
    if (article.status === "published" && article.slug) {
      revalidatePath(`/blog/${article.slug}`);
    }
  }
}

export async function createCategoryAction(
  _previousState: CategoryActionResult | null,
  formData: FormData,
): Promise<CategoryActionResult> {
  await requireAdmin();

  const fields = getCategoryFormFields(formData, [
    "name",
    "slug",
    "description",
  ]);
  if (!fields) return invalidPayloadResult();

  const createInput = {
    ...fields,
    slug: fields.slug.trim() || generateCategorySlug(fields.name),
  };
  const parsed = createCategorySchema.safeParse(createInput);

  if (!parsed.success) {
    return validationResult(flattenCategoryErrors(parsed.error));
  }

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
  });

  if (error) {
    if (isDuplicateCategorySlugError(error)) {
      return {
        success: false,
        message: "That Category URL is already in use.",
        fieldErrors: {
          slug: ["Choose a different Category slug."],
        },
        error: "DUPLICATE_SLUG",
      };
    }

    return {
      success: false,
      message: "Unable to create the Category. Please try again.",
      error: "PERSISTENCE_FAILED",
    };
  }

  revalidateCategoryAuthoringSurfaces();
  revalidatePath("/blog");

  return {
    success: true,
    message: `Category “${parsed.data.name}” created.`,
  };
}

export async function updateCategoryAction(
  _previousState: CategoryActionResult | null,
  formData: FormData,
): Promise<CategoryActionResult> {
  await requireAdmin();

  const fields = getCategoryFormFields(formData, [
    "categoryId",
    "name",
    "description",
  ]);
  if (!fields) return invalidPayloadResult();

  const parsed = updateCategorySchema.safeParse(fields);
  if (!parsed.success) {
    return validationResult(flattenCategoryErrors(parsed.error));
  }

  const supabase = await createClient();
  const [
    { data: category, error: categoryError },
    { data: articleRows, error: articleError },
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug")
      .eq("id", parsed.data.categoryId)
      .maybeSingle(),
    supabase
      .from("articles")
      .select("slug, status")
      .eq("category_id", parsed.data.categoryId),
  ]);

  if (categoryError || articleError) {
    return {
      success: false,
      message: "Unable to verify the Category before saving. Please try again.",
      error: "PERSISTENCE_FAILED",
    };
  }

  if (!category) {
    return {
      success: false,
      message: "This Category no longer exists.",
      error: "NOT_FOUND",
    };
  }

  const { data: updatedRows, error: updateError } = await supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
    })
    .eq("id", parsed.data.categoryId)
    .select("id");

  if (updateError || !updatedRows || updatedRows.length !== 1) {
    return {
      success: false,
      message: "Unable to save the Category. Please try again.",
      error: "PERSISTENCE_FAILED",
    };
  }

  revalidateCategoryAuthoringSurfaces();
  revalidateCategoryPublicSurfaces(
    category.slug,
    (articleRows ?? []) as CategoryArticleContext[],
  );

  return {
    success: true,
    message: `Category “${parsed.data.name}” updated.`,
  };
}

export async function deleteCategoryAction(
  _previousState: CategoryActionResult | null,
  formData: FormData,
): Promise<CategoryActionResult> {
  await requireAdmin();

  const fields = getCategoryFormFields(formData, ["categoryId"]);
  if (!fields) return invalidPayloadResult();

  const parsed = deleteCategorySchema.safeParse(fields);
  if (!parsed.success) {
    return validationResult(flattenCategoryErrors(parsed.error));
  }

  const supabase = await createClient();
  const [
    { data: category, error: categoryError },
    { count, error: countError },
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug")
      .eq("id", parsed.data.categoryId)
      .maybeSingle(),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("category_id", parsed.data.categoryId),
  ]);

  if (categoryError || countError) {
    return {
      success: false,
      message: "Unable to verify Category usage. Please try again.",
      error: "PERSISTENCE_FAILED",
    };
  }

  if (!category) {
    return {
      success: false,
      message: "This Category no longer exists.",
      error: "NOT_FOUND",
    };
  }

  if ((count ?? 0) > 0) {
    return {
      success: false,
      message: `This Category is used by ${count} ${count === 1 ? "article" : "articles"} and cannot be deleted.`,
      error: "CATEGORY_IN_USE",
    };
  }

  const { data: deletedRows, error: deleteError } = await supabase
    .from("categories")
    .delete()
    .eq("id", parsed.data.categoryId)
    .select("id");

  if (deleteError) {
    if (isCategoryReferenceError(deleteError)) {
      return {
        success: false,
        message: "This category is currently in use and cannot be deleted.",
        error: "CATEGORY_IN_USE",
      };
    }

    return {
      success: false,
      message: "Unable to delete the Category. Please try again.",
      error: "PERSISTENCE_FAILED",
    };
  }

  if (!deletedRows || deletedRows.length !== 1) {
    return {
      success: false,
      message: "This Category no longer exists.",
      error: "NOT_FOUND",
    };
  }

  revalidateCategoryAuthoringSurfaces();
  revalidatePath("/blog");
  revalidatePath(`/topics/${category.slug}`);

  return {
    success: true,
    message: `Category “${category.name}” deleted.`,
  };
}
