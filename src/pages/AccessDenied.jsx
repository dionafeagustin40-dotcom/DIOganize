import { Link } from 'react-router-dom';

function AccessDenied() {
  return (
    <div className="container py-5 text-center" style={{ maxWidth: 540 }}>
      <div className="card border-0 shadow-sm p-5">
        <h1 className="display-5 fw-bold text-danger mb-2">403</h1>
        <h2 className="h4 mb-3">Access Denied</h2>
        <p className="text-muted mb-4">
          You do not have permission to view this page. Administrator privileges are required.
        </p>
        <div className="d-flex justify-content-center gap-2">
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AccessDenied;
