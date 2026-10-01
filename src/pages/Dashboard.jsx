import { useState } from 'react';
import Icon from '../components/Icons';
import ServiceViewCard from '../components/ServiceViewCard';
import { kind, fmtDate, fmtTime } from '../utils';

const FEATURED = [
  ['Baptism', 'A new life in Christ', 'baptism'],
  ['Wedding', 'A union in faith and love', 'wedding'],
  ['Funeral Service', "In God's loving care", 'funeral']
];

export default function Dashboard({ requests, onNavigate, onService, account }) {
  const [view, setView] = useState(null);
  const count = (s) => requests.filter((r) => r.status === s).length;
  const next = [...requests]
    .filter((r) => r.status !== 'Rejected' && r.status !== 'Cancelled')
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 4);

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="hero-small">Welcome,</p>
          <h1>{account?.name || 'DIOganize User'}!</h1>
          <div className="hero-divider"><span /><Icon name="cross" size={16} /><span /></div>
          <p className="hero-blessing">May your day be filled with God's grace and peace.</p>
          <p className="hero-verse">“For where two or three gather in my name, there am I with them.”<br /><b>Matthew 18:20</b></p>
          <button className="button button-gold hero-cta" onClick={() => onNavigate('ScheduleService')}>Schedule a Service →</button>
        </div>
      </section>

      <div className="stat-row">
        <Stat icon="calendar" tone="blue" n={requests.length} t="Total Schedules" />
        <Stat icon="check" tone="green" n={count('Approved')} t="Approved" />
        <Stat icon="clock" tone="amber" n={count('Pending')} t="Pending" />
        <Stat icon="x" tone="red" n={count('Rejected')} t="Rejected" />
      </div>

      <div className="dashboard-columns">
        <section className="panel">
          <div className="panel-title">
            <h2>Church Services</h2>
            <button onClick={() => onNavigate('ChurchServices')}>View all</button>
          </div>
          <div className="svc-grid">
            {FEATURED.map(([name, desc, cls]) => (
              <button key={name} className="svc-card" onClick={() => onService(name)}>
                <div className={'svc-img ' + cls} />
                <div className="svc-body"><b>{name}</b><small>{desc}</small></div>
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <h2>Upcoming Schedules</h2>
            <button onClick={() => onNavigate('Events')}>View all</button>
          </div>
          {next.length ? next.map((r) => (
            <button className="up-item" key={r.id} onClick={() => setView(r)}>
              <span className={'up-icon ' + kind(r.service)}><Icon name={kind(r.service) === 'baptism' ? 'calendar' : 'person'} size={18} /></span>
              <div>
                <b>{r.service}{r.applicant ? ' - ' + r.applicant : ''}</b>
                <small>{fmtDate(r.date)} • {fmtTime(r.time)}</small>
              </div>
              <span className={'status ' + (r.status || '').toLowerCase()}>{r.status}</span>
            </button>
          )) : <div className="empty-state">No schedules yet. Create your first church service schedule.</div>}
        </section>
      </div>
      {view && <ServiceViewCard request={view} onClose={() => setView(null)} />}
    </div>
  );
}

function Stat({ icon, tone, n, t }) {
  return (
    <div className="stat-card">
      <span className={'stat-icon ' + tone}><Icon name={icon} size={26} /></span>
      <div><small>{t}</small><b>{n}</b></div>
    </div>
  );
}
