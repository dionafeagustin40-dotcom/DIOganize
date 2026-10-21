function Documents() {
  const requirements = [
    ['Baptism', 'Birth Certificate, Parent IDs, Godparent information, parish requirements'],
    ['Wedding', 'Baptismal Certificate, Confirmation Certificate, CENOMAR, Marriage License, Seminar, Canonical Interview'],
    ['Funeral Service', 'Death Certificate, Family Representative ID, service details, other supporting documents']
  ];

  return <div><div className="page-heading"><div><small>Documents</small><h1>Requirements</h1><p>Reference list for the three church services.</p></div></div><div className="requirements-grid">{requirements.map(([service, text]) => <article className="requirement-card" key={service}><span className="service-pill">{service}</span><h3>Required Documents</h3><p>{text}</p><button className="button button-secondary">View Checklist</button></article>)}</div></div>;
}

export default Documents;
