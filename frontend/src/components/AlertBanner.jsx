import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ALERT_TIPOS } from '../constants.js';
import { timeAgo } from '../utils.js';
import { AlertIcon } from './Icons.jsx';

const POLL_MS = 30000;

export default function AlertBanner() {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchAlerts = () =>
      apiRequest('/alerts', { token })
        .then((data) => {
          if (!cancelled) setAlerts(data.alerts);
        })
        .catch(() => {});

    fetchAlerts();
    const id = setInterval(fetchAlerts, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [token]);

  const visible = alerts.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  const latest = visible[0];

  return (
    <div role="alert" className="bg-red-600 text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 text-sm">
        <AlertIcon className="h-5 w-5 shrink-0" />
        <p className="min-w-0 flex-1">
          <span className="font-bold">{ALERT_TIPOS[latest.tipo]}</span> en {latest.barrio}{' '}
          <span className="text-red-100">({timeAgo(latest.createdAt)})</span>
          {visible.length > 1 && (
            <span className="text-red-100"> · y {visible.length - 1} alerta(s) más</span>
          )}
        </p>
        <Link
          to="/emergencia"
          className="shrink-0 rounded-lg bg-white px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-50"
        >
          Ver detalles
        </Link>
        <button
          type="button"
          onClick={() => setDismissed((prev) => [...prev, ...visible.map((a) => a.id)])}
          aria-label="Ocultar alertas"
          className="shrink-0 rounded-lg px-2 py-1 text-lg leading-none text-red-100 hover:bg-red-700"
        >
          ×
        </button>
      </div>
    </div>
  );
}
