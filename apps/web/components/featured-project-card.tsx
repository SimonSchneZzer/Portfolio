import type { FeaturedProject } from "@/content/portfolio";

interface FeaturedProjectCardProps {
  project: FeaturedProject;
  index: number;
}

export function FeaturedProjectCard({ project, index }: FeaturedProjectCardProps) {
  return (
    <article className="project-card">
      <span className="project-number">{String(index + 1).padStart(2, "0")}</span>
      <div className="project-card-body">
        <h3>{project.title}</h3>
        <p className="project-role">{project.role}</p>
      </div>
      <p className="project-summary">{project.summary}</p>
    </article>
  );
}
