export default function ComingSoon({ eyebrow, title, text }) {
  return (
    <section>
      <div className="page-heading">
        <div>
          <span className="eyebrow dark">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{text}</p>
        </div>
      </div>
      <div className="panel"><div className="empty-state">This section is coming soon.</div></div>
    </section>
  );
}
