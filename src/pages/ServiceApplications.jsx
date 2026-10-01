import { useEffect, useMemo, useState } from 'react';

function ServiceApplications({ service, requests, onView, onUpdate, onDelete }) {
  const [activeService, setActiveService] = useState(service);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  useEffect(() => {
    const handler = (event) => setActiveService(event.detail);
    window.addEventListener('dioganize-service', handler);
    return () => window.removeEventListener('dioganize-service', handler);
  }, []);

  const items = useMemo(() => requests.filter((request) => {
    const matchesService = request.service === activeService;
    const matchesStatus = status === 'All' || request.status === status;
    const haystack = `${request.applicant} ${request.childName || ''} ${request.deceasedName || ''}`.toLowerCase();
    return matchesService && matchesStatus && haystack.includes(search.toLowerCase());
  }), [requests, activeService, status, search]);

  return (
    <div>
      <div className="page-heading"><div><small>Services / View Cards</small><h1>{activeService} Applications</h1><p>Manage {activeService.toLowerCase()} applications, schedules, and attachments.</p></div><button className="button button-primary" onClick={() => window.dispatchEvent(new CustomEvent('dioganize-open-schedule'))}>+ New Application</button></div>
      <div className="service-tabs">{['Baptism', 'Wedding', 'Funeral Service'].map((item) => <button key={item} className={activeService === item ? 'active' : ''} onClick={() => setActiveService(item)}>{item}</button>)}</div>
      <div className="toolbar"><input placeholder="Search by applicant..." value={search} onChange={(e) => setSearch(e.target.value)} /><select value={status} onChange={(e) => setStatus(e.target.value)}><option>All</option><option>Pending</option><option>Approved</option><option>Scheduled</option><option>Rejected</option></select></div>
      <div className="application-card-grid">
        {items.map((request) => <ApplicationCard key={request.id} request={request} onView={onView} onUpdate={onUpdate} onDelete={onDelete} />)}
        {!items.length && <div className="empty-state">No applications found for {activeService}.</div>}
      </div>
    </div>
  );
}

function ApplicationCard({ request, onView, onUpdate, onDelete }) {
  const firstImage = request.attachments?.find((file) => file.type?.startsWith('image/'));
  return (
    <article className="application-card">
      <div className="application-photo">{firstImage ? <img src={firstImage.data} alt="Attachment" /> : <span>{request.service === 'Baptism' ? '✦' : request.service === 'Wedding' ? '∞' : '✚'}</span>}</div>
      <div className="application-content"><div className="application-top"><span className={`status status-${request.status.toLowerCase()}`}>{request.status}</span><small>#{request.id}</small></div><h3>{request.applicant}</h3><p>{request.childName || request.deceasedName || 'Service application'}</p><div className="application-meta"><span>{request.date}</span><span>{request.time}</span><span>{request.venue}</span></div><div className="application-actions"><button onClick={() => onView(request)}>View Details</button><button onClick={() => onUpdate(request.id, { status: request.status === 'Approved' ? 'Scheduled' : 'Approved' })}>{request.status === 'Approved' ? 'Schedule' : 'Approve'}</button><button className="danger-text" onClick={() => onDelete(request.id)}>Delete</button></div></div>
    </article>
  );
}

export default ServiceApplications;
