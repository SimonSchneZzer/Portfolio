import { ProjectLogo } from "@/components/brand-icons";
import type { FeaturedProject } from "@/content/portfolio";

interface FeaturedProjectCardProps {
  project: FeaturedProject;
  index: number;
  isActive: boolean;
  onActivate: () => void;
}

/**
 * On hover devices the active card shows its summary and the others show tech tags. Summary and tags share
 * one grid cell, so switching never changes the card height (no layout jumps). On touch devices both are shown.
 */
export function FeaturedProjectCard({ project, index, isActive, onActivate }: FeaturedProjectCardProps) {
  return (
    <article
      className={`project-card${isActive ? " is-active" : ""}`}
      tabIndex={0}
      onMouseEnter={onActivate}
      onFocus={onActivate}
    >
      <div className="project-card-head">
        <span className="project-logo">
          <ProjectLogo name={project.logo} />
        </span>
        <span className="project-number">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="project-card-body">
        <h3>{project.title}</h3>
        <p className="project-role">{project.role}</p>
      </div>
      <div className="project-card-reveal">
        <p className="project-summary">{project.summary}</p>
        <ul className="project-tags" aria-label="Technologies">
          {project.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
