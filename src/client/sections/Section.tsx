import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export const Section = ({ id, title, description, children }: SectionProps) => (
  <section id={id} className="section">
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      <a href="#top" className="section-link">
        Nach oben
      </a>
    </div>
    <div className="section-content">{children}</div>
  </section>
);
