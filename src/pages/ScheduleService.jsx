import { useMemo, useState } from 'react';
import Icon from '../components/Icons';
import { slug, TAGLINE } from '../utils';

const SERVICES = ['Baptism','Wedding','Funeral Service','Confirmation','First Communion','Blessing','Marriage Preparation'];
const VENUES = ['Main Church','Parish Chapel','Parish Hall'];
const base = { applicant:'', contact:'', email:'', childName:'', brideName:'', groomName:'', deceasedName:'', date:'', time:'', venue:'Main Church', notes:'', attachments:[] };

export default function ScheduleService({ defaultService='Baptism', onSubmit, onCancel }) {
  const [service, setService] = useState(SERVICES.includes(defaultService) ? defaultService : 'Baptism');
  const [form, setForm] = useState({...base});
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);

  const set = (key, value) => setForm((f) => ({...f, [key]:value}));
  const valid = useMemo(() => {
    if (step === 1) return form.applicant.trim() && form.contact.trim();
    if (step === 2) return form.date && form.time && form.venue;
    return true;
  }, [form, step]);

  const changeService = (value) => { setService(value); setForm({...base}); setStep(1); setFiles([]); };
  const [drag, setDrag] = useState(false);
  const addFiles = (e) => handleFiles(e.target.files);
  const dropFiles = (e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); };
  const handleFiles = (list) => {
    const selected = Array.from(list || []).filter((f) => f.type.startsWith('image/') && f.size <= 2 * 1024 * 1024).slice(0, 2);
    setFiles(selected);
    Promise.all(selected.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const max = 1000;
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve({name:file.name, type:'image/jpeg', data:canvas.toDataURL('image/jpeg', .72)});
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }))).then((attachments) => setForm((f)=>({...f,attachments})));
  };
  const submit = async (e) => {
    e.preventDefault();
    const payload = {...form, service, applicant: form.applicant.trim(), createdAt: new Date().toISOString()};
    await onSubmit(payload);
  };

  return <div className="schedule-page">
    <div className="page-heading"><div><span className="eyebrow dark">CHURCH SERVICES</span><h1>Schedule a Service</h1><p>Choose a parish service and submit your preferred schedule.</p></div><button className="text-button" onClick={onCancel}>Back</button></div>
    <div className="svc-pick">{SERVICES.map((s)=><button type="button" key={s} className={'svc-card'+(service===s?' selected':'')} onClick={()=>changeService(s)}><div className={'svc-img '+slug(s)}/><div className="svc-body"><b>{s}</b><small>{TAGLINE[s]}</small></div></button>)}</div>
    <form className="schedule-card" onSubmit={submit}>
      <div className="steps">{['Applicant','Schedule','Attachment','Review'].map((s,i)=><div key={s} className={step===i+1?'active':step>i+1?'done':''}><b>{i+1}</b><span>{s}</span></div>)}</div>
      {step===1 && <section className="form-section"><h2>{service} information</h2><p>Enter the information needed for the parish request.</p><div className="form-grid">
        <Field label="Applicant / Family Representative" value={form.applicant} onChange={(v)=>set('applicant',v)} required placeholder="Full name" />
        <Field label="Contact Number" value={form.contact} onChange={(v)=>set('contact',v)} required placeholder="09XX XXX XXXX" />
        <Field label="Email Address" type="email" value={form.email} onChange={(v)=>set('email',v)} placeholder="you@example.com" />
        {service==='Baptism' && <Field label="Child Full Name" value={form.childName} onChange={(v)=>set('childName',v)} placeholder="Child's full name" />}
        {service==='Wedding' && <><Field label="Bride Full Name" value={form.brideName} onChange={(v)=>set('brideName',v)} placeholder="Bride's full name"/><Field label="Groom Full Name" value={form.groomName} onChange={(v)=>set('groomName',v)} placeholder="Groom's full name"/></>}
        {service==='Funeral Service' && <Field label="Deceased Full Name" value={form.deceasedName} onChange={(v)=>set('deceasedName',v)} placeholder="Full name of deceased"/>}
        <label className="wide">Address<textarea value={form.address||''} onChange={(e)=>set('address',e.target.value)} placeholder="Complete address" /></label>
      </div></section>}
      {step===2 && <section className="form-section"><h2>Preferred schedule</h2><p>Your request will be saved as <b>Pending</b> until reviewed.</p><div className="form-grid"><Field label="Date" type="date" value={form.date} onChange={(v)=>set('date',v)} required/><Field label="Time" type="time" value={form.time} onChange={(v)=>set('time',v)} required/><label>Church / Venue<em>*</em><select value={form.venue} onChange={(e)=>set('venue',e.target.value)} required>{[...new Set([...VENUES, form.venue].filter(Boolean))].map((v)=><option key={v}>{v}</option>)}</select></label><label className="wide">Remarks / Special Requests<textarea value={form.notes} onChange={(e)=>set('notes',e.target.value)} placeholder="Optional notes"/></label></div></section>}
      {step===3 && <section className="form-section"><h2>Attach Image <small>(Optional)</small></h2><p>Attach a supporting picture if needed. Images are compressed before saving to keep Firestore documents small.</p><label className={'upload-area'+(drag?' drag':'')} onDragOver={(e)=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={dropFiles}><input type="file" accept="image/*" multiple onChange={addFiles}/><Icon name="folder" size={30}/><strong>Click to upload or drag and drop</strong><span>PNG, JPG (Max 2MB each, up to 2 images)</span></label>{files.length>0 && <div className="file-list">{files.map((f)=><div key={f.name}><span>{f.type.startsWith('image/')?'🖼️':'📄'}</span>{f.name}</div>)}</div>}</section>}
      {step===4 && <section className="form-section"><h2>Review before submitting</h2><div className="review-grid"><div><small>Service</small><b>{service}</b></div><div><small>Applicant</small><b>{form.applicant}</b></div><div><small>Date</small><b>{form.date}</b></div><div><small>Time</small><b>{form.time}</b></div><div><small>Venue</small><b>{form.venue}</b></div><div><small>Contact</small><b>{form.contact}</b></div></div><div className="notice">After you submit, the application appears in <b>My Schedules</b> and is stored in Firestore when Firebase is configured.</div></section>}
      <div className="form-actions"><button type="button" className="button button-secondary" onClick={step===1?onCancel:()=>setStep(step-1)}>{step===1?'Cancel':'Back'}</button>{step<4?<button type="button" className="button button-primary" disabled={!valid} onClick={()=>setStep(step+1)}>Continue →</button>:<button className="button button-gold">Submit Request</button>}</div>
    </form>
  </div>;
}
function Field({label,value,onChange,placeholder,type='text',required=false}){return <label>{label}{required&&<em>*</em>}<input type={type} required={required} value={value||''} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder}/></label>}
