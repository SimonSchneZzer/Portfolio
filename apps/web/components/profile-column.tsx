"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FeaturedProjectCard } from "@/components/featured-project-card";
import { portfolioContent, type PlaceholderLink } from "@/content/portfolio";

const projectCardSwitchMs = 360;
const portraitTransitionMs = 320;
const singleColumnProjectsMedia = "(max-width: 920px)";

function LinkIcon({ icon }: { icon: PlaceholderLink["icon"] }) {
  if (icon === "cv") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="2" width="12" height="16" rx="2" />
        <line x1="7" y1="7" x2="13" y2="7" />
        <line x1="7" y1="10" x2="13" y2="10" />
        <line x1="7" y1="13" x2="10" y2="13" />
      </svg>
    );
  }

  if (icon === "linkedin") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M4.5 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM3 8h3v9H3V8Zm5 0h2.9v1.3h.04C11.4 8.5 12.5 8 13.8 8 16.8 8 17 10 17 12.5V17h-3v-4c0-1 0-2.3-1.4-2.3-1.4 0-1.6 1.1-1.6 2.2V17H8V8Z" />
      </svg>
    );
  }

  if (icon === "github") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M10 2a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.34c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.58.82-2.14-.08-.2-.36-1.01.08-2.11 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.91.08 2.11.51.56.82 1.27.82 2.14 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.14.46.55.38A8 8 0 0 0 10 2Z" />
      </svg>
    );
  }

  if (icon === "email") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="5" width="16" height="11" rx="2" />
        <polyline points="2,5 10,12 18,5" />
      </svg>
    );
  }

  return null;
}

export function ProfileColumn() {
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [outgoingProjectIndex, setOutgoingProjectIndex] = useState<number | null>(null);
  const [isPortraitMounted, setIsPortraitMounted] = useState(false);
  const [isPortraitVisible, setIsPortraitVisible] = useState(false);
  const [portraitOverlayBounds, setPortraitOverlayBounds] = useState<{ left: number; width: number } | null>(null);
  const collapseTimerRef = useRef<number | null>(null);
  const portraitTransitionTimerRef = useRef<number | null>(null);
  const portraitFrameRef = useRef<number | null>(null);
  const portraitLightboxFrameRef = useRef<HTMLDivElement | null>(null);
  const profileColumnRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    return () => {
      if (collapseTimerRef.current) {
        window.clearTimeout(collapseTimerRef.current);
      }

      if (portraitTransitionTimerRef.current) {
        window.clearTimeout(portraitTransitionTimerRef.current);
      }

      if (portraitFrameRef.current) {
        window.cancelAnimationFrame(portraitFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isPortraitMounted) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closePortrait();
      }
    }

    function handlePointerDown(event: PointerEvent) {
      const frame = portraitLightboxFrameRef.current;
      const target = event.target;

      if (!(target instanceof Element) || !frame || frame.contains(target)) {
        return;
      }

      if (target.closest(".chat-column") || target.closest(".chat-pill")) {
        return;
      }

      closePortrait();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown, true);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [isPortraitMounted]);

  useEffect(() => {
    document.body.classList.toggle("portrait-open", isPortraitVisible);

    return () => {
      document.body.classList.remove("portrait-open");
    };
  }, [isPortraitVisible]);

  useEffect(() => {
    const node = profileColumnRef.current;

    if (!node || typeof IntersectionObserver === "undefined") {
      return;
    }

    const revealNodes = Array.from(node.querySelectorAll<HTMLElement>(".motion-reveal"));

    if (revealNodes.length === 0) {
      return;
    }

    revealNodes.forEach((element, index) => {
      element.classList.add("is-pending");
      element.style.setProperty("--motion-reveal-delay", `${index * 70}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          const target = entry.target as HTMLElement;
          target.classList.add("is-visible");
          observer.unobserve(target);
        }
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -10% 0px"
      }
    );

    revealNodes.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  function updatePortraitOverlayBounds() {
    const node = profileColumnRef.current;

    if (!node || typeof window === "undefined" || window.innerWidth <= 920) {
      setPortraitOverlayBounds((current) => (current === null ? current : null));
      return;
    }

    const rect = node.getBoundingClientRect();
    const nextLeft = Math.round(rect.left);
    const nextWidth = Math.round(rect.width);

    setPortraitOverlayBounds((current) => {
      if (current && current.left === nextLeft && current.width === nextWidth) {
        return current;
      }

      return {
        left: nextLeft,
        width: nextWidth
      };
    });
  }

  useLayoutEffect(() => {
    if (!isPortraitMounted) {
      return;
    }

    updatePortraitOverlayBounds();
  });

  useEffect(() => {
    if (!isPortraitMounted) {
      return;
    }

    const handleLayoutChange = () => {
      updatePortraitOverlayBounds();
    };

    const resizeObserver = new ResizeObserver(handleLayoutChange);

    if (profileColumnRef.current) {
      resizeObserver.observe(profileColumnRef.current);
    }

    window.addEventListener("resize", handleLayoutChange);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleLayoutChange);
    };
  }, [isPortraitMounted]);

  function openPortrait() {
    if (portraitTransitionTimerRef.current) {
      window.clearTimeout(portraitTransitionTimerRef.current);
      portraitTransitionTimerRef.current = null;
    }

    if (portraitFrameRef.current) {
      window.cancelAnimationFrame(portraitFrameRef.current);
    }

    setIsPortraitMounted(true);
    setIsPortraitVisible(false);
    portraitFrameRef.current = window.requestAnimationFrame(() => {
      setIsPortraitVisible(true);
      portraitFrameRef.current = null;
    });
  }

  function closePortrait() {
    if (!isPortraitMounted) {
      return;
    }

    if (portraitTransitionTimerRef.current) {
      window.clearTimeout(portraitTransitionTimerRef.current);
    }

    if (portraitFrameRef.current) {
      window.cancelAnimationFrame(portraitFrameRef.current);
      portraitFrameRef.current = null;
    }

    setIsPortraitVisible(false);
    portraitTransitionTimerRef.current = window.setTimeout(() => {
      setIsPortraitMounted(false);
      portraitTransitionTimerRef.current = null;
    }, portraitTransitionMs);
  }

  function handleProjectActivate(index: number) {
    if (index === activeProjectIndex) {
      return;
    }

    if (collapseTimerRef.current) {
      window.clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }

    const previousIndex = activeProjectIndex;
    const projectGridColumns = window.matchMedia(singleColumnProjectsMedia).matches ? 1 : 2;
    const isCrossRowSwitch = Math.floor(previousIndex / projectGridColumns) !== Math.floor(index / projectGridColumns);

    if (isCrossRowSwitch) {
      setOutgoingProjectIndex(null);
      setActiveProjectIndex(index);
      return;
    }

    setOutgoingProjectIndex(previousIndex);
    setActiveProjectIndex(index);

    collapseTimerRef.current = window.setTimeout(() => {
      setOutgoingProjectIndex((current) => (current === previousIndex ? null : current));
      collapseTimerRef.current = null;
    }, projectCardSwitchMs);
  }

  return (
    <>
      <section ref={profileColumnRef} className="profile-column">
        <div className="surface profile-hero">
          <div className="profile-copy">
            <div className="name-row">
              <button
                type="button"
                className="profile-portrait-button"
                onClick={openPortrait}
                aria-label="Open portrait"
                aria-haspopup="dialog"
                aria-expanded={isPortraitMounted && isPortraitVisible}
              >
                <img src="/images/simon-portrait.jpg" alt="Simon Schnetzer" className="profile-portrait" />
              </button>
              <div className="name-h1-wrap">
                <p className="section-kicker">{portfolioContent.eyebrow}</p>
                <h1>{portfolioContent.name}</h1>
              </div>
            </div>
            <p className="profile-headline">{portfolioContent.headline}</p>

            <div className="profile-summary-group">
              {portfolioContent.summary.map((paragraph) => (
                <p key={paragraph} className="profile-summary">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="highlight-row">
              {portfolioContent.highlightChips.map((chip) => (
                <span key={chip} className="highlight-chip">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        <section className="focus-section motion-reveal">
          <div className="section-header">
            <p className="section-kicker">What I bring</p>
            <h2>My profile is grounded in frontend, interfaces, and collaborative product work.</h2>
          </div>

          <div className="focus-grid">
            {portfolioContent.focusAreas.map((area) => (
              <article key={area.title} className="focus-card">
                <h3>{area.title}</h3>
                <p>{area.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="projects-section motion-reveal">
          <div className="section-header">
            <p className="section-kicker">Selected work</p>
            <h2>These projects show how I combine technical execution, interface thinking, and collaborative delivery.</h2>
          </div>

          <div className="project-grid">
            {portfolioContent.projects.map((project, index) => (
              <FeaturedProjectCard
                key={project.title}
                project={project}
                index={index}
                isExpanded={activeProjectIndex === index || outgoingProjectIndex === index}
                isActive={activeProjectIndex === index}
                onActivate={() => handleProjectActivate(index)}
              />
            ))}
          </div>
        </section>

        <section className="links-section motion-reveal">
          <div className="section-header compact">
            <p className="section-kicker">Next steps</p>
            <h2>Reach out, browse my work, or download my CV.</h2>
          </div>

          <div className="link-grid">
            {portfolioContent.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="link-card"
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                <span className="link-icon-wrap">
                  <LinkIcon icon={link.icon} />
                </span>
                <span className="link-label">{link.label}</span>
              </a>
            ))}
          </div>
        </section>

      </section>

      {isPortraitMounted && typeof document !== "undefined"
        ? createPortal(
            <div
              className={`portrait-lightbox${isPortraitVisible ? " is-visible" : ""}`}
              style={portraitOverlayBounds ? { left: `${portraitOverlayBounds.left}px`, width: `${portraitOverlayBounds.width}px` } : undefined}
              role="dialog"
              aria-modal="true"
              aria-label="Portrait of Simon Schnetzer"
              onClick={closePortrait}
            >
              <div ref={portraitLightboxFrameRef} className="portrait-lightbox-frame" onClick={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  className="portrait-lightbox-close"
                  onClick={closePortrait}
                  aria-label="Close portrait"
                  autoFocus
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                    <line x1="4" y1="4" x2="12" y2="12" />
                    <line x1="12" y1="4" x2="4" y2="12" />
                  </svg>
                </button>
                <img src="/images/simon-portrait.jpg" alt="Simon Schnetzer" className="portrait-lightbox-image" />
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
