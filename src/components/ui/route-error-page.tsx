import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';

export function RouteErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText || 'Page unavailable'}`
    : 'Something went wrong';

  const message = isRouteErrorResponse(error)
    ? 'We could not load this page. Please try again.'
    : 'CommercePro hit an unexpected error while loading this view.';

  return (
    <main className="route-error-page" role="alert">
      <div className="route-error-card">
        <span className="route-error-icon"><AlertTriangle /></span>
        <div>
          <p className="route-error-eyebrow">COMMERCEPRO</p>
          <h1>{title}</h1>
          <p>{message}</p>
        </div>
        <div className="route-error-actions">
          <button type="button" onClick={() => navigate(-1)}>
            <ArrowLeft /> Go back
          </button>
          <button type="button" className="primary" onClick={() => window.location.reload()}>
            <RefreshCw /> Try again
          </button>
        </div>
      </div>
    </main>
  );
}
