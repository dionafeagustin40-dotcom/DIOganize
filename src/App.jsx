import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
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
import Profile from './pages/Profile';
import AccessDenied from './pages/AccessDenied';
import NotFound from './pages/NotFound';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { initialRequests } from './data/events';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './App.css';

const STORAGE_KEY = 'dioganize_requests_v3';
const PRODUCTION_API_URL = 'https://dioganize.onrender.com';

function resolveApiBaseUrl() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window === 'undefined') return PRODUCTION_API_URL;
  const { hostname, origin } = window.location;
  // Local development: use the local Express server
  if (hostname === 'localhost' || hostname === '127.0.0.1') return 'http://localhost:8080';
  // Served directly by the Render backend: same origin
  if (hostname.endsWith('.onrender.com')) return origin;
  // Netlify or any other host: use the live Render API
  return PRODUCTION_API_URL;
}

const API_BASE_URL = resolveApiBaseUrl().replace(/\/+$/, '');
const API_URL = `${API_BASE_URL}/api/service-applications`;

const PAGE_TO_PATH = {
  Dashboard: '/dashboard',
  ChurchServices: '/services',
  ScheduleService: '/schedule',
  ServiceApplications: '/service-applications',
  Events: '/events',
  Calendar: '/calendar',
  Applications: '/applications',
  Records: '/records',
  Documents: '/documents',
  MySchedules: '/my-schedules',
  Profile: '/profile'
};

const PATH_TO_PAGE = Object.fromEntries(
  Object.entries(PAGE_TO_PATH).map(([pageKey, path]) => [path, pageKey])
);

async function apiRequest(url, options = {}) {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const doFetch = () => fetch(url, { ...options, headers });

  let response;
  try {
    response = await doFetch();
  } catch {
    // Render free tier may be waking up: wait and retry once
    await new Promise(resolve => setTimeout(resolve, 4000));
    try {
      response = await doFetch();
    } catch {
      throw new Error('Cannot reach the server. Please check your internet connection and try again in a few seconds.');
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Database request failed.');
  }

  return data;
}

function getOwner(request) {
  return request.ownerId || request.user_id || '';
}

function RequireAuth({ authReady, isAuthenticated, children }) {
  const location = useLocation();
  if (!authReady) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function RequireRole({ role, allowedRoles, children }) {
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/access-denied" replace />;
  }
  return children;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [authReady, setAuthReady] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const [requests, setRequests] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialRequests;
    } catch {
      return initialRequests;
    }
  });

  const [selectedService, setSelectedService] = useState('Baptism');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState('');

  const [account, setAccount] = useState({
    type: 'User',
    email: '',
    name: '',
    uid: ''
  });

  const isAuthenticated = Boolean(account.uid);
  const activePage = PATH_TO_PAGE[location.pathname] || 'Dashboard';

  // Network status listener for PWA offline fallback banner
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAccount({
          type: 'User',
          email: '',
          name: '',
          uid: ''
        });
        setAuthReady(true);
        return;
      }

      const cachedRole =
        localStorage.getItem(`dioganize_role_${user.uid}`) || 'User';

      let role = cachedRole;

      try {
        const roleSnap = await getDoc(doc(db, 'users', user.uid));

        if (roleSnap.exists()) {
          const remoteRole = roleSnap.data()?.role;

          if (remoteRole === 'Admin' || remoteRole === 'User') {
            role = remoteRole;
            localStorage.setItem(
              `dioganize_role_${user.uid}`,
              role
            );
          }
        }
      } catch (error) {
        console.error('Role checking error:', error);
      }

      setAccount({
        type: role,
        email: user.email || '',
        name: user.displayName || user.email?.split('@')[0] || role,
        uid: user.uid
      });
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Save local copy for offline viewing
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(requests)
      );
    } catch (error) {
      console.error('Local storage error:', error);
    }
  }, [requests]);

  // VIEW - Load applications from MySQL
  useEffect(() => {
    if (!account.uid) return undefined;

    let active = true;

    const loadApplications = async () => {
      if (!navigator.onLine) return;
      try {
        const data = await apiRequest(API_URL);

        if (active && Array.isArray(data)) {
          setRequests(data);
        }
      } catch (error) {
        console.error(
          'Could not load MySQL applications:',
          error.message
        );
      }
    };

    loadApplications();

    const interval = setInterval(loadApplications, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [account.uid]);

  // Open schedule event
  useEffect(() => {
    const openSchedule = () => navigate('/schedule');

    window.addEventListener(
      'dioganize-open-schedule',
      openSchedule
    );

    return () => {
      window.removeEventListener(
        'dioganize-open-schedule',
        openSchedule
      );
    };
  }, [navigate]);

  // Toast timer
  useEffect(() => {
    if (!toast) return undefined;

    const timer = setTimeout(() => setToast(''), 2800);

    return () => clearTimeout(timer);
  }, [toast]);

  const upcoming = useMemo(() => {
    return [...requests]
      .filter(request => request.status !== 'Rejected')
      .sort((a, b) =>
        `${a.date || a.application_date || ''} ${a.time || ''}`
          .localeCompare(
            `${b.date || b.application_date || ''} ${b.time || ''}`
          )
      );
  }, [requests]);

  // Login callback
  const handleLogin = (type = 'User', profile = {}) => {
    const role = type === 'Admin' ? 'Admin' : 'User';

    if (profile.uid) {
      localStorage.setItem(
        `dioganize_role_${profile.uid}`,
        role
      );
    }

    setAccount({
      type: role,
      email: profile.email || '',
      name: profile.name || '',
      uid: profile.uid || ''
    });

    navigate('/dashboard', { replace: true });
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }

    setAccount({
      type: 'User',
      email: '',
      name: '',
      uid: ''
    });

    setRequests([]);
    navigate('/login', { replace: true });
  };

  const handleNavigate = (nextPage) => {
    const path = PAGE_TO_PATH[nextPage] || '/dashboard';
    navigate(path);
    setSidebarOpen(false);
    setSelectedRequest(null);
  };

  const openService = (service) => {
    setSelectedService(service);
    navigate('/service-applications');
    setSidebarOpen(false);
  };

  // ADD - Save application to MySQL
  const handleAddRequest = async (request) => {
    try {
      const payload = {
        ...request,
        user_id: account.uid || null,
        ownerId: account.uid || '',
        ownerEmail: account.email || '',
        email: account.email || request.email || null,
        service_type: request.service_type || request.service,
        applicant_name: request.applicant_name || request.applicant,
        contact_number:
          request.contact_number || request.contact || null,
        application_date:
          request.application_date || request.date || null,
        status: request.status || 'Pending'
      };

      const savedApplication = await apiRequest(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setRequests(current => [
        savedApplication,
        ...current.filter(
          item => String(item.id) !== String(savedApplication.id)
        )
      ]);

      setToast('Application submitted successfully!');
      navigate('/applications');

      return savedApplication;
    } catch (error) {
      console.error('[APP] Submission error:', error);
      setToast(`Submission failed: ${error.message}`);
      throw error;
    }
  };

  // EDIT - Update application in MySQL
  const updateRequest = async (id, updates) => {
    const existing = requests.find(
      request => String(request.id) === String(id)
    );

    if (!existing) return;

    const updatedItem = {
      ...existing,
      ...updates
    };

    try {
      await apiRequest(`${API_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...updatedItem,
          service_type:
            updatedItem.service_type || updatedItem.service,
          applicant_name:
            updatedItem.applicant_name || updatedItem.applicant,
          contact_number:
            updatedItem.contact_number ||
            updatedItem.contact || null,
          application_date:
            updatedItem.date ||
            updatedItem.application_date || null
        })
      });

      setRequests(current =>
        current.map(request =>
          String(request.id) === String(id)
            ? updatedItem
            : request
        )
      );

      setSelectedRequest(current => {
        if (!current || String(current.id) !== String(id)) {
          return current;
        }

        return {
          ...updatedItem,
          __startEditing: false
        };
      });

      setToast('Application updated successfully!');
    } catch (error) {
      console.error('EDIT application error:', error);
      setToast(`Update failed: ${error.message}`);
    }
  };

  // DELETE - Remove application from MySQL
  const deleteRequest = async (id) => {
    const request = requests.find(
      item => String(item.id) === String(id)
    );

    const confirmed = window.confirm(
      `Are you sure you want to delete the application of ${
        request?.applicant || request?.applicant_name ||
        'this applicant'
      }?`
    );

    if (!confirmed) return;

    try {
      await apiRequest(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      setRequests(current =>
        current.filter(
          item => String(item.id) !== String(id)
        )
      );

      setSelectedRequest(null);
      setToast('Application deleted successfully!');
    } catch (error) {
      console.error('DELETE application error:', error);
      setToast(`Delete failed: ${error.message}`);
    }
  };

  // Filter applications by account
  const visibleRequests = account.type === 'Admin'
    ? requests
    : requests.filter(request => {
        const owner = getOwner(request);
        return !owner || owner === account.uid;
      });

  const visibleUpcoming = upcoming.filter(request => {
    const owner = getOwner(request);
    return account.type === 'Admin' || !owner || owner === account.uid;
  });

  const renderAppShell = (content) => (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
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

        {!isOnline && (
          <div className="alert alert-warning rounded-0 mb-0 py-2 px-4 d-flex align-items-center justify-content-between" role="alert">
            <span>
              <strong>Offline Mode:</strong> You are currently offline. Viewing cached data; new submissions or edits require an internet connection.
            </span>
          </div>
        )}

        <main className="page-container">
          {content}
        </main>
      </div>

      {toast && (
        <div className="toast-message">
          {toast}
        </div>
      )}

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

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <Landing onContinue={() => navigate('/login')} />
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <Login onLogin={handleLogin} onBack={() => navigate('/')} />
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth authReady={authReady} isAuthenticated={isAuthenticated}>
            {renderAppShell(
              <Dashboard
                requests={visibleRequests}
                upcoming={visibleUpcoming}
                onService={openService}
                onNavigate={handleNavigate}
                onViewRequest={setSelectedRequest}
                account={account}
              />
            )}
          </RequireAuth>
        }
      />
      <Route
        path="/services"
        element={
          <RequireAuth authReady={authReady} isAuthenticated={isAuthenticated}>
            {renderAppShell(
              <ChurchServices onService={openService} requests={visibleRequests} />
            )}
          </RequireAuth>
        }
      />
      <Route
        path="/schedule"
        element={
          <RequireAuth authReady={authReady} isAuthenticated={isAuthenticated}>
            {renderAppShell(
              <ScheduleService
                defaultService={selectedService}
                onSubmit={handleAddRequest}
                onCancel={() => navigate('/dashboard')}
              />
            )}
          </RequireAuth>
        }
      />
      <Route
        path="/service-applications"
        element={
          <RequireAuth authReady={authReady} isAuthenticated={isAuthenticated}>
            {renderAppShell(
              <ServiceApplications
                service={selectedService}
                requests={visibleRequests}
                onView={setSelectedRequest}
                onUpdate={updateRequest}
                onDelete={deleteRequest}
              />
            )}
          </RequireAuth>
        }
      />
      <Route
        path="/events"
        element={
          <RequireAuth authReady={authReady} isAuthenticated={isAuthenticated}>
            {renderAppShell(
              <Events requests={visibleRequests} onView={setSelectedRequest} />
            )}
          </RequireAuth>
        }
      />
      <Route
        path="/my-schedules"
        element={
          <RequireAuth authReady={authReady} isAuthenticated={isAuthenticated}>
            {renderAppShell(
              <Events requests={visibleRequests} onView={setSelectedRequest} />
            )}
          </RequireAuth>
        }
      />
      <Route
        path="/calendar"
        element={
          <RequireAuth authReady={authReady} isAuthenticated={isAuthenticated}>
            {renderAppShell(<Calendar requests={visibleRequests} />)}
          </RequireAuth>
        }
      />
      <Route
        path="/applications"
        element={
          <RequireAuth authReady={authReady} isAuthenticated={isAuthenticated}>
            {renderAppShell(
              <Applications
                requests={visibleRequests}
                onView={setSelectedRequest}
                onUpdate={updateRequest}
                onDelete={deleteRequest}
                isAdmin={account.type === 'Admin'}
              />
            )}
          </RequireAuth>
        }
      />
      <Route
        path="/records"
        element={
          <RequireAuth authReady={authReady} isAuthenticated={isAuthenticated}>
            <RequireRole role={account.type} allowedRoles={['Admin']}>
              {renderAppShell(
                <Records requests={visibleRequests} onView={setSelectedRequest} />
              )}
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/documents"
        element={
          <RequireAuth authReady={authReady} isAuthenticated={isAuthenticated}>
            {renderAppShell(<Documents />)}
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth authReady={authReady} isAuthenticated={isAuthenticated}>
            {renderAppShell(<Profile account={account} onLogout={handleLogout} />)}
          </RequireAuth>
        }
      />
      <Route
        path="/access-denied"
        element={
          <RequireAuth authReady={authReady} isAuthenticated={isAuthenticated}>
            {renderAppShell(<AccessDenied />)}
          </RequireAuth>
        }
      />
      <Route
        path="*"
        element={<NotFound isAuthenticated={isAuthenticated} />}
      />
    </Routes>
  );
}

function RequestModal({
  request,
  onClose,
  onUpdate,
  onDelete,
  isAdmin = false
}) {
  const [editing, setEditing] = useState(
    Boolean(request.__startEditing)
  );

  const [form, setForm] = useState({
    date: request.date ||
      (request.application_date
        ? String(request.application_date).slice(0, 10)
        : ''),
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
      <div
        className="request-modal"
        onMouseDown={event => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className={`service-pill ${(request.service || 'service').toLowerCase().replaceAll(' ', '-')}`}>
              {request.service || request.service_type}
            </span>

            <h2>{request.applicant || request.applicant_name}</h2>
            <p>Application #{request.id}</p>
          </div>

          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="modal-grid">
          <div className="detail-panel">
            <h3>Application Details</h3>

            <Detail
              label="Applicant"
              value={request.applicant || request.applicant_name}
            />

            <Detail
              label="Service"
              value={request.service || request.service_type}
            />

            {request.childName && (
              <Detail label="Child" value={request.childName} />
            )}

            {request.brideName && (
              <Detail label="Bride" value={request.brideName} />
            )}

            {request.groomName && (
              <Detail label="Groom" value={request.groomName} />
            )}

            {request.deceasedName && (
              <Detail label="Deceased" value={request.deceasedName} />
            )}

            <Detail
              label="Contact"
              value={request.contact || request.contact_number}
            />

            <Detail label="Status" value={request.status} />
          </div>

          <div className="detail-panel">
            <h3>Schedule</h3>

            {editing ? (
              <div className="edit-fields">
                <label>
                  Date
                  <input
                    type="date"
                    value={form.date}
                    onChange={event =>
                      setForm({
                        ...form,
                        date: event.target.value
                      })
                    }
                  />
                </label>

                <label>
                  Time
                  <input
                    value={form.time}
                    onChange={event =>
                      setForm({
                        ...form,
                        time: event.target.value
                      })
                    }
                  />
                </label>

                <label>
                  Venue
                  <input
                    value={form.venue}
                    onChange={event =>
                      setForm({
                        ...form,
                        venue: event.target.value
                      })
                    }
                  />
                </label>

                <label>
                  Remarks
                  <textarea
                    value={form.notes}
                    onChange={event =>
                      setForm({
                        ...form,
                        notes: event.target.value
                      })
                    }
                  />
                </label>
              </div>
            ) : (
              <>
                <Detail
                  label="Date"
                  value={request.date || request.application_date}
                />

                <Detail label="Time" value={request.time} />
                <Detail label="Venue" value={request.venue} />

                <Detail
                  label="Remarks"
                  value={request.notes || 'No remarks.'}
                />
              </>
            )}
          </div>
        </div>

        <div className="attachment-panel">
          <div>
            <h3>Attachments</h3>
            <p>
              Pictures and documents submitted with this application.
            </p>
          </div>

          <div className="attachment-list">
            {request.attachments?.length ? (
              request.attachments.map(file => (
                <div className="attachment-item" key={file.id}>
                  {file.type?.startsWith('image/') && file.data ? (
                    <img src={file.data} alt={file.name} />
                  ) : (
                    <span className="file-preview">PDF</span>
                  )}

                  <span>{file.name}</span>
                </div>
              ))
            ) : (
              <div className="empty-attachment">
                No attachments uploaded.
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          {isAdmin && request.status === 'Pending' && (
            <>
              <button
                className="button button-success"
                onClick={() =>
                  onUpdate(request.id, { status: 'Approved' })
                }
              >
                Approve
              </button>

              <button
                className="button button-danger"
                onClick={() =>
                  onUpdate(request.id, { status: 'Rejected' })
                }
              >
                Reject
              </button>
            </>
          )}

          {isAdmin && request.status === 'Approved' && (
            <button
              className="button button-primary"
              onClick={() =>
                onUpdate(request.id, { status: 'Scheduled' })
              }
            >
              Mark Scheduled
            </button>
          )}

          <button
            className="button button-secondary"
            onClick={() => setEditing(value => !value)}
          >
            {editing ? 'Cancel Edit' : 'Edit Schedule'}
          </button>

          {editing && (
            <button
              className="button button-gold"
              onClick={save}
            >
              Save Changes
            </button>
          )}

          <button
            className="button button-danger-outline"
            onClick={() => onDelete(request.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value || '—'}</strong>
    </div>
  );
}

export default App;
