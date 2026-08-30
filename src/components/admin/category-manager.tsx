"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  FolderTree,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  type CategoryActionResult,
} from "@/app/admin/categories/actions";
import { generateCategorySlug } from "@/lib/admin/category-validation";
import type { AdminCategoryRecord } from "@/lib/admin/categories";
import { cn, formatAdminDate } from "@/lib/utils";

interface CategoryManagerProps {
  categories: AdminCategoryRecord[];
}

interface ActionFeedbackProps {
  state: CategoryActionResult | null;
  className?: string;
  feedbackRef?: React.Ref<HTMLDivElement>;
}

function ActionFeedback({
  state,
  className,
  feedbackRef,
}: ActionFeedbackProps) {
  if (!state?.message) return null;

  return (
    <div
      ref={feedbackRef}
      role={state.success ? "status" : "alert"}
      aria-live={state.success ? "polite" : "assertive"}
      tabIndex={state.success ? undefined : -1}
      className={cn(
        "flex items-start gap-3 rounded-md border p-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none",
        state.success
          ? "border-success/30 bg-success/10 text-success"
          : "border-warning/30 bg-warning/10 text-warning",
        className,
      )}
    >
      {state.success ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      ) : (
        <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      )}
      <span>{state.message}</span>
    </div>
  );
}

function FieldError({ id, messages }: { id: string; messages?: string[] }) {
  if (!messages?.length) return null;

  return (
    <p id={id} className="text-xs font-medium text-warning">
      {messages[0]}
    </p>
  );
}

const inputClassName =
  "bg-reading-surface w-full rounded-md border border-subtle-divider px-3.5 py-2.5 text-sm text-ink transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-subtle-field disabled:text-ink-muted";

const labelClassName =
  "text-xs font-semibold tracking-wider text-ink uppercase";

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [showCreate, setShowCreate] = React.useState(categories.length === 0);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    React.useState(false);

  const [createName, setCreateName] = React.useState("");
  const [createSlug, setCreateSlug] = React.useState("");
  const [createDescription, setCreateDescription] = React.useState("");
  const [slugWasEdited, setSlugWasEdited] = React.useState(false);

  const [editName, setEditName] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");

  const [createState, createFormAction, createPending] = React.useActionState<
    CategoryActionResult | null,
    FormData
  >(createCategoryAction, null);
  const [updateState, updateFormAction, updatePending] = React.useActionState<
    CategoryActionResult | null,
    FormData
  >(updateCategoryAction, null);
  const [deleteState, deleteFormAction, deletePending] = React.useActionState<
    CategoryActionResult | null,
    FormData
  >(deleteCategoryAction, null);

  const createHeadingRef = React.useRef<HTMLHeadingElement>(null);
  const editHeadingRef = React.useRef<HTMLHeadingElement>(null);
  const deleteHeadingRef = React.useRef<HTMLHeadingElement>(null);
  const deleteTriggerRef = React.useRef<HTMLButtonElement>(null);
  const createFeedbackRef = React.useRef<HTMLDivElement>(null);
  const updateFeedbackRef = React.useRef<HTMLDivElement>(null);
  const deleteFeedbackRef = React.useRef<HTMLDivElement>(null);

  const selectedCategory = categories.find(
    (category) => category.id === selectedId,
  );

  React.useEffect(() => {
    if (createState && !createState.success) {
      createFeedbackRef.current?.focus();
    }
  }, [createState]);

  React.useEffect(() => {
    if (updateState && !updateState.success) {
      updateFeedbackRef.current?.focus();
    }
  }, [updateState]);

  React.useEffect(() => {
    if (deleteState && !deleteState.success) {
      deleteFeedbackRef.current?.focus();
    }
  }, [deleteState]);

  function openCreatePanel() {
    setSelectedId(null);
    setShowCreate(true);
    setShowDeleteConfirmation(false);
    requestAnimationFrame(() => createHeadingRef.current?.focus());
  }

  function selectCategory(category: AdminCategoryRecord) {
    setSelectedId(category.id);
    setShowCreate(false);
    setShowDeleteConfirmation(false);
    setEditName(category.name);
    setEditDescription(category.description ?? "");
    requestAnimationFrame(() => editHeadingRef.current?.focus());
  }

  function openDeleteConfirmation() {
    setShowDeleteConfirmation(true);
    requestAnimationFrame(() => deleteHeadingRef.current?.focus());
  }

  function closeDeleteConfirmation() {
    setShowDeleteConfirmation(false);
    requestAnimationFrame(() => deleteTriggerRef.current?.focus());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-subtle-divider pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-oxide uppercase">
            Editorial taxonomy
          </p>
          <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-ink">
            Category Management
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-muted">
            Organize article topics while preserving permanent public Category
            URLs.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreatePanel}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-oxide px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-oxide/90 focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Plus className="size-4" aria-hidden="true" />
          New Category
        </button>
      </div>

      <ActionFeedback state={deleteState} feedbackRef={deleteFeedbackRef} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
        <section
          aria-labelledby="category-list-heading"
          className="overflow-hidden rounded-lg border border-subtle-divider bg-paper shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-subtle-divider px-5 py-4">
            <div>
              <h3
                id="category-list-heading"
                className="font-serif text-lg font-semibold text-ink"
              >
                Categories
              </h3>
              <p className="mt-0.5 text-xs text-ink-muted">
                {categories.length}{" "}
                {categories.length === 1 ? "topic" : "topics"}
              </p>
            </div>
            <FolderTree className="size-5 text-oxide" aria-hidden="true" />
          </div>

          {categories.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FolderTree
                className="mx-auto size-9 text-ink-muted/45"
                aria-hidden="true"
              />
              <h4 className="mt-3 font-serif text-lg font-semibold text-ink">
                No Categories yet
              </h4>
              <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">
                Create the first topic to make it available in the article
                editor and public discovery filters.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-subtle-divider">
              {categories.map((category) => {
                const isSelected = category.id === selectedId;

                return (
                  <li key={category.id}>
                    <button
                      type="button"
                      onClick={() => selectCategory(category)}
                      aria-pressed={isSelected}
                      className={cn(
                        "flex min-h-20 w-full cursor-pointer items-start justify-between gap-4 px-5 py-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none focus-visible:ring-inset",
                        isSelected
                          ? "bg-subtle-field"
                          : "hover:bg-parchment/45",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block font-semibold text-ink">
                          {category.name}
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-xs text-ink-muted">
                          /topics/{category.slug}
                        </span>
                        {category.description && (
                          <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-ink-muted">
                            {category.description}
                          </span>
                        )}
                      </span>
                      <span className="bg-reading-surface inline-flex shrink-0 items-center gap-1.5 rounded-full border border-subtle-divider px-2.5 py-1 text-xs font-semibold text-ink-muted">
                        <FileText className="size-3" aria-hidden="true" />
                        {category.article_count}
                        <span className="sr-only">
                          {category.article_count === 1
                            ? " article"
                            : " articles"}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="lg:sticky lg:top-24">
          {showCreate ? (
            <section className="rounded-lg border border-subtle-divider bg-paper p-5 shadow-xs sm:p-6">
              <h3
                ref={createHeadingRef}
                tabIndex={-1}
                className="font-serif text-xl font-semibold text-ink focus:outline-none"
              >
                New Category
              </h3>
              <p className="mt-1 text-sm text-ink-muted">
                Set the permanent topic URL before creating the Category.
              </p>

              <ActionFeedback
                state={createState}
                feedbackRef={createFeedbackRef}
                className="mt-5"
              />

              <form
                action={createFormAction}
                className="mt-6 space-y-5"
                noValidate
              >
                <div className="space-y-1.5">
                  <label htmlFor="category-name" className={labelClassName}>
                    Name <span className="text-oxide">*</span>
                  </label>
                  <input
                    id="category-name"
                    name="name"
                    type="text"
                    value={createName}
                    maxLength={80}
                    required
                    autoComplete="off"
                    aria-invalid={Boolean(createState?.fieldErrors?.name)}
                    aria-describedby={
                      createState?.fieldErrors?.name
                        ? "category-name-error"
                        : "category-name-hint"
                    }
                    onChange={(event) => {
                      const value = event.target.value;
                      setCreateName(value);
                      if (!slugWasEdited) {
                        setCreateSlug(generateCategorySlug(value));
                      }
                    }}
                    className={inputClassName}
                  />
                  <p id="category-name-hint" className="text-xs text-ink-muted">
                    A clear editorial topic label, up to 80 characters.
                  </p>
                  <FieldError
                    id="category-name-error"
                    messages={createState?.fieldErrors?.name}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="category-slug" className={labelClassName}>
                    Slug <span className="text-oxide">*</span>
                  </label>
                  <div className="bg-reading-surface flex rounded-md border border-subtle-divider focus-within:ring-2 focus-within:ring-focus-slate">
                    <span className="flex items-center border-r border-subtle-divider px-3 font-mono text-xs text-ink-muted">
                      /topics/
                    </span>
                    <input
                      id="category-slug"
                      name="slug"
                      type="text"
                      value={createSlug}
                      maxLength={80}
                      required
                      autoComplete="off"
                      spellCheck={false}
                      aria-invalid={Boolean(createState?.fieldErrors?.slug)}
                      aria-describedby={
                        createState?.fieldErrors?.slug
                          ? "category-slug-error"
                          : "category-slug-hint"
                      }
                      onChange={(event) => {
                        setCreateSlug(event.target.value.toLowerCase());
                        setSlugWasEdited(true);
                      }}
                      className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 font-mono text-sm text-ink focus:outline-none"
                    />
                  </div>
                  <p id="category-slug-hint" className="text-xs text-ink-muted">
                    You may edit this now. It becomes permanent after creation.
                  </p>
                  <FieldError
                    id="category-slug-error"
                    messages={createState?.fieldErrors?.slug}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="category-description"
                      className={labelClassName}
                    >
                      Description
                    </label>
                    <span className="font-mono text-xs text-ink-muted">
                      {createDescription.length} / 500
                    </span>
                  </div>
                  <textarea
                    id="category-description"
                    name="description"
                    value={createDescription}
                    maxLength={500}
                    rows={5}
                    aria-invalid={Boolean(
                      createState?.fieldErrors?.description,
                    )}
                    aria-describedby={
                      createState?.fieldErrors?.description
                        ? "category-description-error"
                        : undefined
                    }
                    onChange={(event) =>
                      setCreateDescription(event.target.value)
                    }
                    className={cn(inputClassName, "resize-y")}
                  />
                  <FieldError
                    id="category-description-error"
                    messages={createState?.fieldErrors?.description}
                  />
                </div>

                <button
                  type="submit"
                  disabled={createPending}
                  className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-oxide px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-oxide/90 focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  {createPending ? "Creating…" : "Create Category"}
                </button>
              </form>
            </section>
          ) : selectedCategory ? (
            <section className="rounded-lg border border-subtle-divider bg-paper p-5 shadow-xs sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-oxide uppercase">
                    Category details
                  </p>
                  <h3
                    ref={editHeadingRef}
                    tabIndex={-1}
                    className="mt-1 font-serif text-xl font-semibold text-ink focus:outline-none"
                  >
                    Edit {selectedCategory.name}
                  </h3>
                </div>
                <Pencil className="size-4 text-ink-muted" aria-hidden="true" />
              </div>

              <ActionFeedback
                state={updateState}
                feedbackRef={updateFeedbackRef}
                className="mt-5"
              />

              <form
                key={selectedCategory.id}
                action={updateFormAction}
                className="mt-6 space-y-5"
                noValidate
              >
                <input
                  type="hidden"
                  name="categoryId"
                  value={selectedCategory.id}
                />

                <div className="space-y-1.5">
                  <label
                    htmlFor="edit-category-name"
                    className={labelClassName}
                  >
                    Name <span className="text-oxide">*</span>
                  </label>
                  <input
                    id="edit-category-name"
                    name="name"
                    type="text"
                    value={editName}
                    maxLength={80}
                    required
                    aria-invalid={Boolean(updateState?.fieldErrors?.name)}
                    aria-describedby={
                      updateState?.fieldErrors?.name
                        ? "edit-category-name-error"
                        : undefined
                    }
                    onChange={(event) => setEditName(event.target.value)}
                    className={inputClassName}
                  />
                  <FieldError
                    id="edit-category-name-error"
                    messages={updateState?.fieldErrors?.name}
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="edit-category-slug"
                    className={labelClassName}
                  >
                    Permanent slug
                  </label>
                  <input
                    id="edit-category-slug"
                    type="text"
                    value={selectedCategory.slug}
                    readOnly
                    aria-describedby="edit-category-slug-explanation"
                    className={cn(inputClassName, "font-mono")}
                  />
                  <p
                    id="edit-category-slug-explanation"
                    className="text-xs leading-relaxed text-ink-muted"
                  >
                    Category URLs are permanent after creation to preserve
                    public topic links. Delete and recreate an unused Category
                    if its slug is incorrect.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="edit-category-description"
                      className={labelClassName}
                    >
                      Description
                    </label>
                    <span className="font-mono text-xs text-ink-muted">
                      {editDescription.length} / 500
                    </span>
                  </div>
                  <textarea
                    id="edit-category-description"
                    name="description"
                    value={editDescription}
                    maxLength={500}
                    rows={5}
                    aria-invalid={Boolean(
                      updateState?.fieldErrors?.description,
                    )}
                    aria-describedby={
                      updateState?.fieldErrors?.description
                        ? "edit-category-description-error"
                        : undefined
                    }
                    onChange={(event) => setEditDescription(event.target.value)}
                    className={cn(inputClassName, "resize-y")}
                  />
                  <FieldError
                    id="edit-category-description-error"
                    messages={updateState?.fieldErrors?.description}
                  />
                </div>

                <div className="rounded-md border border-subtle-divider bg-parchment/35 p-3 text-xs text-ink-muted">
                  <p className="font-semibold text-ink">
                    {selectedCategory.article_count}{" "}
                    {selectedCategory.article_count === 1
                      ? "article uses"
                      : "articles use"}{" "}
                    this Category
                  </p>
                  <p className="mt-1">
                    Last updated {formatAdminDate(selectedCategory.updated_at)}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={updatePending}
                  className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-ink/90 focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="size-4" aria-hidden="true" />
                  {updatePending ? "Saving…" : "Save Category"}
                </button>
              </form>

              <div className="mt-6 border-t border-subtle-divider pt-5">
                {!showDeleteConfirmation ? (
                  <button
                    ref={deleteTriggerRef}
                    type="button"
                    onClick={openDeleteConfirmation}
                    className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-warning/30 bg-paper px-4 py-2 text-sm font-semibold text-warning transition-colors hover:bg-warning/10 focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Review deletion
                  </button>
                ) : (
                  <div className="rounded-md border border-warning/30 bg-warning/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4
                          ref={deleteHeadingRef}
                          tabIndex={-1}
                          className="font-semibold text-warning focus:outline-none"
                        >
                          Delete {selectedCategory.name}?
                        </h4>
                        {selectedCategory.article_count > 0 ? (
                          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                            This Category is used by{" "}
                            {selectedCategory.article_count}{" "}
                            {selectedCategory.article_count === 1
                              ? "article"
                              : "articles"}{" "}
                            and cannot be deleted. Reassign those articles
                            first.
                          </p>
                        ) : (
                          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                            This permanently removes the unused Category and its
                            public topic URL. This action cannot be undone.
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={closeDeleteConfirmation}
                        aria-label="Close delete confirmation"
                        className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:bg-warning/10 hover:text-warning focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    </div>

                    {selectedCategory.article_count === 0 && (
                      <form action={deleteFormAction} className="mt-4">
                        <input
                          type="hidden"
                          name="categoryId"
                          value={selectedCategory.id}
                        />
                        <button
                          type="submit"
                          disabled={deletePending}
                          className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-warning px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-warning/90 focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          {deletePending
                            ? "Deleting…"
                            : `Delete ${selectedCategory.name}`}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="rounded-lg border border-dashed border-subtle-divider bg-parchment/25 px-6 py-12 text-center">
              <Pencil
                className="mx-auto size-8 text-ink-muted/45"
                aria-hidden="true"
              />
              <h3 className="mt-3 font-serif text-lg font-semibold text-ink">
                Select a Category
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">
                Choose a Category to edit its name or description, review its
                permanent slug, and check whether it can be deleted.
              </p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
