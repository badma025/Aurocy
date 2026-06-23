"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";

function copyText(text: string) {
  if (navigator?.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  textarea.style.left = "-1000px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
  return Promise.resolve();
}

export default function CodeBlock({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!code) return;

    try {
      await copyText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }, [code]);

  return (
    <motion.div
      whileTap={{ scale: 0.995 }}
      className="group relative my-6 overflow-hidden rounded-xl border border-slate-700/60 bg-[#0b1120] shadow-lg shadow-black/20"
    >
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-200 opacity-100 transition hover:border-slate-500 sm:opacity-0 sm:group-hover:opacity-100"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>

      {language ? (
        <div className="border-b border-slate-700/50 px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
          {language}
        </div>
      ) : null}

      <pre
        onClick={handleCopy}
        className="cursor-pointer overflow-x-auto px-5 pb-6 pt-5 font-mono text-sm leading-6 text-slate-200"
      >
        <code className="block whitespace-pre">{code}</code>
      </pre>
    </motion.div>
  );
}
