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
            class: "text-[#704037] underline underline-offset-2",
            rel: "noopener noreferrer",
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class:
              "rounded border border-[#D2C9BC] bg-[#E8E2D7] p-4 font-mono text-sm text-[#242321] my-4 overflow-x-auto",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class:
              "border-l-2 border-[#7B3F35] pl-4 italic text-[#5E5953] my-4",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-6 space-y-1.5 my-3 text-[#242321]",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-6 space-y-1.5 my-3 text-[#242321]",
          },
        },
        horizontalRule: {
          HTMLAttributes: {
            class: "my-6 border-t border-[#D2C9BC]",
          },
        },
      }),
      Placeholder.configure({
        placeholder: "Write Marie's medical article content here...",
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-[#5E5953]/50 before:float-left before:pointer-events-none before:h-0",
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
          "prose min-h-[360px] max-w-none px-6 py-5 text-[#242321] font-sans text-base leading-relaxed focus:outline-none focus-visible:outline-none",
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
        "rounded-md border border-[#D2C9BC] bg-[#FFFDF9] shadow-xs transition-colors focus-within:border-[#265D7A] focus-within:ring-1 focus-within:ring-[#265D7A]",
        disabled && "bg-[#E8E2D7]/30 opacity-60",
      )}
    >
      <TiptapToolbar editor={editor} disabled={disabled} />
      <div className="cursor-text">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
