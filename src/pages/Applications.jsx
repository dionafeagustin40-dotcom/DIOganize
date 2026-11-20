import { useEffect, useMemo, useState } from 'react';

function Applications({
  requests = [],
  onView,
  onUpdate,
  onDelete,
  isAdmin = false
}) {
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handler = (event) => {
      setStatus(event.detail || 'All');
    };

    window.addEventListener('dioganize-status', handler);

    return () => {
      window.removeEventListener('dioganize-status', handler);
    };
  }, []);

  // Support both MySQL field names and older frontend field names.
  const items = useMemo(() => {
    return requests.filter((request) => {
      const applicant =
        request.applicant ||
        request.applicant_name ||
        '';

      const service =
        request.service ||
        request.service_type ||
        '';

      const matchStatus =
        status === 'All' || request.status === status;

      const text = `${applicant} ${service}`.toLowerCase();

      return matchStatus &&
        text.includes(search.toLowerCase());
    });
  }, [requests, status, search]);

  return (
    <div>
      <div className="page-heading">
        <div>
          <small>Applications</small>
          <h1>{isAdmin ? 'All Applications' : 'My Applications'}</h1>
          <p>
            {isAdmin
              ? 'Review and manage parish service requests.'
              : 'View and manage your submitted service requests.'}
          </p>
        </div>
      </div>

      <div className="toolbar">
        <input
          placeholder="Search applications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="application-card-grid">
        {items.map((request) => {
          const applicant =
            request.applicant ||
            request.applicant_name ||
            'Unnamed Applicant';

          const service =
            request.service ||
            request.service_type ||
            'Service';

          const date =
            request.date ||
            (request.application_date
              ? String(request.application_date).slice(0, 10)
              : '');

          const time = request.time || '';
          const venue = request.venue || '';
          const currentStatus = request.status || 'Pending';

          return (
            <article
              className="application-card compact-card"
              key={request.id}
            >
              <div className="application-content">
                <div className="application-top">
                  <span className={`service-pill ${service.toLowerCase().replaceAll(' ', '-')}`}>
                    {service}
                  </span>

                  <span className={`status status-${currentStatus.toLowerCase()}`}>
                    {currentStatus}
                  </span>
                </div>

                <h3>{applicant}</h3>

                <p>
                  {date || 'No date'}
                  {time ? ` • ${time}` : ''}
                  {venue ? ` • ${venue}` : ''}
                </p>

                <div className="application-actions">
                  <button onClick={() => onView(request)}>
                    View Details
                  </button>

                  <button
                    onClick={() =>
                      onView({
                        ...request,
                        __startEditing: true
                      })
                    }
                  >
                    Edit
                  </button>

                  {isAdmin && currentStatus === 'Pending' && (
                    <button
                      onClick={() =>
                        onUpdate(request.id, {
                          status: 'Approved'
                        })
                      }
                    >
                      Approve
                    </button>
                  )}

                  <button
                    className="danger-text"
                    onClick={() => onDelete(request.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        {!items.length && (
          <div className="empty-state">
            No applications found.
          </div>
        )}
      </div>
    </div>
  );
}

export default Applications;
