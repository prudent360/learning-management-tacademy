"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  LinkIcon,
} from "@/components/icons";

export type RichTextEditorHandle = {
  insertText: (text: string) => void;
};

const FORMAT_OPTIONS = [
  { label: "Paragraph", value: "p" },
  { label: "Heading 1", value: "h1" },
  { label: "Heading 2", value: "h2" },
  { label: "Quote", value: "blockquote" },
];

function looksLikeHtml(value: string) {
  return /<[a-z][\s\S]*>/i.test(value);
}

// Templates saved before this editor existed stored plain text; render them
// as paragraphs so line breaks survive the switch to a contentEditable body.
function toEditableHtml(value: string) {
  if (!value) return "";
  if (looksLikeHtml(value)) return value;
  const escaped = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped
    .split("\n")
    .map((line) => `<p>${line || "<br>"}</p>`)
    .join("");
}

export const RichTextEditor = forwardRef<
  RichTextEditorHandle,
  { value: string; onChange: (html: string) => void }
>(function RichTextEditor({ value, onChange }, ref) {
  const editableRef = useRef<HTMLDivElement>(null);
  // Tracks the last HTML *we* emitted via onChange, so the sync effect below
  // can tell "value changed because the parent loaded new data" (re-sync the
  // DOM) apart from "value changed because it's an echo of our own typing"
  // (skip, or every keystroke would reset the cursor to the start).
  const lastEmittedRef = useRef<string | null>(null);

  useEffect(() => {
    if (value !== lastEmittedRef.current && editableRef.current) {
      editableRef.current.innerHTML = toEditableHtml(value);
      lastEmittedRef.current = value;
    }
  }, [value]);

  const emit = (html: string) => {
    lastEmittedRef.current = html;
    onChange(html);
  };

  useImperativeHandle(ref, () => ({
    insertText(text: string) {
      editableRef.current?.focus();
      document.execCommand("insertText", false, text);
      if (editableRef.current) emit(editableRef.current.innerHTML);
    },
  }));

  const exec = (command: string, arg?: string) => {
    editableRef.current?.focus();
    document.execCommand(command, false, arg);
    if (editableRef.current) emit(editableRef.current.innerHTML);
  };

  const handleLink = () => {
    const url = window.prompt("Enter URL");
    if (url) exec("createLink", url);
  };

  // Toolbar buttons steal focus on click, which collapses the editor's text
  // selection before execCommand runs. Blocking mousedown keeps focus (and
  // the selection) inside the contentEditable the whole time.
  const preventFocusLoss = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div className="flex flex-wrap items-center gap-1 border-b border-line bg-surface-muted px-2 py-1.5">
        <ToolbarButton icon={BoldIcon} label="Bold" onMouseDown={preventFocusLoss} onClick={() => exec("bold")} />
        <ToolbarButton icon={ItalicIcon} label="Italic" onMouseDown={preventFocusLoss} onClick={() => exec("italic")} />
        <ToolbarButton
          icon={UnderlineIcon}
          label="Underline"
          onMouseDown={preventFocusLoss}
          onClick={() => exec("underline")}
        />
        <div className="mx-1 h-5 w-px bg-line" />
        <ToolbarButton
          icon={ListIcon}
          label="Bullet list"
          onMouseDown={preventFocusLoss}
          onClick={() => exec("insertUnorderedList")}
        />
        <ToolbarButton
          icon={AlignLeftIcon}
          label="Align left"
          onMouseDown={preventFocusLoss}
          onClick={() => exec("justifyLeft")}
        />
        <ToolbarButton
          icon={AlignCenterIcon}
          label="Align center"
          onMouseDown={preventFocusLoss}
          onClick={() => exec("justifyCenter")}
        />
        <div className="mx-1 h-5 w-px bg-line" />
        <select
          onChange={(e) => {
            exec("formatBlock", e.target.value);
            e.target.value = "";
          }}
          defaultValue=""
          className="rounded-md border border-line bg-surface px-2 py-1 text-xs font-medium text-slate-600 outline-none"
        >
          <option value="" disabled>
            Format
          </option>
          {FORMAT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <div className="mx-1 h-5 w-px bg-line" />
        <ToolbarButton icon={LinkIcon} label="Insert link" onMouseDown={preventFocusLoss} onClick={handleLink} />
      </div>
      <div
        ref={editableRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => emit(e.currentTarget.innerHTML)}
        className="scroll-thin min-h-[220px] max-h-[380px] overflow-y-auto px-4 py-3 text-sm leading-relaxed text-slate-700 outline-none [&_a]:text-orange [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-line [&_blockquote]:pl-3 [&_blockquote]:text-slate-500 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
      />
    </div>
  );
});

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  onMouseDown,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  onClick: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onMouseDown={onMouseDown}
      onClick={onClick}
      className="grid h-7 w-7 place-items-center rounded-md text-slate-600 transition-colors hover:bg-slate-200/70"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
