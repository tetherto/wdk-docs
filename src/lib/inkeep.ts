import type { TransformSource } from "@inkeep/cxkit-types";

const DOCS_HOSTS = new Set([
  "wallet.tether.io",
  "wdk.tether.io",
  "docs.wallet.tether.io",
  "docs.wdk.tether.io",
]);

type ConsoleState = {
  original: typeof console.error;
  patched: boolean;
};

function getConsoleState() {
  if (typeof window === "undefined") return null;
  const target = globalThis as typeof globalThis & {
    __wdkInkeepConsoleState?: ConsoleState;
  };

  if (!target.__wdkInkeepConsoleState) {
    target.__wdkInkeepConsoleState = {
      original: console.error.bind(console),
      patched: false,
    };
  }

  return target.__wdkInkeepConsoleState;
}

export function ensureInkeepDevConsolePatched() {
  if (process.env.NODE_ENV !== "development") return;

  const state = getConsoleState();
  if (!state || state.patched) return;

  console.error = (...args: Parameters<typeof console.error>) => {
    const [firstArg] = args;
    if (
      typeof firstArg === "string" &&
      firstArg.includes("Encountered a script tag while rendering React component")
    ) {
      return;
    }

    state.original(...args);
  };

  state.patched = true;
}

function getCurrentDocsOrigin() {
  if (typeof window !== "undefined") return window.location.origin;
  return "https://docs.wdk.tether.io";
}

export function rewriteDocsUrl(rawUrl: string) {
  try {
    const parsed = new URL(rawUrl);
    if (!DOCS_HOSTS.has(parsed.hostname)) return rawUrl;

    const currentOrigin = new URL(getCurrentDocsOrigin());
    parsed.protocol = currentOrigin.protocol;
    parsed.host = currentOrigin.host;
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

export const transformInkeepSource: TransformSource = (source) => {
  const url = rewriteDocsUrl(source.url);
  if (url === source.url) return {};

  let shouldOpenInNewTab: boolean | undefined;
  try {
    shouldOpenInNewTab = new URL(url).origin !== getCurrentDocsOrigin();
  } catch {
    shouldOpenInNewTab = undefined;
  }

  return {
    url,
    shouldOpenInNewTab,
  };
};

function hasSelectedFeedbackReason(form: HTMLFormElement) {
  return Boolean(
    form.querySelector('[data-part="ai-chat-feedback-item-checkbox"][data-state="checked"]'),
  );
}

function syncFeedbackSubmitState(form: HTMLFormElement) {
  const submitButton = form.querySelector<HTMLButtonElement>(
    'button[data-part="ai-chat-feedback-form-submit-button"]',
  );
  if (!submitButton) return;

  const canSubmit = hasSelectedFeedbackReason(form);
  submitButton.disabled = !canSubmit;
  submitButton.setAttribute("aria-disabled", String(!canSubmit));
  submitButton.title = canSubmit ? "" : "Choose at least one reason before submitting.";
}

function bindFeedbackFormGuard(form: HTMLFormElement) {
  if (form.dataset.wdkFeedbackGuard === "true") {
    syncFeedbackSubmitState(form);
    return;
  }

  const handleSubmit = (event: Event) => {
    if (hasSelectedFeedbackReason(form)) return;
    event.preventDefault();
    event.stopPropagation();
    syncFeedbackSubmitState(form);
  };

  const handleSync = () => {
    syncFeedbackSubmitState(form);
  };

  form.addEventListener("submit", handleSubmit);
  form.addEventListener("click", handleSync);
  form.addEventListener("input", handleSync);
  form.addEventListener("change", handleSync);
  form.dataset.wdkFeedbackGuard = "true";

  syncFeedbackSubmitState(form);
}

function processFeedbackForms(root: Document | ShadowRoot) {
  root.querySelectorAll<HTMLFormElement>('form[data-part="ai-chat-feedback-form"]').forEach(
    bindFeedbackFormGuard,
  );
}

function rewriteInkeepAnchors(root: Document | ShadowRoot) {
  root.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((anchor) => {
    const rewrittenHref = rewriteDocsUrl(anchor.href);
    if (rewrittenHref === anchor.href) return;

    anchor.href = rewrittenHref;

    try {
      if (new URL(rewrittenHref).origin === getCurrentDocsOrigin()) {
        anchor.removeAttribute("target");
        anchor.removeAttribute("rel");
      }
    } catch {
      // Ignore malformed URLs from third-party content.
    }
  });
}

function dedupeCitationAnchors(root: Document | ShadowRoot) {
  root
    .querySelectorAll<HTMLElement>('[data-part="ai-chat-message-content"]')
    .forEach((messageContent) => {
      let previousHref: string | null = null;
      let previousLabel: string | null = null;

      messageContent.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((anchor) => {
        const label = anchor.textContent?.replace(/\s+/g, " ").trim() ?? "";
        const normalizedLabel = label.replace(/[\[\]]/g, "");
        const isCitationBadge = /^\d+$/.test(normalizedLabel);

        if (!isCitationBadge) {
          previousHref = null;
          previousLabel = null;
          anchor.hidden = false;
          anchor.removeAttribute("aria-hidden");
          if (anchor.tabIndex === -1) anchor.removeAttribute("tabindex");
          return;
        }

        const rewrittenHref = rewriteDocsUrl(anchor.href);
        anchor.href = rewrittenHref;

        const isDuplicate = rewrittenHref === previousHref && normalizedLabel === previousLabel;
        anchor.hidden = isDuplicate;

        if (isDuplicate) {
          anchor.setAttribute("aria-hidden", "true");
          anchor.tabIndex = -1;
          return;
        }

        anchor.removeAttribute("aria-hidden");
        if (anchor.tabIndex === -1) anchor.removeAttribute("tabindex");
        previousHref = rewrittenHref;
        previousLabel = normalizedLabel;
      });
    });
}

export function installInkeepDomGuards() {
  if (typeof document === "undefined") return () => {};

  const observers: MutationObserver[] = [];
  const observedRoots = new WeakSet<Document | ShadowRoot>();

  const observeRoot = (root: Document | ShadowRoot) => {
    if (observedRoots.has(root)) return;
    observedRoots.add(root);

    processFeedbackForms(root);
    rewriteInkeepAnchors(root);
    dedupeCitationAnchors(root);

    root.querySelectorAll("*").forEach((element) => {
      if (element.shadowRoot) observeRoot(element.shadowRoot);
    });

    const observer = new MutationObserver(() => {
      processFeedbackForms(root);
      rewriteInkeepAnchors(root);
      dedupeCitationAnchors(root);
      root.querySelectorAll("*").forEach((element) => {
        if (element.shadowRoot) observeRoot(element.shadowRoot);
      });
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-state", "href"],
      childList: true,
      subtree: true,
    });
    observers.push(observer);
  };

  observeRoot(document);

  return () => {
    observers.forEach((observer) => observer.disconnect());
  };
}
