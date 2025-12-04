import { useNavigate } from 'react-router-dom';
import './NotFoundPage.css';

/**
 * NotFoundPage - 404 page for invalid routes
 */
export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="page not-found-page">
      <div className="container">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Go to Home
        </button>
      </div>
    </div>
  );
}
