export default function StatusBadge({ children }) {
  return <span className={`status status--${String(children).toLowerCase()}`}>{children}</span>;
}
