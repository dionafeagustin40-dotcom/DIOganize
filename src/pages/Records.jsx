import { useEffect, useState } from 'react';

function Records({ requests, onView }) {
  const [service, setService] = useState('Baptism');

  useEffect(() => {
    const handler = (event) => setService(event.detail === 'Funeral Service' ? 'Funeral Service' : event.detail);
    window.addEventListener('dioganize-record-service', handler);
    return () => window.removeEventListener('dioganize-record-service', handler);
  }, []);

  const items = requests.filter((request) => request.service === service && ['Approved', 'Scheduled', 'Completed'].includes(request.status));

  return <div><div className="page-heading"><div><small>Records</small><h1>{service} Records</h1><p>Completed and approved parish service records.</p></div></div><div className="service-tabs">{['Baptism', 'Wedding', 'Funeral Service'].map((item) => <button className={service === item ? 'active' : ''} key={item} onClick={() => setService(item)}>{item}</button>)}</div><div className="record-grid">{items.map((request) => <article className="record-card" key={request.id}><div><span className="service-pill">{request.service}</span><h3>{request.applicant}</h3><p>{request.date} • {request.venue}</p></div><button className="button button-secondary" onClick={() => onView(request)}>View</button></article>)}{!items.length && <div className="empty-state">No approved or completed records yet.</div>}</div></div>;
}

export default Records;
