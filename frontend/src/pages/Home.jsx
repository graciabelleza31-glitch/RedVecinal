import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { TIPOS } from '../constants.js';
import usePosts from '../hooks/usePosts.js';
import PostForm from '../components/PostForm.jsx';
import PostList from '../components/PostList.jsx';
import NeighborsCard from '../components/NeighborsCard.jsx';

const SCOPES = [
  { value: 'barrio', label: 'Mi barrio' },
  { value: 'distrito', label: 'Mi distrito' },
  { value: 'todos', label: 'Todos' },
];

export default function Home() {
  const { user } = useAuth();
  const [scope, setScope] = useState('distrito');
  const [tipo, setTipo] = useState('');
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');

  // Debounce de la búsqueda
  useEffect(() => {
    const id = setTimeout(() => setQ(search.trim()), 350);
    return () => clearTimeout(id);
  }, [search]);

  const params = new URLSearchParams({ scope });
  if (tipo) params.set('tipo', tipo);
  if (q) params.set('q', q);

  const { posts, loading, error, updatePost, removePost, addPost } = usePosts(
    `/posts?${params.toString()}`
  );

  const handleCreated = (post) => {
    if (!tipo || tipo === post.tipo) addPost(post);
  };

  const chip = (active) =>
    `whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
      active ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
    }`;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="space-y-4 lg:col-span-2">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Hola, {user?.nombre} 👋
          </h1>
          <p className="mt-1 text-gray-500">Mira cómo puedes ayudar o pedir ayuda a tus vecinos.</p>
        </div>

        <PostForm onCreated={handleCreated} />

        <div className="space-y-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar publicaciones…"
            aria-label="Buscar publicaciones"
            className="input"
          />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SCOPES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setScope(s.value)}
                aria-pressed={scope === s.value}
                className={chip(scope === s.value)}
              >
                {s.label}
              </button>
            ))}
            <span className="mx-1 w-px shrink-0 bg-gray-200" aria-hidden="true" />
            <button type="button" onClick={() => setTipo('')} className={chip(tipo === '')}>
              Todo tipo
            </button>
            {Object.entries(TIPOS).map(([key, t]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTipo(key)}
                aria-pressed={tipo === key}
                className={chip(tipo === key)}
              >
                {t.short}
              </button>
            ))}
          </div>
        </div>

        <PostList
          posts={posts}
          loading={loading}
          error={error}
          onUpdate={updatePost}
          onDelete={removePost}
          emptyTitle="No hay publicaciones con estos filtros"
          emptyText="Prueba otro filtro o sé el primero en publicar algo."
        />
      </section>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <NeighborsCard showList={false} />
      </aside>
    </div>
  );
}
