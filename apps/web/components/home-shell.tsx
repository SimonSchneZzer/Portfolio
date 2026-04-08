"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChatShell } from "@/components/chat-shell";
import { ProfileColumn } from "@/components/profile-column";

const morphDurationMs = 480;
const morphEasing = "cubic-bezier(0.22, 1, 0.36, 1)";

interface Rect { top: number; left: number; width: number; height: number; }

export function HomeShell() {
  const [isCondensed, setIsCondensed] = useState(false);
  const [pillVisible, setPillVisible] = useState(false);

  const profileShellRef = useRef<HTMLDivElement | null>(null);
  const prevProfileRectRef = useRef<DOMRect | null>(null);
  const profileAnimRef = useRef<Animation | null>(null);
  const pillRef = useRef<HTMLButtonElement | null>(null);
  const panelAnimRef = useRef<Animation | null>(null);
  const contentAnimsRef = useRef<Animation[]>([]);
  const rafRef = useRef<number | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    return () => {
      panelAnimRef.current?.cancel();
      profileAnimRef.current?.cancel();
      contentAnimsRef.current.forEach(a => a.cancel());
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function cancelContentAnims() {
    contentAnimsRef.current.forEach(a => a.cancel());
    contentAnimsRef.current = [];
  }

  function animateContentOut(panel: HTMLElement) {
    cancelContentAnims();
    const fadeMs = morphDurationMs * 0.25;
    const sections = [
      panel.querySelector(".chat-panel-header"),
      panel.querySelector(".chat-messages"),
      panel.querySelector(".chat-footer"),
    ].filter(Boolean) as Element[];

    sections.forEach(el => {
      const a = el.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: fadeMs, easing: "ease", fill: "forwards" }
      );
      contentAnimsRef.current.push(a);
    });

    const preview = panel.querySelector(".chat-panel-pill-preview") as HTMLElement | null;
    if (preview) {
      const a = preview.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { delay: fadeMs, duration: fadeMs, easing: "ease", fill: "forwards" }
      );
      contentAnimsRef.current.push(a);
    }
  }

  function animateContentIn(panel: HTMLElement) {
    cancelContentAnims();
    const fadeMs = morphDurationMs * 0.25;
    const sections = [
      panel.querySelector(".chat-panel-header"),
      panel.querySelector(".chat-messages"),
      panel.querySelector(".chat-footer"),
    ].filter(Boolean) as Element[];

    const preview = panel.querySelector(".chat-panel-pill-preview") as HTMLElement | null;
    if (preview) {
      const a = preview.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: fadeMs, easing: "ease", fill: "forwards" }
      );
      contentAnimsRef.current.push(a);
    }

    sections.forEach(el => {
      const a = el.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { delay: fadeMs, duration: fadeMs, easing: "ease", fill: "forwards" }
      );
      contentAnimsRef.current.push(a);
    });
  }

  // FLIP animation for profile column when grid layout changes
  useLayoutEffect(() => {
    const node = profileShellRef.current;
    const prev = prevProfileRectRef.current;
    if (!node || !prev) return;
    const next = node.getBoundingClientRect();
    prevProfileRectRef.current = null;
    const deltaX = prev.left - next.left;
    if (Math.abs(deltaX) < 1) return;
    profileAnimRef.current?.cancel();
    profileAnimRef.current = node.animate(
      [{ transform: `translateX(${deltaX}px)` }, { transform: "translateX(0)" }],
      { duration: morphDurationMs, easing: morphEasing, fill: "both" }
    );
    profileAnimRef.current.onfinish = () => { profileAnimRef.current = null; };
  }, [isCondensed]);

  function getPillRect(): Rect {
    const el = pillRef.current;
    if (!el) return { top: 16, left: window.innerWidth - 280, width: 220, height: 72 };
    return {
      top: 16,
      left: window.innerWidth - 16 - el.offsetWidth,
      width: el.offsetWidth,
      height: Math.max(el.offsetHeight, 72),
    };
  }

  function getChatPanel(): HTMLElement | null {
    return document.querySelector(".chat-panel") as HTMLElement | null;
  }

  // Lift the panel out of the grid into fixed position so it can animate freely
  function liftPanel(panel: HTMLElement, rect: Rect) {
    panel.style.cssText = `position:fixed;top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;z-index:90;margin:0;`;
  }

  // Restore panel to normal flow
  function dropPanel(panel: HTMLElement) {
    panel.style.cssText = "";
  }

  function handleToggleChat() {
    if (busyRef.current) return;
    busyRef.current = true;

    const panel = getChatPanel();
    if (!panel) { busyRef.current = false; return; }

    if (!isCondensed) {
      // ── Collapse: panel content morphs into pill ───────────────
      const panelRect = panel.getBoundingClientRect();
      const pillRect  = getPillRect();

      if (profileShellRef.current) {
        prevProfileRectRef.current = profileShellRef.current.getBoundingClientRect();
      }

      // Lift panel so it's free to animate while the grid collapses behind it
      liftPanel(panel, panelRect);
      setIsCondensed(true);
      animateContentOut(panel);

      const anim = panel.animate([
        { top: `${panelRect.top}px`, left: `${panelRect.left}px`, width: `${panelRect.width}px`, height: `${panelRect.height}px`, borderRadius: "32px" },
        { top: `${pillRect.top}px`,  left: `${pillRect.left}px`,  width: `${pillRect.width}px`,  height: `${pillRect.height}px`,  borderRadius: "999px" },
      ], { duration: morphDurationMs, easing: morphEasing, fill: "forwards" });

      panelAnimRef.current = anim;
      anim.onfinish = () => {
        anim.cancel();
        cancelContentAnims();
        dropPanel(panel);
        setPillVisible(true);
        busyRef.current = false;
      };

    } else {
      // ── Expand: pill morphs into panel content ─────────────────
      const pillRect = getPillRect();

      if (profileShellRef.current) {
        prevProfileRectRef.current = profileShellRef.current.getBoundingClientRect();
      }

      setPillVisible(false);
      setIsCondensed(false);

      // Keep panel invisible (opacity via inline style) while layout settles,
      // then measure its final position and start the morph from pill position
      panel.style.opacity = "0";

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = window.requestAnimationFrame(() => {
          rafRef.current = null;
          const finalRect = panel.getBoundingClientRect();

          // Lift from pill position — this replaces opacity:0 with the fixed styles
          liftPanel(panel, pillRect);
          animateContentIn(panel);

          const anim = panel.animate([
            { top: `${pillRect.top}px`,  left: `${pillRect.left}px`,  width: `${pillRect.width}px`,  height: `${pillRect.height}px`,  borderRadius: "999px" },
            { top: `${finalRect.top}px`, left: `${finalRect.left}px`, width: `${finalRect.width}px`, height: `${finalRect.height}px`, borderRadius: "32px" },
          ], { duration: morphDurationMs, easing: morphEasing, fill: "forwards" });

          panelAnimRef.current = anim;
          anim.onfinish = () => {
            anim.cancel();
            cancelContentAnims();
            dropPanel(panel);
            busyRef.current = false;
          };
        });
      });
    }
  }

  return (
    <main className="portfolio-page">
      <div className={`layout-shell${isCondensed ? " is-chat-condensed" : ""}`}>
        <div ref={profileShellRef} className="profile-column-shell">
          <ProfileColumn />
        </div>

        <aside className="chat-column">
          <ChatShell onToggleCollapse={handleToggleChat} />
        </aside>
      </div>

      <button
        ref={pillRef}
        type="button"
        className={`surface chat-pill${pillVisible ? " is-visible" : ""}`}
        onClick={handleToggleChat}
        aria-label="Open chat"
        aria-expanded="false"
        tabIndex={pillVisible ? 0 : -1}
      >
        <span className="avatar-surface chat-pill-avatar" aria-hidden="true" />
        <span className="chat-pill-label">Chat with me</span>
      </button>
    </main>
  );
}
