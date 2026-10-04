import { useEffect, useMemo, useState } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChurchServices from './pages/ChurchServices';
import ScheduleService from './pages/ScheduleService';
import ServiceApplications from './pages/ServiceApplications';
import Events from './pages/Events';
import Calendar from './pages/Calendar';
import Applications from './pages/Applications';
import Records from './pages/Records';
import Documents from './pages/Documents';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { initialRequests } from './data/events';
import { auth, db } from './firebase';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  where
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './App.css';

const STORAGE_KEY = 'dioganize_requests_v3';

function App() {
  const [screen, setScreen] = useState('landing');
  const [page, setPage] = useState('Dashboard');
  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialRequests;
  });
  const [selectedService, setSelectedService] = useState('Baptism');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [account, setAccount] = useState({ type: 'User', email: '', name: '', uid: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const cachedRole = localStorage.getItem(`dioganize_role_${user.uid}`) || 'User';
      let role = cachedRole;

      try {
        const roleSnap = await getDoc(doc(db, 'users', user.uid));
        if (roleSnap.exists()) {
          const remoteRole = roleSnap.data()?.role;
          if (remoteRole === 'Admin' || remoteRole === 'User') {
            role = remoteRole;
            localStorage.setItem(`dioganize_role_${user.uid}`, role);
          }
        }
      } catch {
        // Offline: keep the cached role.
      }

      setAccount({
        type: role,
        email: user.email || '',
        name: user.displayName || user.email?.split('@')[0] || role,
        uid: user.uid
      });
      setScreen('app');
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    if (!account.uid) return undefined;

    const applications = collection(db, 'serviceApplications');
    const source = account.type === 'Admin'
      ? query(applications)
      : query(applications, where('ownerId', '==', account.uid));

    const unsubscribe = onSnapshot(source, (snapshot) => {
      if (!snapshot.docs.length) return;

      const remoteRequests = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setRequests((current) => {
        const map = new Map(current.map((item) => [String(item.id), item]));
        remoteRequests.forEach((item) => map.set(String(item.id), item));
        return Array.from(map.values()).sort((a, b) => String(b.id).localeCompare(String(a.id)));
      });
    }, () => {
      // Firestore can continue serving cached data while offline.
    });

    return () => unsubscribe();
  }, [account.uid, account.type]);

  useEffect(() => {
    const openSchedule = () => setPage('ScheduleService');
    window.addEventListener('dioganize-open-schedule', openSchedule);
    return () => window.removeEventListener('dioganize-open-schedule', openSchedule);
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(() => setToast(''), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const upcoming = useMemo(() => {
    return [...requests]
      .filter((request) => request.status !== 'Rejected')
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }, [requests]);

  const handleLogin = (type = 'User', profile = {}) => {
    const role = type === 'Admin' ? 'Admin' : 'User';
    if (profile.uid) localStorage.setItem(`dioganize_role_${profile.uid}`, role);
    setAccount({
      type: role,
      email: profile.email || '',
      name: profile.name || '',
      uid: profile.uid || ''
    });
    setScreen('app');
    setPage('Dashboard');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // Allow local logout even if the device is offline.
    }
    setAccount({ type: 'User', email: '', name: '', uid: '' });
    setScreen('login');
    setPage('Dashboard');
  };

  const openService = (service) => {
    setSelectedService(service);
    setPage('ServiceApplications');
    setSidebarOpen(false);
  };

  const handleAddRequest = (request) => {
    const newRequest = {
      ...request,
      id: Date.now(),
      status: 'Pending',
      ownerId: account.uid || '',
      ownerEmail: account.email || ''
    };
    setRequests((current) => [newRequest, ...current]);
    if (account.uid) {
      setDoc(doc(db, 'serviceApplications', String(newRequest.id)), newRequest, { merge: true }).catch(() => {});
    }
    setToast(`${request.service} application submitted successfully.`);
    setPage('Applications');
  };

  const updateRequest = (id, updates) => {
    setRequests((current) => {
      const updated = current.map((request) => request.id === id ? { ...request, ...updates } : request);
      const item = updated.find((request) => request.id === id);
      if (item && account.uid) {
        setDoc(doc(db, 'serviceApplications', String(id)), item, { merge: true }).catch(() => {});
      }
      return updated;
    });
    setSelectedRequest((current) => {
      if (!current || current.id !== id) return current;
      return { ...current, ...updates };
    });
  };

  const deleteRequest = (id) => {
    setRequests((current) => current.filter((request) => request.id !== id));
    if (account.uid) {
      deleteDoc(doc(db, 'serviceApplications', String(id))).catch(() => {});
    }
    setSelectedRequest(null);
    setToast('Application deleted.');
  };

  const handleNavigate = (nextPage) => {
    setPage(nextPage);
    setSidebarOpen(false);
    setSelectedRequest(null);
  };

  if (screen === 'landing') {
    return <Landing onContinue={() => setScreen('login')} />;
  }

  if (screen === 'login') {
    return <Login onLogin={handleLogin} onBack={() => setScreen('landing')} />;
  }

  const visibleRequests = account.type === 'Admin'
    ? requests
    : requests.filter((request) => !request.ownerId || request.ownerId === account.uid);

  const pageContent = {
    Dashboard: (
      <Dashboard
        requests={visibleRequests}
        upcoming={upcoming.filter((request) => !request.ownerId || request.ownerId === account.uid)}
        onService={openService}
        onNavigate={handleNavigate}
        onViewRequest={setSelectedRequest}
        account={account}
      />
    ),
    ChurchServices: <ChurchServices onService={openService} requests={visibleRequests} />,
    ScheduleService: (
      <ScheduleService
        defaultService={selectedService}
        onSubmit={handleAddRequest}
        onCancel={() => setPage('Dashboard')}
      />
    ),
    ServiceApplications: (
      <ServiceApplications
        service={selectedService}
        requests={visibleRequests}
        onView={setSelectedRequest}
        onUpdate={updateRequest}
        onDelete={deleteRequest}
      />
    ),
    Events: <Events requests={visibleRequests} onView={setSelectedRequest} />,
    Calendar: <Calendar requests={visibleRequests} />,
    Applications: (
      <Applications
        requests={visibleRequests}
        onView={setSelectedRequest}
        onUpdate={updateRequest}
        onDelete={deleteRequest}
        isAdmin={account.type === 'Admin'}
      />
    ),
    Records: <Records requests={visibleRequests} onView={setSelectedRequest} />,
    Documents: <Documents />,
    MySchedules: <Events requests={visibleRequests} onView={setSelectedRequest} />
  };

  return (
    <div className="app-shell">
      <Sidebar
        activePage={page}
        onNavigate={handleNavigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        onService={openService}
        account={account}
      />

      <div className="main-area">
        <Topbar
          onMenu={() => setSidebarOpen(true)}
          onNavigate={handleNavigate}
          account={account}
        />
        <main className="page-container">{pageContent[page] || pageContent.Dashboard}</main>
      </div>

      {toast && <div className="toast-message">{toast}</div>}

      {selectedRequest && (
        <RequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onUpdate={updateRequest}
          onDelete={deleteRequest}
          isAdmin={account.type === 'Admin'}
        />
      )}
    </div>
  );
}

function RequestModal({ request, onClose, onUpdate, onDelete, isAdmin = false }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    date: request.date || '',
    time: request.time || '',
    venue: request.venue || '',
    notes: request.notes || ''
  });

  const save = () => {
    onUpdate(request.id, form);
    setEditing(false);
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="request-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className={`service-pill ${request.service.toLowerCase().replaceAll(' ', '-')}`}>
              {request.service}
            </span>
            <h2>{request.applicant}</h2>
            <p>Application #{request.id}</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="modal-grid">
          <div className="detail-panel">
            <h3>Application Details</h3>
            <Detail label="Applicant" value={request.applicant} />
            <Detail label="Service" value={request.service} />
            {request.childName && <Detail label="Child" value={request.childName} />}
            {request.deceasedName && <Detail label="Deceased" value={request.deceasedName} />}
            <Detail label="Status" value={request.status} />
          </div>

          <div className="detail-panel">
            <h3>Schedule</h3>
            {editing ? (
              <div className="edit-fields">
                <label>Date<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
                <label>Time<input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></label>
                <label>Venue<input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></label>
                <label>Remarks<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
              </div>
            ) : (
              <>
                <Detail label="Date" value={request.date} />
                <Detail label="Time" value={request.time} />
                <Detail label="Venue" value={request.venue} />
                <Detail label="Remarks" value={request.notes || 'No remarks.'} />
              </>
            )}
          </div>
        </div>

        <div className="attachment-panel">
          <div>
            <h3>Attachments</h3>
            <p>Pictures and documents submitted with this application.</p>
          </div>
          <div className="attachment-list">
            {request.attachments?.length ? request.attachments.map((file) => (
              <div className="attachment-item" key={file.id}>
                {file.type?.startsWith('image/') && file.data ? <img src={file.data} alt={file.name} /> : <span className="file-preview">PDF</span>}
                <span>{file.name}</span>
              </div>
            )) : <div className="empty-attachment">No attachments uploaded.</div>}
          </div>
        </div>

        <div className="modal-actions">
          {isAdmin && request.status === 'Pending' && (
            <>
              <button className="button button-success" onClick={() => onUpdate(request.id, { status: 'Approved' })}>Approve</button>
              <button className="button button-danger" onClick={() => onUpdate(request.id, { status: 'Rejected' })}>Reject</button>
            </>
          )}
          {isAdmin && request.status === 'Approved' && (
            <button className="button button-primary" onClick={() => onUpdate(request.id, { status: 'Scheduled' })}>Mark Scheduled</button>
          )}
          <button className="button button-secondary" onClick={() => setEditing((value) => !value)}>{editing ? 'Cancel Edit' : 'Edit Schedule'}</button>
          {editing && <button className="button button-gold" onClick={save}>Save Changes</button>}
          <button className="button button-danger-outline" onClick={() => onDelete(request.id)}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;
