export function SummaryCards({ items }) {
  return (
    <section className="summary-grid">
      {items.map(([label, value, note]) => (
        <article className="card summary-card" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
          <small>{note}</small>
        </article>
      ))}
    </section>
  );
}
