function Events({ requests, onView }) {
  const items = [...requests].sort((a, b) => a.date.localeCompare(b.date));
  return <div><div className="page-heading"><div><small>Scheduling</small><h1>Events</h1><p>All scheduled church service events.</p></div></div><div className="event-list">{items.map((request) => <button className="event-row" key={request.id} onClick={() => onView(request)}><div className="event-date"><strong>{request.date.slice(-2)}</strong><span>SEP</span></div><div><span className="service-pill">{request.service}</span><h3>{request.applicant}</h3><p>{request.time} • {request.venue}</p></div><span className={`status status-${request.status.toLowerCase()}`}>{request.status}</span></button>)}</div></div>;
}

export default Events;
