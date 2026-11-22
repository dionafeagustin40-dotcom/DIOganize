function Profile({ account, onLogout }) {
  const isAdmin = account?.type === 'Admin';
  const displayName = account?.name || (isAdmin ? 'Admin' : 'Parish User');
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div>
      <div className="page-heading">
        <div>
          <small>{isAdmin ? 'Admin Account' : 'Account'}</small>
          <h1>{isAdmin ? 'Admin Profile' : 'User Profile'}</h1>
          <p>
            {isAdmin
              ? 'View your administrator account details and system privileges.'
              : 'View your signed-in account details and role permissions.'}
          </p>
        </div>
      </div>

      <div className="card border-0 shadow-sm p-4" style={{ maxWidth: 640 }}>
        <div className="d-flex align-items-center gap-3 mb-4">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
            style={{ width: 64, height: 64, backgroundColor: '#102d50', fontSize: 24 }}
          >
            {initial}
          </div>
          <div>
            <h4 className="mb-1">{displayName}</h4>
            <span className={`badge ${isAdmin ? 'bg-warning text-dark' : 'bg-primary'}`}>
              {isAdmin ? 'Admin' : 'User'}
            </span>
          </div>
        </div>

        <div className="list-group list-group-flush mb-4">
          <div className="list-group-item px-0 d-flex justify-content-between">
            <span className="text-muted">Email</span>
            <strong>{account?.email || 'Not provided'}</strong>
          </div>
          <div className="list-group-item px-0 d-flex justify-content-between">
            <span className="text-muted">Role</span>
            <strong>{isAdmin ? 'Admin' : 'User'}</strong>
          </div>
          <div className="list-group-item px-0 d-flex justify-content-between">
            <span className="text-muted">{isAdmin ? 'Admin ID' : 'User ID'}</span>
            <code className="small">{account?.uid || '—'}</code>
          </div>
        </div>

        <div>
          <button className="btn btn-outline-danger" onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
