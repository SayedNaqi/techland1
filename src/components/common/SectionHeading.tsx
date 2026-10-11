interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  titleId: string;
  description?: string;
  light?: boolean;
  className?: string;
}

export default function SectionHeading({ eyebrow, title, titleId, description, light = false, className = '' }: SectionHeadingProps) {
  return (
    <div className={`section-heading ${light ? 'section-heading--light' : ''} ${className}`.trim()}>
      <p className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" />{eyebrow}</p>
      <h2 id={titleId}>{title}</h2>
      {description && <p className="section-heading__description">{description}</p>}
    </div>
  );
}
