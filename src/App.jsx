import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { auth, db, firebaseConfigured } from './firebase';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ScheduleService from './pages/ScheduleService';
import ChurchServices from './pages/ChurchServices';
import Events from './pages/Events';
import Calendar from './pages/Calendar';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ComingSoon from './components/ComingSoon';
import { fmtDate, fmtTime, slug } from './utils';
import './App.css';
import './theme.css';

const KEY='dioganize_schedules_v4';
const SERVICES=['Baptism','Wedding','Funeral Service','Confirmation','First Communion','Blessing','Marriage Preparation'];

export default function App(){
 const [screen,setScreen]=useState('landing'); const [page,setPage]=useState('Dashboard'); const [account,setAccount]=useState(null); const [requests,setRequests]=useState(()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch{return[]}}); const [toast,setToast]=useState(''); const [selectedService,setSelectedService]=useState('Baptism'); const [mobileOpen,setMobileOpen]=useState(false); const [role,setRole]=useState(null); const isAdmin=role==='admin';
 useEffect(()=>{if(!firebaseConfigured)return;return onAuthStateChanged(auth,u=>{if(u){setAccount({uid:u.uid,email:u.email||'',name:u.displayName||u.email?.split('@')[0]||'DIOganize User',photoURL:u.photoURL||''});setScreen('app')} });},[]);
 useEffect(()=>{localStorage.setItem(KEY,JSON.stringify(requests));},[requests]);
 useEffect(()=>{setRole(null);if(!firebaseConfigured||!account?.uid)return;let live=true;getDoc(doc(db,'admins',account.uid)).then(d=>{if(live)setRole(d.exists()?'admin':'user')}).catch(()=>{if(live)setRole('user')});return()=>{live=false};},[account?.uid]);
 useEffect(()=>{if(!firebaseConfigured||!account?.uid||role===null)return;const base=collection(db,'serviceApplications');const q=role==='admin'?query(base):query(base,where('uid','==',account.uid));return onSnapshot(q,s=>{const rows=s.docs.map(d=>({id:d.id,...d.data(),createdAt:d.data().createdAt?.toDate?.().toISOString?.()||d.data().createdAt||new Date().toISOString()})).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));setRequests(rows)},()=>{});},[account?.uid,role]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),3200);return()=>clearTimeout(t)},[toast]);
 const login=(u)=>{setAccount({uid:u.uid,email:u.email||'',name:u.displayName||u.email?.split('@')[0]||'DIOganize User',photoURL:u.photoURL||''});setScreen('app');setPage('Dashboard');setToast('Welcome to DIOganize.');};
 const logout=async()=>{try{if(firebaseConfigured)await signOut(auth)}catch{}setAccount(null);setRole(null);if(firebaseConfigured)setRequests([]);setScreen('landing');setPage('Dashboard');};
 const navigate=(p)=>{setPage(p);setMobileOpen(false)};
 const openService=(service)=>{setSelectedService(service);setPage('ScheduleService');setMobileOpen(false)};
 const addRequest=async(payload)=>{const id=Date.now().toString();const row={...payload,id,uid:account?.uid||null,email:account?.email||payload.email||'',status:'Pending',createdAt:new Date().toISOString()};setRequests(r=>[row,...r]);if(firebaseConfigured&&account?.uid){try{const ref=await addDoc(collection(db,'serviceApplications'),{...payload,uid:account.uid,status:'Pending',createdAt:serverTimestamp()});setRequests(r=>r.map(x=>x.id===id?{...x,id:ref.id}:x));setToast('Request sent to the admin for approval.');setPage('Applications');return;}catch(err){setToast('Saved locally. Firestore could not be reached.')}}setToast('Schedule submitted successfully.');setPage('Applications');};
 const updateRequest=async(id,updates)=>{setRequests(r=>r.map(x=>x.id===id?{...x,...updates}:x));if(firebaseConfigured&&!String(id).match(/^\d+$/)){try{await updateDoc(doc(db,'serviceApplications',id),updates)}catch{}}};
 const deleteRequest=async(id)=>{setRequests(r=>r.filter(x=>x.id!==id));if(firebaseConfigured&&!String(id).match(/^\d+$/)){try{await deleteDoc(doc(db,'serviceApplications',id))}catch{}}setToast('Schedule removed.');};
 if(screen==='landing')return <Landing onContinue={()=>setScreen('login')} />;
 if(screen==='login')return <Login onLogin={login} onBack={()=>setScreen('landing')}/>;
 const filtered=page==='Applications'?requests:requests;
 return <div className="app-shell"><Sidebar activePage={page} onNavigate={navigate} onLogout={logout} open={mobileOpen} onClose={()=>setMobileOpen(false)} account={account}/><div className="main-area"><Topbar onMenu={()=>setMobileOpen(true)} onNavigate={navigate} onLogout={logout} account={account} roleLabel={isAdmin?'Admin':'Parish User'} pendingCount={requests.filter(r=>r.status==='Pending').length}/><main className="page-container">{page==='Dashboard'&&<Dashboard requests={requests} account={account} onNavigate={navigate} onService={openService}/>} {page==='ScheduleService'&&<ScheduleService defaultService={selectedService} onSubmit={addRequest} onCancel={()=>navigate('Dashboard')}/>} {page==='Applications'&&<Applications requests={filtered} isAdmin={isAdmin} onUpdate={updateRequest} onDelete={deleteRequest}/>} {page==='Events'&&<Events requests={requests}/>} {page==='Calendar'&&<Calendar requests={requests}/>} {SERVICES.includes(page)&&<ServiceDetail service={page} onSchedule={openService} requests={requests}/>} {page==='ChurchServices'&&<ChurchServices onService={openService}/>} {page==='Members'&&<ComingSoon eyebrow="PARISH MANAGEMENT" title="Members" text="Manage parish members."/>} {page==='Ministries'&&<ComingSoon eyebrow="PARISH MANAGEMENT" title="Ministries" text="Parish ministries and groups."/>} {page==='Documents'&&<ComingSoon eyebrow="PARISH MANAGEMENT" title="Documents" text="Certificates and parish documents."/>} {page==='Announcements'&&<Announcements/>} {page==='Facilities'&&<Facilities/>}</main></div>{toast&&<div className="toast-message">{toast}</div>}</div>;
}

function Applications({requests,isAdmin,onUpdate,onDelete}){
 const [filter,setFilter]=useState('All');const [search,setSearch]=useState('');
 useEffect(()=>{const handler=(event)=>setSearch(event.detail||'');window.addEventListener('dioganize-search',handler);return()=>window.removeEventListener('dioganize-search',handler)},[]);
 const rows=useMemo(()=>requests.filter(r=>(filter==='All'||r.status===filter)&&`${r.applicant||''} ${r.service||''} ${r.email||''} ${r.venue||''}`.toLowerCase().includes(search.toLowerCase())),[requests,filter,search]);
 return <section>
  <div className="page-heading"><div><span className="eyebrow dark">{isAdmin?'ADMIN':'MY REQUESTS'}</span><h1>{isAdmin?'Applications':'My Applications'}</h1><p>{isAdmin?'Review, approve or reject service requests from parishioners.':'Track your requests. The parish admin will review and approve them.'}</p></div></div>
  <div className="toolbar"><input placeholder="Search applications..." value={search} onChange={e=>setSearch(e.target.value)}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Pending</option><option>Approved</option><option>Rejected</option></select></div>
  <div className="table-card"><table><thead><tr><th>Service</th><th>Applicant</th>{isAdmin&&<th>Requested by</th>}<th>Date</th><th>Time</th><th>Venue</th><th>Status</th><th>Action</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><b>{r.service}</b></td><td>{r.applicant}</td>{isAdmin&&<td>{r.email||'—'}</td>}<td>{fmtDate(r.date)}</td><td>{fmtTime(r.time)}</td><td>{r.venue}</td><td><span className={'status '+(r.status||'').toLowerCase()}>{r.status}</span></td><td className="actions">{isAdmin?<>{r.status==='Pending'&&<button onClick={()=>onUpdate(r.id,{status:'Approved'})}>Approve</button>}{r.status!=='Rejected'&&<button onClick={()=>onUpdate(r.id,{status:'Rejected'})}>Reject</button>}<button className="danger" onClick={()=>onDelete(r.id)}>Delete</button></>:(r.status==='Pending'?<button className="danger" onClick={()=>onDelete(r.id)}>Cancel request</button>:<span className="muted">—</span>)}</td></tr>)}</tbody></table>{!rows.length&&<div className="empty-state">No applications found.</div>}</div>
 </section>
}
function ServiceDetail({service,onSchedule,requests}){const count=requests.filter(r=>r.service===service).length;return <section><div className={'service-detail-hero sd-hero-'+slug(service)}><div><span className="eyebrow">CHURCH SERVICE</span><h1>{service}</h1><p>{service==='Baptism'?'A new life in Christ.':service==='Wedding'?'A union blessed in faith.':service==='Funeral Service'?'Honoring a life through prayer and remembrance.':'A meaningful parish service celebrated with faith and community.'}</p><button className="button button-gold" onClick={()=>onSchedule(service)}>Create Schedule →</button></div></div><div className="detail-info"><div><small>REQUESTS</small><b>{count}</b></div><div><small>LOCATION</small><b>Main Church</b></div><div><small>STATUS</small><b>Available for request</b></div></div></section>}
function Announcements(){return <section><div className="page-heading"><div><span className="eyebrow dark">PARISH NEWS</span><h1>Announcements</h1><p>Important church updates and schedules.</p></div></div><div className="announcement-grid"><article><div className="announcement-image one"/><b>Holy Week Schedule</b><p>Please check the parish schedule for Holy Week services and celebrations.</p></article><article><div className="announcement-image two"/><b>Church Community</b><p>Stay updated with parish activities and important notices.</p></article></div></section>}
function Facilities(){return <section><div className="page-heading"><div><span className="eyebrow dark">PARISH MANAGEMENT</span><h1>Facilities</h1><p>Available locations for church services.</p></div></div><div className="facility-grid"><div><b>Main Church</b><span>Primary worship and service venue</span></div><div><b>Parish Chapel</b><span>Quiet chapel for selected services</span></div><div><b>Parish Hall</b><span>Community and family gatherings</span></div></div></section>}
<div>hello</div>