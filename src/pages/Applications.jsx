import { useEffect, useMemo, useState } from 'react';

function Applications({ requests, onView, onUpdate, onDelete, isAdmin = false }) {
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handler = (event) => setStatus(event.detail === 'All' ? 'All' : event.detail);
    window.addEventListener('dioganize-status', handler);
    return () => window.removeEventListener('dioganize-status', handler);
  }, []);

  const items = useMemo(() => requests.filter((request) => {
    const matchStatus = status === 'All' || request.status === status;
    const text = `${request.applicant} ${request.service}`.toLowerCase();
    return matchStatus && text.includes(search.toLowerCase());
  }), [requests, status, search]);

  return (
    <div>
      <div className="page-heading">
        <div>
          <small>Applications</small>
          <h1>{isAdmin ? 'All Applications' : 'My Applications'}</h1>
          <p>{isAdmin ? 'Review and manage parish service requests.' : 'View and manage your submitted service requests.'}</p>
        </div>
      </div>

      <div className="toolbar">
        <input
          placeholder="Search applications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Scheduled</option>
          <option>Rejected</option>
        </select>
      </div>

      <div className="application-card-grid">
        {items.map((request) => (
          <article className="application-card compact-card" key={request.id}>
            <div className="application-content">
              <div className="application-top">
                <span className={`service-pill ${request.service.toLowerCase().replaceAll(' ', '-')}`}>{request.service}</span>
                <span className={`status status-${request.status.toLowerCase()}`}>{request.status}</span>
              </div>
              <h3>{request.applicant}</h3>
              <p>{request.date} • {request.time} • {request.venue}</p>
              <div className="application-actions">
                <button onClick={() => onView(request)}>View Details</button>
                <button onClick={() => onView(request)}>Edit</button>
                {isAdmin && request.status === 'Pending' && (
                  <button onClick={() => onUpdate(request.id, { status: 'Approved' })}>Approve</button>
                )}
                <button className="danger-text" onClick={() => onDelete(request.id)}>Delete</button>
              </div>
            </div>
          </article>
        ))}
        {!items.length && <div className="empty-state">No applications found.</div>}
      </div>
    </div>
  );
}

export default Applications;
