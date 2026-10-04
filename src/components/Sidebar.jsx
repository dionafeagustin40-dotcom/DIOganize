import { useState } from 'react';
function Sidebar({ activePage, onNavigate, open, onClose, onLogout, onService }) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [applicationsOpen, setApplicationsOpen] = useState(false);
  const [recordsOpen, setRecordsOpen] = useState(false);

  const go = (target) => {
    onNavigate(target);
    onClose?.();
  };

  const service = (name) => {
    if (onService) {
      onService(name);
      onClose?.();
      return;
    }
    go('ServiceApplications');
    setTimeout(() => window.dispatchEvent(new CustomEvent('dioganize-service', { detail: name })), 0);
  };

  const applicationStatus = (name) => {
    go('Applications');
    setTimeout(() => window.dispatchEvent(new CustomEvent('dioganize-status', { detail: name })), 0);
  };

  const recordService = (name) => {
    go('Records');
    setTimeout(() => window.dispatchEvent(new CustomEvent('dioganize-record-service', { detail: name })), 0);
  };

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand" onClick={() => go('Dashboard')}>
          <div className="brand-mark">✦</div>
          <div>
            <strong>DIOganize</strong>
            <span>Parish Service System</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${activePage === 'Dashboard' ? 'active' : ''}`} onClick={() => go('Dashboard')}>Dashboard</button>
          <button className={`nav-item ${activePage === 'ScheduleService' ? 'active' : ''}`} onClick={() => go('ScheduleService')}>Schedule a Service</button>
          <button className={`nav-item ${activePage === 'MySchedules' ? 'active' : ''}`} onClick={() => go('MySchedules')}>My Schedules</button>
          <button className={`nav-item ${activePage === 'Calendar' ? 'active' : ''}`} onClick={() => go('Calendar')}>Calendar</button>

          <button className={`nav-item ${activePage === 'ServiceApplications' ? 'active' : ''}`} onClick={() => setServicesOpen((value) => !value)}>
            Services <span className="nav-chevron">{servicesOpen ? '−' : '+'}</span>
          </button>
          {servicesOpen && (
            <div className="nav-submenu">
              <button onClick={() => service('Baptism')}>Baptism</button>
              <button onClick={() => service('Wedding')}>Wedding</button>
              <button onClick={() => service('Funeral Service')}>Funeral Service</button>
            </div>
          )}

          <button className={`nav-item ${activePage === 'Applications' ? 'active' : ''}`} onClick={() => setApplicationsOpen((value) => !value)}>
            Applications <span className="nav-chevron">{applicationsOpen ? '−' : '+'}</span>
          </button>
          {applicationsOpen && (
            <div className="nav-submenu">
              <button onClick={() => applicationStatus('All')}>All Applications</button>
              <button onClick={() => applicationStatus('Pending')}>Pending</button>
              <button onClick={() => applicationStatus('Approved')}>Approved</button>
              <button onClick={() => applicationStatus('Rejected')}>Rejected</button>
            </div>
          )}

          <button className={`nav-item ${activePage === 'Records' ? 'active' : ''}`} onClick={() => setRecordsOpen((value) => !value)}>
            Records <span className="nav-chevron">{recordsOpen ? '−' : '+'}</span>
          </button>
          {recordsOpen && (
            <div className="nav-submenu">
              <button onClick={() => recordService('Baptism')}>Baptism Records</button>
              <button onClick={() => recordService('Wedding')}>Wedding Records</button>
              <button onClick={() => recordService('Funeral Service')}>Funeral Records</button>
            </div>
          )}

          <button className={`nav-item ${activePage === 'Documents' ? 'active' : ''}`} onClick={() => go('Documents')}>Requirements</button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={() => go('Dashboard')}>Home</button>
          <button className="logout-link" onClick={onLogout}>Sign Out</button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
