import { Link } from 'react-router-dom';

function NotFound({ isAuthenticated = false }) {
  return (
    <div className="container py-5 text-center" style={{ maxWidth: 540 }}>
      <div className="card border-0 shadow-sm p-5">
        <h1 className="display-4 fw-bold text-primary mb-2">404</h1>
        <h2 className="h4 mb-3">Page Not Found</h2>
        <p className="text-muted mb-4">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="d-flex justify-content-center gap-2">
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="btn btn-primary">
            {isAuthenticated ? 'Go to Dashboard' : 'Go to Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
