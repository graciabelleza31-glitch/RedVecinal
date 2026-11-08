import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ALERT_TIPOS, EMERGENCY_NUMBERS } from '../constants.js';
import { timeAgo } from '../utils.js';
import { AlertIcon, PhoneIcon } from '../components/Icons.jsx';

export default function Emergencia() {
  const { token, user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [tipo, setTipo] = useState('medica');
  const [mensaje, setMensaje] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadAlerts = useCallback(async () => {
    try {
      const data = await apiRequest('/alerts', { token });
      setAlerts(data.alerts);
      setLoadError('');
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAlerts();
    const id = setInterval(loadAlerts, 15000);
    return () => clearInterval(id);
  }, [loadAlerts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSent(false);
    if (!mensaje.trim()) return setError('Describe brevemente qué está pasando.');
    if (!window.confirm('Se enviará una alerta a todos los vecinos de tu distrito. ¿Continuar?')) return;

    setSubmitting(true);
    try {
      const data = await apiRequest('/alerts', {
        method: 'POST',
        token,
        body: { tipo, mensaje, ubicacion },
      });
      setAlerts((prev) => [data.alert, ...prev]);
      setMensaje('');
      setUbicacion('');
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await apiRequest(`/alerts/${id}/resolve`, { method: 'PATCH', token });
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setLoadError(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-xl bg-red-600 p-6 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <AlertIcon className="h-8 w-8" />
          <h1 className="text-2xl font-extrabold sm:text-3xl">Modo Emergencia</h1>
        </div>
        <p className="mt-2 text-red-100">
          Si hay peligro inmediato, llama primero a los servicios de emergencia. Luego avisa a tus
          vecinos.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {EMERGENCY_NUMBERS.map((n) => (
            <a
              key={n.number}
              href={`tel:${n.number}`}
              className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-red-700 shadow-sm transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>
                <span className="block text-xs font-medium text-red-600/80">{n.label}</span>
                <span className="text-2xl font-extrabold">{n.number}</span>
              </span>
              <PhoneIcon className="h-6 w-6" />
            </a>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="card space-y-4 p-5" noValidate>
          <h2 className="font-bold text-gray-900">Alertar a mis vecinos</h2>
          <p className="text-sm text-gray-500">
            Se avisará a la red de {user?.distrito}. Tu teléfono del perfil será visible en la alerta.
          </p>

          {error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {sent && (
            <div role="status" className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
              Alerta enviada a tus vecinos.
            </div>
          )}

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-gray-700">Tipo de emergencia</legend>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ALERT_TIPOS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTipo(key)}
                  aria-pressed={tipo === key}
                  className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    tipo === key
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="mensaje" className="mb-1.5 block text-sm font-medium text-gray-700">
              ¿Qué está pasando?
            </label>
            <textarea
              id="mensaje"
              rows={3}
              maxLength={300}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Ej: Un vecino se desmayó y necesita ayuda."
              className="input resize-y"
            />
          </div>

          <div>
            <label htmlFor="ubicacion" className="mb-1.5 block text-sm font-medium text-gray-700">
              Dirección o referencia
            </label>
            <input
              id="ubicacion"
              maxLength={150}
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              placeholder={`Calle, número o referencia en ${user?.barrio}`}
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {submitting ? 'Enviando…' : 'Enviar alerta'}
          </button>
        </form>

        <section className="space-y-3" aria-label="Alertas activas">
          <h2 className="font-bold text-gray-900">Alertas activas (últimas 24 h)</h2>

          {loadError && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          )}

          {loading && <div className="card h-24 animate-pulse" />}

          {!loading && alerts.length === 0 && (
            <div className="card px-5 py-10 text-center">
              <p className="font-bold text-gray-900">Todo tranquilo por ahora</p>
              <p className="mt-1 text-sm text-gray-500">No hay alertas activas en tu distrito.</p>
            </div>
          )}

          {alerts.map((a) => (
            <article key={a.id} className="card border-l-4 border-red-600 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-red-700">{ALERT_TIPOS[a.tipo]}</p>
                  <p className="text-xs text-gray-500">
                    {a.barrio} · {timeAgo(a.createdAt)}
                  </p>
                </div>
                {a.isOwner && (
                  <button type="button" onClick={() => handleResolve(a.id)} className="btn-secondary !px-3 !py-1.5 text-xs">
                    Ya está resuelto
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-700">{a.mensaje}</p>
              {a.ubicacion && <p className="mt-1 text-sm text-gray-500">📍 {a.ubicacion}</p>}
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {a.author.nombre} {a.author.apellido}
                </span>
                {a.author.telefono && (
                  <a
                    href={`tel:${a.author.telefono}`}
                    className="inline-flex items-center gap-1.5 font-semibold text-red-700 hover:underline"
                  >
                    <PhoneIcon className="h-4 w-4" /> {a.author.telefono}
                  </a>
                )}
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
