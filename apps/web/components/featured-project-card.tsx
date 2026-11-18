"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { ArrowIcon, ProjectLogo } from "@/components/brand-icons";
import type { FeaturedProject } from "@/content/portfolio";

interface FeaturedProjectCardProps {
  project: FeaturedProject;
  index: number;
  isExpanded: boolean;
  isActive: boolean;
  onActivate: () => void;
}

export function FeaturedProjectCard({
  project,
  index,
  isExpanded,
  isActive,
  onActivate
}: FeaturedProjectCardProps) {
  // The wide card measures its content and opens to exactly that height (a fixed px value, so it glides; "auto"
  // cannot be animated). Re-measured when the card changes width.
  const cardRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const [wideHeight, setWideHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!project.wide || !cardRef.current) {
      return;
    }

    const measure = () => {
      const body = bodyRef.current, details = detailsRef.current;
      if (!body || !details) {
        return;
      }
      // expanded padding is 22px (6px more than collapsed), then a gap, the details and 22px at the bottom
      setWideHeight(Math.ceil(body.offsetTop + body.offsetHeight + 6 + 18 + details.offsetHeight + 22));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [project.wide]);

  const logo = (
    <span className="project-logo">
      <ProjectLogo name={project.logo} />
    </span>
  );

  return (
    // A div instead of a button, because the title and logo are links and links must not sit inside a button.
    <div
      ref={cardRef}
      style={project.wide && isExpanded && wideHeight ? { height: wideHeight } : undefined}
      className={`project-card${isExpanded ? " is-expanded" : ""}${isActive ? " is-active" : ""}${project.href ? " has-link" : ""}${project.wide ? " is-wide" : ""}`}
      tabIndex={0}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
      aria-expanded={isExpanded}
    >
      <span className="project-number">0{index + 1}</span>
      <div className="project-card-body" ref={bodyRef}>
        {project.href ? (
          <a
            className="project-title-row project-link"
            href={project.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.title} (${project.ctaLabel}, opens in a new tab)`}
          >
            {logo}
            <h3>{project.title}</h3>
            <svg className="project-link-arrow" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="4.5" y1="11.5" x2="11.5" y2="4.5" />
              <polyline points="5.5,4.5 11.5,4.5 11.5,10.5" />
            </svg>
          </a>
        ) : (
          <div className="project-title-row">
            {logo}
            <h3>{project.title}</h3>
          </div>
        )}
        <p className="project-role">{project.role}</p>
      </div>

      <div className="project-card-details" ref={detailsRef} aria-hidden={!isExpanded}>
        <p className="project-summary">{project.summary}</p>
        {project.highlights?.length ? (
          <ul className="project-highlights">
            {project.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        {project.caseStudy ? (
          <Link href={`/projects/${project.caseStudy}`} className="project-more-link" tabIndex={isExpanded ? 0 : -1}>
            Read the case study <ArrowIcon size={13} />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
