import { Link } from 'react-router-dom';
import { useSeo } from './useSeo';

export default function NotFound() {
  useSeo({ title: 'Page not found', noindex: true });
  return (
    <div className="page page--center">
      <h1 className="page__title">Page not found</h1>
      <p className="page__lead">That page doesn't exist (yet).</p>
      <Link to="/" className="btn btn--primary">Back to all components</Link>
    </div>
  );
}
