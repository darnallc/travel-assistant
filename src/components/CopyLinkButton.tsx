"use client";

import { useState } from "react";

export function CopyLinkButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded-md border border-neutral-300 px-2 py-1 text-xs text-neutral-600 hover:border-neutral-500"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
