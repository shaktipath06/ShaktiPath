import page from '@/styles/page.module.css';

/** Replaces an API-backed section when the Express API (or MySQL behind it) cannot be reached. */
export default function ApiUnavailable({ what = 'This section' }) {
  return (
    <div className={page.unavailable} role="status">
      <h2 className={page.unavailableTitle}>{`${what} is unavailable right now`}</h2>
      <p className={page.small}>
        The ShaktiPath API could not be reached. Please try again in a moment. (Developers: is the API running at the
        address in frontend/.env.local, and does /api/health report the database as connected?)
      </p>
    </div>
  );
}
