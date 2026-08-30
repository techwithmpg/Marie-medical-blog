import { z } from "zod";

const CATEGORY_NAME_MAX = 80;
const CATEGORY_SLUG_MAX = 80;
const CATEGORY_DESCRIPTION_MAX = 500;

export const CATEGORY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const CATEGORY_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const categoryNameSchema = z
  .string({ error: "Category name is required." })
  .transform((value) => value.trim())
  .refine((value) => value.length > 0, {
    message: "Category name cannot be blank.",
  })
  .refine((value) => value.length <= CATEGORY_NAME_MAX, {
    message: `Category name cannot exceed ${CATEGORY_NAME_MAX} characters.`,
  });

const categoryDescriptionSchema = z
  .string()
  .transform((value) => value.trim())
  .refine((value) => value.length <= CATEGORY_DESCRIPTION_MAX, {
    message: `Description cannot exceed ${CATEGORY_DESCRIPTION_MAX} characters.`,
  })
  .transform((value) => (value.length === 0 ? null : value));

const categorySlugSchema = z
  .string({ error: "Category slug is required." })
  .transform((value) => normalizeCategorySlug(value))
  .refine((value) => value.length > 0, {
    message: "Category slug is required.",
  })
  .refine((value) => value.length <= CATEGORY_SLUG_MAX, {
    message: `Category slug cannot exceed ${CATEGORY_SLUG_MAX} characters.`,
  })
  .refine((value) => CATEGORY_SLUG_PATTERN.test(value), {
    message:
      "Use lowercase letters, numbers, and single hyphens only (for example, health-literacy).",
  });

const categoryIdSchema = z
  .string({ error: "A valid category is required." })
  .regex(CATEGORY_UUID_PATTERN, { message: "A valid category is required." });

export const createCategorySchema = z
  .object({
    name: categoryNameSchema,
    slug: categorySlugSchema,
    description: categoryDescriptionSchema,
  })
  .strict();

export const updateCategorySchema = z
  .object({
    categoryId: categoryIdSchema,
    name: categoryNameSchema,
    description: categoryDescriptionSchema,
  })
  .strict();

export const deleteCategorySchema = z
  .object({
    categoryId: categoryIdSchema,
  })
  .strict();

export type CategoryFieldErrors = Record<string, string[]>;

export function generateCategorySlug(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, CATEGORY_SLUG_MAX)
    .replace(/-+$/g, "");
}

export function normalizeCategorySlug(value: string): string {
  return value.trim().toLowerCase();
}

export function getCategoryFormFields(
  formData: FormData,
  allowedFields: readonly string[],
): Record<string, string> | null {
  const allowed = new Set(allowedFields);

  for (const key of formData.keys()) {
    if (!key.startsWith("$ACTION_") && !allowed.has(key)) {
      return null;
    }
  }

  return Object.fromEntries(
    allowedFields.map((field) => [
      field,
      typeof formData.get(field) === "string"
        ? formData.get(field)!.toString()
        : "",
    ]),
  );
}

export function flattenCategoryErrors(error: z.ZodError): CategoryFieldErrors {
  const fieldErrors: CategoryFieldErrors = {};
  const flattened = error.flatten().fieldErrors as Record<
    string,
    string[] | undefined
  >;

  for (const [field, messages] of Object.entries(flattened)) {
    if (messages && messages.length > 0) {
      fieldErrors[field] = messages;
    }
  }

  return fieldErrors;
}

export function isDuplicateCategorySlugError(error: {
  code?: string;
  message?: string;
  details?: string;
}): boolean {
  const detail = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();
  return (
    error.code === "23505" &&
    (detail.includes("categories_slug") ||
      detail.includes("uq_categories_slug"))
  );
}

export function isCategoryReferenceError(error: {
  code?: string;
  message?: string;
  details?: string;
}): boolean {
  const detail = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();
  return (
    error.code === "23503" ||
    detail.includes("articles_category_id_fkey") ||
    detail.includes("still referenced")
  );
}
