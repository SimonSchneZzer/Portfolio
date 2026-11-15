import Link from "next/link";
import { ProjectLogo } from "@/components/brand-icons";
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
  const logo = (
    <span className="project-logo">
      <ProjectLogo name={project.logo} />
    </span>
  );

  return (
    // A div instead of a button, because the title and logo are links and links must not sit inside a button.
    <div
      className={`project-card${isExpanded ? " is-expanded" : ""}${isActive ? " is-active" : ""}${project.href ? " has-link" : ""}`}
      tabIndex={0}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
      aria-expanded={isExpanded}
    >
      <span className="project-number">0{index + 1}</span>
      <div className="project-card-body">
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

      <div className="project-card-details" aria-hidden={!isExpanded}>
        <p className="project-summary">{project.summary}</p>
        {project.caseStudy ? (
          <Link href={`/projects/${project.caseStudy}`} className="project-more-link" tabIndex={isExpanded ? 0 : -1}>
            Read the case study →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
