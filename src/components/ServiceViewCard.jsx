import { useEffect, useState } from 'react';
import Icon from './Icons';
import { slug, TAGLINE, fmtDate, fmtTime } from '../utils';

export default function ServiceViewCard({ request: r, onClose }) {
  const [more, setMore] = useState(false);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const img = r.attachments?.[0]?.data;
  const extra = [
    ['Contact', r.contact], ['Email', r.email], ['Address', r.address],
    ['Child', r.childName], ['Bride', r.brideName], ['Groom', r.groomName], ['Deceased', r.deceasedName],
    ['Remarks', r.notes]
  ].filter(([, v]) => v);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="view-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="vc-close" onClick={onClose} aria-label="Close">×</button>
        <div className={'svc-img ' + slug(r.service)} />
        <div className="vc-body">
          <h3>{r.service.toUpperCase()}</h3>
          <p className="vc-tag">{TAGLINE[r.service]}</p>
          <div className="vc-grid">
            <Row icon="calendar" label="Date" value={fmtDate(r.date)} />
            <Row icon="clock" label="Time" value={fmtTime(r.time)} />
            <Row icon="pin" label="Church / Venue" value={r.venue} />
            <Row icon="person" label="Applicant" value={r.applicant} />
            <div className="vc-row">
              <Icon name="file" size={18} />
              <span><small>Status</small><b className={'status ' + (r.status || '').toLowerCase()}>{r.status}</b></span>
            </div>
          </div>
          {img && <div className="vc-attach"><small>Attached Image</small><img src={img} alt="Attachment" /></div>}
          {more && (
            <dl className="vc-extra">
              {extra.length ? extra.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>) : <div><dd>No additional details.</dd></div>}
            </dl>
          )}
          <button className="button button-primary full" onClick={() => setMore(!more)}>{more ? 'Hide Details' : 'View Details'}</button>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }) {
  return (
    <div className="vc-row">
      <Icon name={icon} size={18} />
      <span><small>{label}</small><b>{value || '—'}</b></span>
    </div>
  );
}
