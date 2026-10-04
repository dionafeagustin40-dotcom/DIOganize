function StatCard({ title, value, caption, accent, onClick }) {
  return (
    <button className={`stat-card ${accent}`} onClick={onClick}>
      <span className="stat-title">{title}</span>
      <strong>{value}</strong>
      <small>{caption}</small>
    </button>
  );
}

export default StatCard;
