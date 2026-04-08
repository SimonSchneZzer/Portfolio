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
  return (
    <button
      type="button"
      className={`project-card${isExpanded ? " is-expanded" : ""}${isActive ? " is-active" : ""}`}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
      aria-expanded={isExpanded}
    >
      <span className="project-number">0{index + 1}</span>
      <div className="project-card-body">
        <h3>{project.title}</h3>
        <p className="project-role">{project.role}</p>
      </div>

      <div className="project-card-details" aria-hidden={!isExpanded}>
        <p className="project-summary">{project.summary}</p>
      </div>
    </button>
  );
}
