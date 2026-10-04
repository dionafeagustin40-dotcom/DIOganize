import ServiceCard from '../components/ServiceCard';

function ChurchServices({ onService, requests }) {
  const services = ['Baptism', 'Wedding', 'Funeral Service'];

  return (
    <div>
      <section className="inner-hero"><div><span className="eyebrow">SERVICES</span><h1>Church Services</h1><p>Choose a service and manage its applications, schedules, and records.</p></div></section>
      <div className="service-grid service-page-grid">
        {services.map((service) => {
          const items = requests.filter((request) => request.service === service);
          return <ServiceCard key={service} service={service} count={items.length} upcoming={items.length} onClick={() => onService(service)} />;
        })}
      </div>
    </div>
  );
}

export default ChurchServices;
