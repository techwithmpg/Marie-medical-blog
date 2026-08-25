"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { TiptapToolbar } from "./tiptap-toolbar";
import { cn } from "@/lib/utils";

interface TiptapEditorProps {
  initialContent: Record<string, unknown>;
  onChange: (json: Record<string, unknown>) => void;
  disabled?: boolean;
}

export function TiptapEditor({
  initialContent,
  onChange,
  disabled = false,
}: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        underline: false,
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            class:
              "text-oxide-link underline underline-offset-2 hover:text-oxide",
            rel: "noopener noreferrer",
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class:
              "rounded border border-subtle-divider bg-subtle-field p-4 font-mono text-sm text-ink my-4 overflow-x-auto",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-2 border-oxide pl-4 italic text-ink-muted my-4",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-6 space-y-1.5 my-3 text-ink",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-6 space-y-1.5 my-3 text-ink",
          },
        },
        horizontalRule: {
          HTMLAttributes: {
            class: "my-6 border-t border-subtle-divider",
          },
        },
      }),
      Placeholder.configure({
        placeholder: "Write Marie's medical article content here...",
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-ink-muted/50 before:float-left before:pointer-events-none before:h-0",
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getJSON() as Record<string, unknown>);
    },
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-label": "Article content",
        class:
          "min-h-[360px] max-w-none px-6 py-5 text-ink font-sans text-base leading-relaxed focus:outline-none focus-visible:outline-none [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-ink [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:font-sans [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-ink [&_p]:my-3 [&_code]:font-mono [&_code]:text-sm [&_code]:bg-subtle-field [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-ink",
      },
    },
  });

  // Keep editable property in sync
  React.useEffect(() => {
    if (editor && editor.isEditable === disabled) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  return (
    <div
      className={cn(
        "rounded-md border border-subtle-divider bg-paper shadow-xs transition-colors focus-within:border-focus-slate focus-within:ring-1 focus-within:ring-focus-slate",
        disabled && "bg-subtle-field/30 opacity-60",
      )}
    >
      <TiptapToolbar editor={editor} disabled={disabled} />
      <div className="cursor-text">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
