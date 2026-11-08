import { useEffect, useState } from 'react';
import { apiRequest } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from './Avatar.jsx';

export default function NeighborsCard({ showList = true }) {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    apiRequest('/users/neighbors', { token })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [token, user?.barrio, user?.distrito]);

  return (
    <section className="card p-5" aria-label="Tu barrio">
      <h2 className="font-bold text-gray-900">{user?.barrio}</h2>
      <p className="text-sm text-gray-500">{user?.distrito}</p>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {data && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-brand-50 p-3">
              <p className="text-2xl font-extrabold text-brand-700">{data.count}</p>
              <p className="text-xs text-brand-700/80">vecinos en la red</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-2xl font-extrabold text-gray-800">{data.postsCount}</p>
              <p className="text-xs text-gray-500">publicaciones</p>
            </div>
          </div>

          {showList && (
            <div className="mt-4">
              {data.neighbors.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Aún eres el primero en tu barrio. Invita a tus vecinos a unirse.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {data.neighbors.slice(0, 8).map((n) => (
                    <li key={n.id} className="flex items-center gap-2.5">
                      <Avatar nombre={n.nombre} apellido={n.apellido} size="sm" />
                      <span className="text-sm text-gray-700">
                        {n.nombre} {n.apellido}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
