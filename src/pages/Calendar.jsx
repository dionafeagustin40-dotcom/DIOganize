import ChurchCalendar from '../components/ChurchCalendar';

function Calendar({ requests }) {
  return <div><div className="page-heading"><div><small>Scheduling</small><h1>Calendar</h1><p>View Baptism, Wedding, and Funeral Service schedules.</p></div></div><ChurchCalendar requests={requests} /></div>;
}

export default Calendar;
