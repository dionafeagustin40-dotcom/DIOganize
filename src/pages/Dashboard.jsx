import ServiceCard from '../components/ServiceCard';
import StatCard from '../components/StatCard';
import UpcomingEvents from '../components/UpcomingEvents';
import ChurchCalendar from '../components/ChurchCalendar';

function Dashboard({ requests, upcoming, onService, onNavigate, onViewRequest, account }) {
  const count = (service) => requests.filter((request) => request.service === service).length;
  const upcomingCount = (service) => requests.filter((request) => request.service === service && request.status !== 'Rejected').length;

  return (
    <div>
      <section className="hero-banner">
        <div><span className="eyebrow">PARISH ADMINISTRATION</span><h1>Welcome, {account?.name || (account?.type === 'Admin' ? 'Admin' : 'User')}</h1><p>May your day be filled with peace, purpose, and meaningful service.</p></div>
        <div className="hero-cross">✦</div>
      </section>

      <div className="page-heading"><div><small>Overview</small><h2>Service Management</h2></div><button className="button button-primary" onClick={() => onNavigate('ScheduleService')}>+ Schedule a Service</button></div>

      <section className="stats-grid">
        <StatCard title="Baptism" value={count('Baptism')} caption={`${upcomingCount('Baptism')} upcoming`} accent="blue" onClick={() => onService('Baptism')} />
        <StatCard title="Wedding" value={count('Wedding')} caption={`${upcomingCount('Wedding')} upcoming`} accent="gold" onClick={() => onService('Wedding')} />
        <StatCard title="Funeral Service" value={count('Funeral Service')} caption={`${upcomingCount('Funeral Service')} upcoming`} accent="purple" onClick={() => onService('Funeral Service')} />
        <StatCard title="All Applications" value={requests.length} caption="Across three services" accent="dark" onClick={() => onNavigate('Applications')} />
      </section>

      <section className="service-grid">
        <ServiceCard service="Baptism" count={count('Baptism')} upcoming={upcomingCount('Baptism')} onClick={() => onService('Baptism')} />
        <ServiceCard service="Wedding" count={count('Wedding')} upcoming={upcomingCount('Wedding')} onClick={() => onService('Wedding')} />
        <ServiceCard service="Funeral Service" count={count('Funeral Service')} upcoming={upcomingCount('Funeral Service')} onClick={() => onService('Funeral Service')} />
      </section>

      <section className="dashboard-grid">
        <UpcomingEvents requests={upcoming} onView={onViewRequest} />
        <ChurchCalendar requests={requests} />
      </section>
    </div>
  );
}

export default Dashboard;
