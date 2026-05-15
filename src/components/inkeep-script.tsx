"use client";

import { useEffect, useState } from "react";
import {
  InkeepChatButton,
  type InkeepChatButtonProps,
} from "@inkeep/cxkit-react";
import {
  ensureInkeepDevConsolePatched,
  installInkeepDomGuards,
  transformInkeepSource,
} from "@/lib/inkeep";

ensureInkeepDevConsolePatched();

const WDK_ORANGE = "#FF6501";

export function InkeepScript() {
  const [mounted, setMounted] = useState(false);
  // color mode sync target
  const [syncTarget, setSyncTarget] = useState<HTMLElement | null>(null);
  const inkeepApiKey = process.env.NEXT_PUBLIC_INKEEP_API_KEY?.trim() ?? "";

  // We do this because document is not available in the server
  useEffect(() => {
    setMounted(true);
    setSyncTarget(document.documentElement);
  }, []);

  useEffect(() => {
    return installInkeepDomGuards();
  }, []);

  // Prevent SSR/first-render hydration mismatch (Inkeep generates dynamic IDs).
  if (!mounted || !syncTarget) return null;

  const config: InkeepChatButtonProps = {
    baseSettings: {
      apiKey: inkeepApiKey,
      primaryBrandColor: WDK_ORANGE,
      organizationDisplayName: "WDK",
      transformSource: transformInkeepSource,
      theme: {
        styles: [
          {
            key: "wdk-inkeep-chat-button-light",
            type: "style",
            value: `
              [data-theme='light'] .ikp-chat-button__button {
                background: #ffffff;
                border: 1px solid rgba(0, 0, 0, 0.12);
                box-shadow:
                  0 8px 24px rgba(0, 0, 0, 0.08),
                  0 1px 2px rgba(0, 0, 0, 0.06);
              }

              [data-theme='light'] .ikp-chat-button__button:hover {
                background: #f6f8fa;
              }

              [data-theme='light'] .ikp-chat-button__text {
                color: rgba(0, 0, 0, 0.82);
              }

              [data-theme='light'] .ikp-chat-button__avatar-content {
                border: none !important;
                box-shadow: none !important;
                outline: none !important;
                background: transparent !important;
                border-left: none !important;
              }

              @media (max-width: 767px) {
                .ikp-chat-button__container {
                  bottom: calc(env(safe-area-inset-bottom) + 5.5rem) !important;
                  right: 1rem !important;
                }
              }
            `,
          },
        ],
      },
      // ...optional settings
      colorMode: {
        sync: {
          target: syncTarget,
          attributes: ["class"],
          isDarkMode: (attributes) => !!attributes.class?.includes("dark"),
        },
      },
    },
    modalSettings: {
      // optional settings
    },
    searchSettings: {
      // optional settings
    },
    aiChatSettings: {
      // optional settings
      aiAssistantAvatar: "/favicon.png",
      exampleQuestions: [
        "What is WDK?",
        "How to get started with WDK?",
        "How to integrate WDK in my app?",
      ],
    },
  };

  return <InkeepChatButton {...config} />;
}
