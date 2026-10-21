function UpcomingEvents({ requests, onView }) {
  return (
    <div className="upcoming-card">
      <div className="section-heading compact">
        <div><small>Schedule</small><h2>Upcoming Services</h2></div>
      </div>
      <div className="upcoming-list">
        {requests.slice(0, 5).map((request) => (
          <button className="upcoming-item" key={request.id} onClick={() => onView(request)}>
            <div className="date-box"><strong>{request.date?.slice(-2)}</strong><span>{request.date?.slice(5, 7) === '09' ? 'SEP' : 'DATE'}</span></div>
            <div className="upcoming-info"><strong>{request.service} — {request.applicant}</strong><span>{request.time} • {request.venue}</span></div>
            <span className={`status status-${request.status.toLowerCase().replace(' ', '-')}`}>{request.status}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default UpcomingEvents;
