'use client';

import { useEffect } from 'react';
import { Sidebar, useSidebar } from 'fumadocs-ui/layouts/docs/slots/sidebar';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function focusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter((element) => (
      element.tabIndex >= 0
      && element.getClientRects().length > 0
      && !element.closest('[hidden],[aria-hidden="true"],[inert]')
    ));
}

function activateDrawer(setOpen: (open: boolean) => void) {
  const drawer = document.getElementById('nd-sidebar-mobile');
  const layout = drawer?.parentElement;
  const overlay = drawer?.previousElementSibling;
  if (
    !drawer
    || !layout
    || drawer.dataset.state !== 'open'
    || !(overlay instanceof HTMLElement)
    || overlay.dataset.state !== 'open'
  ) {
    return;
  }

  const activeElement = document.activeElement;
  const trigger = activeElement instanceof HTMLElement && activeElement.matches('button[aria-label="Open Sidebar"]')
    ? activeElement
    : document.querySelector<HTMLElement>('header button[aria-label="Open Sidebar"]');

  const previousTriggerExpanded = trigger ? trigger.getAttribute('aria-expanded') : null;
  const previousTriggerControls = trigger ? trigger.getAttribute('aria-controls') : null;
  trigger?.setAttribute('aria-expanded', 'true');
  trigger?.setAttribute('aria-controls', drawer.id);

  const previousRole = drawer.getAttribute('role');
  const previousModal = drawer.getAttribute('aria-modal');
  const previousLabel = drawer.getAttribute('aria-label');
  const previousTabIndex = drawer.getAttribute('tabindex');
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-label', 'Documentation navigation');
  drawer.setAttribute('tabindex', '-1');

  const closeButton = drawer.querySelector<HTMLElement>('button[aria-label="Open Sidebar"]');
  const previousCloseLabel = closeButton ? closeButton.getAttribute('aria-label') : null;
  closeButton?.setAttribute('aria-label', 'Close Sidebar');

  drawer.focus({ preventScroll: true });

  const inertedElements = Array.from(layout.children)
    .filter((element): element is HTMLElement => (
      element instanceof HTMLElement
      && element !== drawer
      && element !== overlay
      && !element.inert
    ));
  for (const element of inertedElements) element.inert = true;

  const previousBodyOverflow = document.body.style.overflow;
  const previousRootOverflow = document.documentElement.style.overflow;
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.isComposing) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = focusableElements(drawer);
    if (focusable.length === 0) {
      event.preventDefault();
      drawer.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = document.activeElement;
    if (event.shiftKey && (current === drawer || current === first || !drawer.contains(current))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (current === drawer || current === last || !drawer.contains(current))) {
      event.preventDefault();
      first.focus();
    }
  };
  document.addEventListener('keydown', handleKeyDown);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
    for (const element of inertedElements) element.inert = false;
    document.body.style.overflow = previousBodyOverflow;
    document.documentElement.style.overflow = previousRootOverflow;

    if (previousRole === null) drawer.removeAttribute('role');
    else drawer.setAttribute('role', previousRole);
    if (previousModal === null) drawer.removeAttribute('aria-modal');
    else drawer.setAttribute('aria-modal', previousModal);
    if (previousLabel === null) drawer.removeAttribute('aria-label');
    else drawer.setAttribute('aria-label', previousLabel);
    if (previousTabIndex === null) drawer.removeAttribute('tabindex');
    else drawer.setAttribute('tabindex', previousTabIndex);
    if (closeButton) {
      if (previousCloseLabel === null) closeButton.removeAttribute('aria-label');
      else closeButton.setAttribute('aria-label', previousCloseLabel);
    }
    if (trigger) {
      if (previousTriggerExpanded === null) trigger.removeAttribute('aria-expanded');
      else trigger.setAttribute('aria-expanded', previousTriggerExpanded);
      if (previousTriggerControls === null) trigger.removeAttribute('aria-controls');
      else trigger.setAttribute('aria-controls', previousTriggerControls);
    }

    if (window.matchMedia('(width < 768px)').matches && trigger?.isConnected) trigger.focus();
  };
}

export function ContentFirstSidebar() {
  const { mode, open, setOpen } = useSidebar();

  useEffect(() => {
    if (mode === 'full' && open) setOpen(false);
  }, [mode, open, setOpen]);

  useEffect(() => {
    if (mode !== 'drawer' || !open) return;

    let cleanup: (() => void) | undefined;
    let frame = 0;
    let attempts = 0;
    const initialize = () => {
      cleanup = activateDrawer(setOpen);
      if (cleanup) return;
      if (attempts < 2) {
        attempts += 1;
        frame = window.requestAnimationFrame(initialize);
      } else {
        setOpen(false);
      }
    };
    initialize();

    return () => {
      window.cancelAnimationFrame(frame);
      cleanup?.();
    };
  }, [mode, open, setOpen]);

  return <Sidebar />;
}
