import { useEffect, useMemo, useState } from 'react';

const defaults = {
  Baptism: { applicant: '', childName: '', date: '', time: '', venue: 'Main Church', notes: '', attachments: [] },
  Wedding: { applicant: '', brideName: '', groomName: '', date: '', time: '', venue: 'Main Church', notes: '', attachments: [] },
  'Funeral Service': { applicant: '', deceasedName: '', date: '', time: '', venue: 'Parish Chapel', notes: '', attachments: [] }
};

function ScheduleService({ defaultService, onSubmit, onCancel }) {
  const [service, setService] = useState(defaultService || 'Baptism');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(defaults[defaultService || 'Baptism']);

  useEffect(() => {
    setForm(defaults[service]);
    setStep(1);
  }, [service]);

  const canContinue = useMemo(() => {
    if (step === 1) {
      return Boolean(form.applicant && (service !== 'Baptism' || form.childName) && (service !== 'Wedding' || (form.brideName && form.groomName)) && (service !== 'Funeral Service' || form.deceasedName));
    }
    if (step === 2) {
      return Boolean(form.date && form.time && form.venue);
    }
    return true;
  }, [form, service, step]);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setForm((current) => ({
          ...current,
          attachments: [...current.attachments, { id: `${Date.now()}-${file.name}`, name: file.name, type: file.type, data: reader.result }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (id) => setForm((current) => ({ ...current, attachments: current.attachments.filter((file) => file.id !== id) }));

  const submit = async (event) => {
    event.preventDefault();
    const payload = { ...form, service, applicant: form.applicant || form.brideName || form.deceasedName };

    try {
      await fetch('http://localhost:8080/api/service-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error('Could not reach backend server (is npm run server running?):', err);
    }

    onSubmit(payload);
  };

  return (
    <div>
      <div className="page-heading"><div><small>Scheduling</small><h1>Schedule a Service</h1><p>Create a new parish service application.</p></div></div>
      <form className="form-card" onSubmit={submit}>
        <div className="service-selector">
          {Object.keys(defaults).map((item) => <button type="button" key={item} className={service === item ? 'selected' : ''} onClick={() => setService(item)}>{item}</button>)}
        </div>
        <div className="stepper">{['Service Information', 'Schedule', 'Attachments', 'Review'].map((item, index) => <div className={step === index + 1 ? 'active' : step > index + 1 ? 'done' : ''} key={item}><span>{index + 1}</span>{item}</div>)}</div>

        {step === 1 && (
          <div className="form-section"><h2>{service} Information</h2><p className="muted">Enter the main details for this service request.</p>
            <div className="form-grid">
              <Field label="Applicant / Family Representative" required value={form.applicant} onChange={(value) => setField('applicant', value)} placeholder="Full name" />
              {service === 'Baptism' && <Field label="Child Full Name" required value={form.childName} onChange={(value) => setField('childName', value)} placeholder="Child's full name" />}
              {service === 'Wedding' && <><Field label="Bride Full Name" required value={form.brideName} onChange={(value) => setField('brideName', value)} placeholder="Bride's full name" /><Field label="Groom Full Name" required value={form.groomName} onChange={(value) => setField('groomName', value)} placeholder="Groom's full name" /></>}
              {service === 'Funeral Service' && <Field label="Deceased Name" required value={form.deceasedName} onChange={(value) => setField('deceasedName', value)} placeholder="Full name of deceased" />}
              <Field label="Contact Number" value={form.contact} onChange={(value) => setField('contact', value)} placeholder="09XX XXX XXXX" />
              <Field label="Address" value={form.address} onChange={(value) => setField('address', value)} placeholder="Complete address" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-section"><h2>Schedule Details</h2><p className="muted">Choose the preferred date, time, and venue.</p><div className="form-grid"><Field label="Preferred Date" required type="date" value={form.date} onChange={(value) => setField('date', value)} /><Field label="Preferred Time" required value={form.time} onChange={(value) => setField('time', value)} placeholder="10:00 AM" /><Field label="Venue" required value={form.venue} onChange={(value) => setField('venue', value)} placeholder="Main Church" /><label>Remarks<textarea value={form.notes} onChange={(e) => setField('notes', e.target.value)} placeholder="Special instructions or notes..." /></label></div></div>
        )}

        {step === 3 && (
          <div className="form-section"><h2>Attachments</h2><p className="muted">Attach pictures or documents required for the application.</p><label className="upload-box"><input type="file" accept="image/*,.pdf" multiple onChange={handleFiles} /><span className="upload-symbol">＋</span><strong>Choose pictures or documents</strong><small>JPG, PNG, PDF • Max 5 MB per file</small></label><div className="uploaded-grid">{form.attachments.map((file) => <div className="uploaded-item" key={file.id}>{file.type.startsWith('image/') ? <img src={file.data} alt={file.name} /> : <div className="pdf-thumb">PDF</div>}<div><strong>{file.name}</strong><button type="button" onClick={() => removeFile(file.id)}>Remove</button></div></div>)}</div></div>
        )}

        {step === 4 && (
          <div className="form-section"><h2>Review Application</h2><div className="review-card"><div><span>Service</span><strong>{service}</strong></div><div><span>Applicant</span><strong>{form.applicant || form.brideName || form.deceasedName}</strong></div><div><span>Date</span><strong>{form.date}</strong></div><div><span>Time</span><strong>{form.time}</strong></div><div><span>Venue</span><strong>{form.venue}</strong></div><div><span>Attachments</span><strong>{form.attachments.length} file(s)</strong></div></div><p className="review-note">Submitting this form will create a Pending application that can be reviewed from Applications.</p></div>
        )}

        <div className="form-actions"><button type="button" className="button button-secondary" onClick={step === 1 ? onCancel : () => setStep(step - 1)}>{step === 1 ? 'Cancel' : 'Back'}</button>{step < 4 ? <button type="button" className="button button-primary" disabled={!canContinue} onClick={() => setStep(step + 1)}>Continue →</button> : <button className="button button-gold">Submit Application</button>}</div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', required = false }) {
  return <label>{label}{required && <em>*</em>}<input type={type} required={required} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>;
}

export default ScheduleService;
