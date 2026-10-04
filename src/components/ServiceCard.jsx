function ServiceCard({ service, count, upcoming, onClick }) {
  const symbol = service === 'Baptism' ? '✦' : service === 'Wedding' ? '∞' : '✚';

  return (
    <article className={`service-card ${service.toLowerCase().replaceAll(' ', '-')}`}>
      <div className="service-card-top">
        <div className="service-symbol">{symbol}</div>
        <span>{count} Applications</span>
      </div>
      <h3>{service}</h3>
      <p>{service === 'Baptism' ? 'Welcome children into the Christian faith.' : service === 'Wedding' ? 'Celebrate and schedule your union in the church.' : 'Honor and remember your loved one with care.'}</p>
      <div className="service-card-footer">
        <small>{upcoming} upcoming schedules</small>
        <button onClick={onClick}>View Cards →</button>
      </div>
    </article>
  );
}

export default ServiceCard;
