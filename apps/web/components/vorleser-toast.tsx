"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ProjectLogo } from "@/components/brand-icons";
import "./vorleser-toast.css";

const showDelayMs = 1600;
const visibleMs = 7000;
const exitMs = 420;
const swipeDismissPx = 90;
const storageKey = "new-projects-toast-seen";

type Phase = "hidden" | "visible" | "leaving";

/**
 * Introduces the newest projects (Vorleser and Surebet) once per browser session.
 * Stays 7 seconds; hovering, touching or dragging pauses the countdown. Can be swiped away (left, right or up).
 */
export function VorleserToast() {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [exitDirection, setExitDirection] = useState<"left" | "right" | "up">("left");
  const [progress, setProgress] = useState(1);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });

  const elapsedRef = useRef(0);
  const pausedRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; id: number } | null>(null);

  const dismiss = useCallback((direction: "left" | "right" | "up" = "left") => {
    setExitDirection(direction);
    setPhase((current) => (current === "visible" ? "leaving" : current));
  }, []);

  // Show once per session, after the page has settled – but never on top of the chat:
  // while the full-screen chat is open on phones (body.chat-mobile-open) the toast waits,
  // and it slides away as soon as the chat opens or someone starts typing in it.
  useEffect(() => {
    let alreadySeen = false;

    try {
      alreadySeen = window.sessionStorage.getItem(storageKey) === "1";
    } catch {
      // storage unavailable (private mode): just show it
    }

    if (alreadySeen) {
      return;
    }

    let timeoutId: number | undefined;
    let shown = false;
    const isChatOpen = () => document.body.classList.contains("chat-mobile-open");

    const schedule = () => {
      window.clearTimeout(timeoutId);

      if (shown || isChatOpen()) {
        return;
      }

      timeoutId = window.setTimeout(() => {
        if (isChatOpen()) {
          return;
        }

        shown = true;

        try {
          window.sessionStorage.setItem(storageKey, "1");
        } catch {
          // ignore
        }

        setPhase("visible");
      }, showDelayMs);
    };

    const observer = new MutationObserver(() => {
      if (isChatOpen()) {
        window.clearTimeout(timeoutId);

        if (shown) {
          dismiss("up");
        }
      } else {
        schedule();
      }
    });

    const onChatFocus = (event: FocusEvent) => {
      if (shown && (event.target as HTMLElement | null)?.closest?.(".chat-panel")) {
        dismiss("left");
      }
    };

    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    document.addEventListener("focusin", onChatFocus);
    schedule();

    return () => {
      window.clearTimeout(timeoutId);
      observer.disconnect();
      document.removeEventListener("focusin", onChatFocus);
    };
  }, [dismiss]);

  // Countdown that only runs while not paused and while the tab is visible.
  useEffect(() => {
    if (phase !== "visible") {
      return;
    }

    let last = performance.now();

    const tick = (now: number) => {
      const delta = now - last;
      last = now;

      if (!pausedRef.current && document.visibilityState === "visible") {
        elapsedRef.current += delta;
      }

      const remaining = Math.max(0, 1 - elapsedRef.current / visibleMs);
      setProgress(remaining);

      if (remaining === 0) {
        dismiss("left");
        return;
      }

      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [phase, dismiss]);

  // Remove from the DOM after the exit animation.
  useEffect(() => {
    if (phase !== "leaving") {
      return;
    }

    const timeoutId = window.setTimeout(() => setPhase("hidden"), exitMs);
    return () => window.clearTimeout(timeoutId);
  }, [phase]);

  useEffect(() => {
    if (phase !== "visible") {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss("left");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, dismiss]);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("a, button")) {
      return;
    }

    dragStartRef.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
    pausedRef.current = true;
    setDrag({ x: 0, y: 0, active: true });
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const start = dragStartRef.current;

    if (!start || start.id !== event.pointerId) {
      return;
    }

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    // Follow the finger sideways and upwards; resist pulling down.
    setDrag({ x: dx, y: dy < 0 ? dy : dy * 0.2, active: true });
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const start = dragStartRef.current;

    if (!start || start.id !== event.pointerId) {
      return;
    }

    dragStartRef.current = null;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;

    if (Math.abs(dx) > swipeDismissPx) {
      dismiss(dx < 0 ? "left" : "right");
    } else if (dy < -swipeDismissPx * 0.6) {
      dismiss("up");
    } else {
      pausedRef.current = event.pointerType === "mouse" && event.currentTarget.matches(":hover");
    }

    setDrag({ x: 0, y: 0, active: false });
  }

  if (phase === "hidden") {
    return null;
  }

  const dragDistance = Math.max(Math.abs(drag.x), Math.abs(Math.min(drag.y, 0)));
  const style = drag.active
    ? {
        transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 40}deg)`,
        opacity: Math.max(0.35, 1 - dragDistance / 260),
        transition: "none"
      }
    : undefined;

  return (
    <div className="vorleser-toast-region" role="region" aria-label="New projects">
      <div
        className={`vorleser-toast surface${phase === "leaving" ? ` is-leaving to-${exitDirection}` : ""}`}
        style={style}
        role="status"
        aria-live="polite"
        onMouseEnter={() => (pausedRef.current = true)}
        onMouseLeave={() => {
          if (!dragStartRef.current) {
            pausedRef.current = false;
          }
        }}
        onFocus={() => (pausedRef.current = true)}
        onBlur={() => (pausedRef.current = false)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="vorleser-toast-glow" aria-hidden="true" />
        {/* the same light, mirrored diagonally to the bottom left, in Surebet gold */}
        <div className="vorleser-toast-glow np-glow-gold" aria-hidden="true" />

        <p className="vorleser-toast-kicker np-kicker">New projects</p>

        {/* Two projects, split by a thin diagonal line: Vorleser left-aligned, Surebet right-aligned */}
        <div className="np-split">
          <div className="np-half np-left">
            <div className="np-head">
              <div className="vorleser-toast-logo np-logo" aria-hidden="true">
                <ProjectLogo name="vorleser" />
                <span className="vorleser-toast-bars">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </div>
              <p className="vorleser-toast-title np-title">Vorleser</p>
            </div>
            <p className="vorleser-toast-text np-text">Any text as an audiobook, even in your own AI voice.</p>
            <Link href="/projects/vorleser" className="vorleser-toast-primary np-cta" onClick={() => dismiss("up")}>
              See the project
            </Link>
          </div>

          <span className="np-divider" aria-hidden="true" />

          <div className="np-half np-right">
            <div className="np-head">
              <p className="vorleser-toast-title np-title">Surebet</p>
              {/* Surebet mark, animated: the gold line draws upwards, then clears upwards, and starts again */}
              <div className="np-logo np-logo-plain" aria-hidden="true">
                <svg viewBox="0 0 64 64">
                  <rect width="64" height="64" rx="16" fill="#22262a" />
                  <path
                    className="np-sb-line"
                    d="M14 42.5l12-12 8 8 17-17"
                    pathLength={1}
                    fill="none"
                    stroke="#d2a02a"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <p className="vorleser-toast-text np-text">Arbitrage in odds from official APIs, after fees.</p>
            <Link href="/projects/surebet" className="vorleser-toast-primary np-cta np-cta-gold" onClick={() => dismiss("up")}>
              See the project
            </Link>
          </div>
        </div>

        <button type="button" className="vorleser-toast-close" onClick={() => dismiss("left")} aria-label="Dismiss">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="4" y1="4" x2="12" y2="12" />
            <line x1="12" y1="4" x2="4" y2="12" />
          </svg>
        </button>

        <div className="vorleser-toast-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
    </div>
  );
}
