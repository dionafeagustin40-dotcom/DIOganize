const LIST = [
  ['Baptism', 'A new life in Christ', 'baptism'],
  ['Wedding', 'A union in faith and love', 'wedding'],
  ['Funeral Service', "In God's loving care", 'funeral'],
  ['Confirmation', 'Strengthen your faith', 'confirmation'],
  ['First Communion', 'Receiving Christ with joy', 'communion'],
  ['Blessing', 'Prayer and blessing for your family', 'blessing'],
  ['Marriage Preparation', 'Preparing couples for married life', 'marriageprep']
];

export default function ChurchServices({ onService }) {
  return (
    <section>
      <div className="page-heading">
        <div>
          <span className="eyebrow dark">PARISH SERVICES</span>
          <h1>Church Services</h1>
          <p>Select a service to view details or create a schedule.</p>
        </div>
      </div>
      <div className="svc-grid big">
        {LIST.map(([name, desc, cls]) => (
          <button key={name} className="svc-card" onClick={() => onService(name)}>
            <div className={'svc-img ' + cls} />
            <div className="svc-body"><b>{name}</b><small>{desc}</small></div>
          </button>
        ))}
      </div>
    </section>
  );
}
