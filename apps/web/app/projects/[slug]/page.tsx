import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionIcon, ArrowIcon, ProjectLogo } from "@/components/brand-icons";
import { caseStudies, getCaseStudy } from "@/content/case-studies";
import { site } from "@/content/site";
import "./project-page.css";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const study = getCaseStudy((await params).slug);

  if (!study) {
    return {};
  }

  const path = `/projects/${study.slug}`;

  return {
    title: `${study.seoTitle} | Simon Schnetzer`,
    description: study.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      siteName: site.name,
      title: study.seoTitle,
      description: study.description,
      images: [{ url: study.image.src, width: 1440, height: 900, alt: study.image.alt }]
    },
    twitter: { card: "summary_large_image", title: study.seoTitle, description: study.description, images: [study.image.src] }
  };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const study = getCaseStudy((await params).slug);

  if (!study) {
    notFound();
  }

  const url = `${site.url}/projects/${study.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": study.schemaType,
        name: study.title,
        description: study.description,
        url,
        image: `${site.url}${study.image.src}`,
        ...(study.schemaType !== "CreativeWork"
          ? { applicationCategory: "Productivity", operatingSystem: study.slug === "vorleser" ? "macOS, Windows" : "Web" }
          : {}),
        author: { "@type": "Person", "@id": `${site.url}/#person`, name: site.name, url: site.url },
        sameAs: study.links.filter((link) => link.href.startsWith("http")).map((link) => link.href)
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: site.name, item: site.url },
          { "@type": "ListItem", position: 2, name: study.title, item: url }
        ]
      }
    ]
  };
  const otherStudies = caseStudies.filter((other) => other.slug !== study.slug);

  return (
    <main className="project-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="project-page-nav" aria-label="Breadcrumb">
        <Link href="/">← Simon Schnetzer</Link>
      </nav>

      <article className="project-page-card surface">
        <header className="project-page-header">
          <span className="project-page-logo">
            <ProjectLogo name={study.logo} />
          </span>
          <div>
            <p className="section-kicker">{study.period}</p>
            <h1>{study.title}</h1>
            <p className="project-page-tagline">{study.tagline}</p>
          </div>
        </header>

        <p className="project-page-role">
          <span>My role</span> {study.role}
        </p>

        <div className="project-page-links">
          {study.links.map((link) => {
            const external = link.href.startsWith("http");
            return (
              <a
                key={link.href}
                href={link.href}
                className="hero-action hero-action-secondary project-page-action"
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
              >
                <ActionIcon kind={link.icon} />
                {link.label}
                {external && link.icon !== "app" ? <ArrowIcon direction="up-right" size={12} /> : null}
              </a>
            );
          })}
        </div>

        <figure className="project-page-figure">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={study.image.src} alt={study.image.alt} width={1440} height={900} loading="lazy" />
        </figure>

        <div className="project-page-intro">
          {study.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {study.sections.map((section) => (
          <section key={section.heading} className="project-page-section">
            <h2>{section.heading}</h2>
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}

        <section className="project-page-section">
          <h2>Tech</h2>
          <ul className="project-page-stack">
            {study.stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        </section>
      </article>

      <nav className="project-page-more" aria-label="More projects">
        <p className="section-kicker">More projects</p>
        <div className="project-page-more-grid">
          {otherStudies.map((other) => (
            <Link key={other.slug} href={`/projects/${other.slug}`} className="project-page-more-card">
              <span className="project-page-more-logo">
                <ProjectLogo name={other.logo} />
              </span>
              <span>
                <strong>{other.title}</strong>
                <span>{other.tagline}</span>
              </span>
            </Link>
          ))}
        </div>
        <Link href="/#chat" className="hero-action hero-action-primary project-page-home">
          <svg className="project-page-home-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12z" />
          </svg>
          Ask me about my work in the chat
          <ArrowIcon />
        </Link>
      </nav>
    </main>
  );
}
