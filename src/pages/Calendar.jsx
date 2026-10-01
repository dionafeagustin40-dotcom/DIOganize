import { useMemo, useState } from 'react';
import Icon from '../components/Icons';
import ServiceViewCard from '../components/ServiceViewCard';
import { kind, fmtDate, fmtTime } from '../utils';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (n) => String(n).padStart(2, '0');

export default function Calendar({ requests }) {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState(null);

  const active = useMemo(() => requests.filter((r) => r.date && r.status !== 'Rejected' && r.status !== 'Cancelled'), [requests]);
  const byDate = useMemo(() => {
    const map = {};
    active.forEach((r) => { (map[r.date] = map[r.date] || []).push(r); });
    return map;
  }, [active]);

  const prefix = `${cursor.y}-${pad(cursor.m + 1)}`;
  const first = new Date(cursor.y, cursor.m, 1).getDay();
  const total = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  const dateStr = (d) => `${prefix}-${pad(d)}`;

  const move = (n) => {
    const d = new Date(cursor.y, cursor.m + n, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
    setSelected(null);
  };

  const list = (selected ? byDate[selected] || [] : active.filter((r) => r.date.startsWith(prefix)))
    .slice()
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  return (
    <section>
      <div className="page-heading">
        <div>
          <span className="eyebrow dark">SCHEDULES</span>
          <h1>Church Calendar</h1>
          <p>Select a date to see its services.</p>
        </div>
      </div>
      <div className="cal-layout">
        <div className="cal-card">
          <div className="cal-head">
            <div className="cal-nav">
              <button onClick={() => move(-1)} aria-label="Previous month">‹</button>
              <h2>{new Date(cursor.y, cursor.m, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}</h2>
              <button onClick={() => move(1)} aria-label="Next month">›</button>
            </div>
            <div className="cal-legend">
              <span><i className="dot baptism" /> Baptism</span>
              <span><i className="dot wedding" /> Wedding</span>
              <span><i className="dot funeral" /> Funeral Service</span>
              <span><i className="dot other" /> Other</span>
            </div>
          </div>
          <div className="cal-grid">
            {DOW.map((d) => <div key={d} className="cal-dow">{d}</div>)}
            {cells.map((d, i) => {
              if (!d) return <div key={'e' + i} className="cal-cell empty" />;
              const ds = dateStr(d);
              const items = byDate[ds] || [];
              const cls = 'cal-cell' + (ds === todayStr ? ' today' : '') + (ds === selected ? ' selected' : '');
              return (
                <button key={ds} className={cls} onClick={() => setSelected(ds === selected ? null : ds)}>
                  <span>{d}</span>
                  <span className="cal-dots">{items.slice(0, 3).map((r) => <i key={r.id} className={'dot ' + kind(r.service)} />)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="cal-card">
          <div className="panel-title">
            <h2>{selected ? fmtDate(selected) : 'Upcoming Schedules'}</h2>
            {selected && <button onClick={() => setSelected(null)}>Show month</button>}
          </div>
          {list.length ? list.map((r) => (
            <button className="up-item" key={r.id} onClick={() => setView(r)}>
              <span className={'up-icon ' + kind(r.service)}><Icon name="calendar" size={18} /></span>
              <div>
                <b>{r.service}{r.applicant ? ' - ' + r.applicant : ''}</b>
                <small>{fmtDate(r.date)} • {fmtTime(r.time)}</small>
              </div>
              <span className={'status ' + (r.status || '').toLowerCase()}>{r.status}</span>
            </button>
          )) : <div className="empty-state">No services {selected ? 'on this date' : 'this month'}.</div>}
        </div>
      </div>
      {view && <ServiceViewCard request={view} onClose={() => setView(null)} />}
    </section>
  );
}
