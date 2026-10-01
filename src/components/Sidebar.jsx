import Icon from './Icons';

const SERVICES = ['Baptism', 'Wedding', 'Funeral Service', 'Confirmation', 'First Communion', 'Blessing', 'Marriage Preparation'];
const ITEMS = [
  ['Dashboard', 'Dashboard', 'home'],
  ['Schedule', 'ScheduleService', 'calendar'],
  ['Calendar', 'Calendar', 'calendar'],
  ['Church Services', 'ChurchServices', 'church'],
  ['Applications', 'Applications', 'file'],
  ['Members', 'Members', 'users'],
  ['Ministries', 'Ministries', 'person'],
  ['Announcements', 'Announcements', 'bell'],
  ['Documents', 'Documents', 'folder']
];

export default function Sidebar({ activePage, onNavigate, onLogout, open, onClose }) {
  const go = (target) => { onNavigate(target); onClose?.(); };
  const isActive = (target) => activePage === target || (target === 'ChurchServices' && SERVICES.includes(activePage));

  return (
    <>
      <div className={open ? 'sidebar-overlay show' : 'sidebar-overlay'} onClick={onClose} />
      <aside className={open ? 'sidebar open' : 'sidebar'}>
        <div className="brand" onClick={() => go('Dashboard')}>
          <span className="brand-icon"><Icon name="church" size={46} /></span>
          <strong>DIO<span>ganize</span></strong>
          <small>Church Scheduling &amp; Administration System</small>
        </div>
        <nav>
          {ITEMS.map(([label, target, icon]) => (
            <button key={label} className={isActive(target) ? 'nav-item active' : 'nav-item'} onClick={() => go(target)}>
              <Icon name={icon} size={22} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-verse">
          <Icon name="cross" size={22} />
          <p>“For where two or three gather in my name, there am I with them.”</p>
          <small>Matthew 18:20</small>
        </div>
        <button className="logout-link" onClick={onLogout}>Logout</button>
      </aside>
    </>
  );
}
