"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  FileCode,
  Minus,
  Link2,
  Unlink,
  Undo2,
  Redo2,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TiptapToolbarProps {
  editor: Editor | null;
  disabled?: boolean;
}

export function TiptapToolbar({
  editor,
  disabled = false,
}: TiptapToolbarProps) {
  const [showLinkInput, setShowLinkInput] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");
  const [linkError, setLinkError] = React.useState<string | null>(null);

  if (!editor) {
    return null;
  }

  const handleOpenLinkModal = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setLinkError(null);
    setShowLinkInput(true);
  };

  const handleApplyLink = () => {
    const trimmed = linkUrl.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setShowLinkInput(false);
      return;
    }

    // Validate safe URL protocol per public renderer safe-link contract
    const isRelativeOrAnchor =
      trimmed.startsWith("/") || trimmed.startsWith("#");
    const isHttp = /^https?:\/\//i.test(trimmed);
    const isMailto = /^mailto:/i.test(trimmed);

    if (!isRelativeOrAnchor && !isHttp && !isMailto) {
      setLinkError("URL must start with http://, https://, mailto:, /, or #");
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: trimmed })
      .run();

    setShowLinkInput(false);
    setLinkError(null);
  };

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run();
    setShowLinkInput(false);
  };

  return (
    <div className="border-b border-[#D2C9BC] bg-[#F6F1E8]/70 px-3 py-2">
      {/* Primary Toolbar Row */}
      <div className="flex flex-wrap items-center gap-1">
        {/* Text Formatting Group */}
        <div className="mr-1 flex items-center gap-0.5 border-r border-[#D2C9BC] pr-1.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={
              disabled || !editor.can().chain().focus().toggleBold().run()
            }
            aria-label="Bold (Ctrl+B)"
            aria-pressed={editor.isActive("bold")}
            title="Bold"
            className={cn(
              "flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xs p-1.5 text-[#242321] transition-colors hover:bg-[#E8E2D7] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-40",
              editor.isActive("bold") &&
                "bg-[#E8E2D7] font-semibold text-[#7B3F35]",
            )}
          >
            <Bold className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={
              disabled || !editor.can().chain().focus().toggleItalic().run()
            }
            aria-label="Italic (Ctrl+I)"
            aria-pressed={editor.isActive("italic")}
            title="Italic"
            className={cn(
              "flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xs p-1.5 text-[#242321] transition-colors hover:bg-[#E8E2D7] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-40",
              editor.isActive("italic") &&
                "bg-[#E8E2D7] font-semibold text-[#7B3F35]",
            )}
          >
            <Italic className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={
              disabled || !editor.can().chain().focus().toggleStrike().run()
            }
            aria-label="Strikethrough"
            aria-pressed={editor.isActive("strike")}
            title="Strikethrough"
            className={cn(
              "flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xs p-1.5 text-[#242321] transition-colors hover:bg-[#E8E2D7] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-40",
              editor.isActive("strike") &&
                "bg-[#E8E2D7] font-semibold text-[#7B3F35]",
            )}
          >
            <Strikethrough className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={
              disabled || !editor.can().chain().focus().toggleCode().run()
            }
            aria-label="Inline Code"
            aria-pressed={editor.isActive("code")}
            title="Inline Code"
            className={cn(
              "flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xs p-1.5 text-[#242321] transition-colors hover:bg-[#E8E2D7] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-40",
              editor.isActive("code") &&
                "bg-[#E8E2D7] font-semibold text-[#7B3F35]",
            )}
          >
            <Code className="size-4" />
          </button>
        </div>

        {/* Heading Levels (H2 & H3 only; H1 disallowed) */}
        <div className="mr-1 flex items-center gap-0.5 border-r border-[#D2C9BC] pr-1.5">
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            disabled={disabled}
            aria-label="Heading 2"
            aria-pressed={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
            className={cn(
              "flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xs p-1.5 text-[#242321] transition-colors hover:bg-[#E8E2D7] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-40",
              editor.isActive("heading", { level: 2 }) &&
                "bg-[#E8E2D7] font-semibold text-[#7B3F35]",
            )}
          >
            <Heading2 className="size-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            disabled={disabled}
            aria-label="Heading 3"
            aria-pressed={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
            className={cn(
              "flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xs p-1.5 text-[#242321] transition-colors hover:bg-[#E8E2D7] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-40",
              editor.isActive("heading", { level: 3 }) &&
                "bg-[#E8E2D7] font-semibold text-[#7B3F35]",
            )}
          >
            <Heading3 className="size-4" />
          </button>
        </div>

        {/* Lists & Blockquote Group */}
        <div className="mr-1 flex items-center gap-0.5 border-r border-[#D2C9BC] pr-1.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={disabled}
            aria-label="Bullet List"
            aria-pressed={editor.isActive("bulletList")}
            title="Bullet List"
            className={cn(
              "flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xs p-1.5 text-[#242321] transition-colors hover:bg-[#E8E2D7] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-40",
              editor.isActive("bulletList") &&
                "bg-[#E8E2D7] font-semibold text-[#7B3F35]",
            )}
          >
            <List className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={disabled}
            aria-label="Numbered List"
            aria-pressed={editor.isActive("orderedList")}
            title="Numbered List"
            className={cn(
              "flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xs p-1.5 text-[#242321] transition-colors hover:bg-[#E8E2D7] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-40",
              editor.isActive("orderedList") &&
                "bg-[#E8E2D7] font-semibold text-[#7B3F35]",
            )}
          >
            <ListOrdered className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            disabled={disabled}
            aria-label="Blockquote"
            aria-pressed={editor.isActive("blockquote")}
            title="Blockquote"
            className={cn(
              "flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xs p-1.5 text-[#242321] transition-colors hover:bg-[#E8E2D7] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-40",
              editor.isActive("blockquote") &&
                "bg-[#E8E2D7] font-semibold text-[#7B3F35]",
            )}
          >
            <Quote className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            disabled={disabled}
            aria-label="Code Block"
            aria-pressed={editor.isActive("codeBlock")}
            title="Code Block"
            className={cn(
              "flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xs p-1.5 text-[#242321] transition-colors hover:bg-[#E8E2D7] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-40",
              editor.isActive("codeBlock") &&
                "bg-[#E8E2D7] font-semibold text-[#7B3F35]",
            )}
          >
            <FileCode className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            disabled={disabled}
            aria-label="Horizontal Rule"
            title="Horizontal Divider"
            className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xs p-1.5 text-[#242321] transition-colors hover:bg-[#E8E2D7] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
        </div>

        {/* Link Management Group */}
        <div className="mr-1 flex items-center gap-0.5 border-r border-[#D2C9BC] pr-1.5">
          <button
            type="button"
            onClick={handleOpenLinkModal}
            disabled={disabled}
            aria-label="Insert or edit link"
            aria-pressed={editor.isActive("link")}
            title="Link"
            className={cn(
              "flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xs p-1.5 text-[#242321] transition-colors hover:bg-[#E8E2D7] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-40",
              editor.isActive("link") &&
                "bg-[#E8E2D7] font-semibold text-[#7B3F35]",
            )}
          >
            <Link2 className="size-4" />
          </button>

          {editor.isActive("link") && (
            <button
              type="button"
              onClick={handleRemoveLink}
              disabled={disabled}
              aria-label="Remove link"
              title="Remove Link"
              className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xs p-1.5 text-[#7B3F35] transition-colors hover:bg-[#E8E2D7] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-40"
            >
              <Unlink className="size-4" />
            </button>
          )}
        </div>

        {/* History Group */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={disabled || !editor.can().chain().focus().undo().run()}
            aria-label="Undo (Ctrl+Z)"
            title="Undo"
            className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xs p-1.5 text-[#242321] transition-colors hover:bg-[#E8E2D7] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-40"
          >
            <Undo2 className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={disabled || !editor.can().chain().focus().redo().run()}
            aria-label="Redo (Ctrl+Y)"
            title="Redo"
            className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xs p-1.5 text-[#242321] transition-colors hover:bg-[#E8E2D7] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-40"
          >
            <Redo2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Inline Link Control Form */}
      {showLinkInput && (
        <div className="mt-2 flex flex-col gap-1.5 rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-3 shadow-xs">
          <div className="flex items-center gap-2">
            <label htmlFor="tiptap-link-url" className="sr-only">
              Link URL
            </label>
            <input
              id="tiptap-link-url"
              type="text"
              value={linkUrl}
              onChange={(e) => {
                setLinkUrl(e.target.value);
                setLinkError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApplyLink();
                } else if (e.key === "Escape") {
                  setShowLinkInput(false);
                }
              }}
              placeholder="https://example.com/research-paper"
              autoFocus
              className="flex-1 rounded-sm border border-[#918579] bg-[#FFFDF9] px-3 py-1.5 text-sm text-[#242321] placeholder-[#5E5953]/60 focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none"
            />
            <button
              type="button"
              onClick={handleApplyLink}
              aria-label="Apply link"
              className="inline-flex min-h-[36px] items-center gap-1 rounded-sm bg-[#7B3F35] px-3 py-1 text-xs font-medium text-[#FFFDF9] transition-colors hover:bg-[#704037] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none"
            >
              <Check className="size-3.5" />
              Apply
            </button>
            <button
              type="button"
              onClick={() => setShowLinkInput(false)}
              aria-label="Cancel link"
              className="inline-flex min-h-[36px] items-center justify-center rounded-sm border border-[#D2C9BC] bg-[#FFFDF9] p-1.5 text-[#5E5953] transition-colors hover:text-[#242321] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none"
            >
              <X className="size-4" />
            </button>
          </div>
          {linkError && (
            <p className="text-xs font-medium text-[#9A3636]">{linkError}</p>
          )}
        </div>
      )}
    </div>
  );
}
