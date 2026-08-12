export default function SectionSkeleton({ theme = "paper", minHeight = 400 }) {
  return (
    <div className={`section-skeleton ${theme}`} style={{ minHeight }}>
      <div className="skeleton-shimmer" />
    </div>
  );
}
