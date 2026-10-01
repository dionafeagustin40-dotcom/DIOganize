import { useState } from 'react';
import Icon from '../components/Icons';
import ServiceViewCard from '../components/ServiceViewCard';
import { kind, fmtDate, fmtTime } from '../utils';

export default function Events({ requests }) {
  const [view, setView] = useState(null);
  const rows = [...requests].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  return (
    <section>
      <div className="page-heading">
        <div>
          <span className="eyebrow dark">SCHEDULES</span>
          <h1>Events</h1>
          <p>Your submitted church service schedules.</p>
        </div>
      </div>
      <div className="panel">
        {rows.length ? rows.map((r) => (
          <button className="up-item" key={r.id} onClick={() => setView(r)}>
            <span className={'up-icon ' + kind(r.service)}><Icon name="calendar" size={18} /></span>
            <div>
              <b>{r.service}{r.applicant ? ' - ' + r.applicant : ''}</b>
              <small>{fmtDate(r.date)} • {fmtTime(r.time)} • {r.venue}</small>
            </div>
            <span className={'status ' + (r.status || '').toLowerCase()}>{r.status}</span>
          </button>
        )) : <div className="empty-state">No scheduled services yet.</div>}
      </div>
      {view && <ServiceViewCard request={view} onClose={() => setView(null)} />}
    </section>
  );
}
