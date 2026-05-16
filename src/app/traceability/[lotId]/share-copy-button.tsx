"use client";

import { useState, useCallback } from "react";
import { Share2, Check, Copy } from "lucide-react";

interface ShareCopyButtonProps {
  lotCode: string;
  lotId: string;
}

export function ShareCopyButton({ lotCode, lotId }: ShareCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const passportUrl = typeof window !== "undefined"
    ? `${window.location.origin}/traceability/${lotId}`
    : `/traceability/${lotId}`;

  const handleShare = useCallback(async () => {
    const shareData = {
      title: `Passaporto prodotto ${lotCode}`,
      text: `Tracciabilità completa del lotto ${lotCode} — AgriRomagna`,
      url: passportUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(passportUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available in insecure contexts
    }
  }, [passportUrl, lotCode]);

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-full border border-emerald-950/15 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm transition-colors hover:bg-emerald-50"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          Link copiato!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" aria-hidden="true" />
          Condividi passaporto
          <Copy className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
        </>
      )}
    </button>
  );
}
