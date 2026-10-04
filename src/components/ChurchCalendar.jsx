function ChurchCalendar({ requests }) {
  const days = Array.from({ length: 30 }, (_, index) => index + 1);
  const eventDays = new Set(requests.map((request) => Number(request.date?.slice(-2))));

  return (
    <div className="calendar-widget">
      <div className="calendar-heading">
        <div>
          <small>Calendar</small>
          <h3>September 2026</h3>
        </div>
        <div className="calendar-controls"><button>‹</button><button>›</button></div>
      </div>
      <div className="weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="calendar-grid">
        {days.map((day) => (
          <div key={day} className={`calendar-day ${eventDays.has(day) ? 'has-event' : ''}`}>
            <span>{day}</span>
            {eventDays.has(day) && <i />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChurchCalendar;
