"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

// Client ID mn Google Cloud Console (f .env.local)
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

interface GoogleIdApi {
  initialize(options: {
    client_id: string;
    callback: (response: { credential: string }) => void;
  }): void;
  renderButton(el: HTMLElement, options: Record<string, unknown>): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdApi } };
  }
}

/**
 * Bouton officiel dyal Google ("Continue with Google").
 * Mlli user ykhtar compte, Google kay3tina credential (ID token)
 * w kandouzouh l onCredential.
 */
export function GoogleButton({
  onCredential,
}: {
  onCredential: (credential: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== "undefined" && !!window.google?.accounts,
  );

  // Dima n3iyto l akher version dyal callback (bla ma n3awdo initialize)
  const callbackRef = useRef(onCredential);
  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    const el = containerRef.current;
    const google = window.google?.accounts.id;
    if (!scriptReady || !el || !google) return;
    google.initialize({
      client_id: CLIENT_ID,
      callback: ({ credential }) => callbackRef.current(credential),
    });
    google.renderButton(el, {
      theme: "filled_black",
      size: "large",
      shape: "pill",
      text: "continue_with",
      width: el.clientWidth || 320,
    });
  }, [scriptReady]);

  // Ila ma kaynch Client ID, ma kanbiynouch l-bouton
  if (!CLIENT_ID) return null;

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div ref={containerRef} className="flex min-h-11 w-full justify-center" />
    </>
  );
}

export const googleEnabled = CLIENT_ID !== "";
