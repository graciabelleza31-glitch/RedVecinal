import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, MapPin, MessageCircle, Send } from 'lucide-react';
import { apiRequest } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import usePosts from '../hooks/usePosts.js';
import Avatar from '../components/Avatar.jsx';
import PostList from '../components/PostList.jsx';
import ChatModal from '../components/ChatModal.jsx';


export default function PerfilPublico() {
  const { id } = useParams();
  const { token, user: me } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatOpen, setChatOpen] = useState(false);

  const { posts, loading: loadingPosts, error: postsError, updatePost, removePost } = usePosts(
    `/posts?scope=todos&author=${id}`
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setProfile(null);

    apiRequest(`/users/${id}`, { token })
      .then((data) => {
        if (!cancelled) setProfile(data.user);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, token]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl" role="status" aria-label="Cargando perfil">
        <div className="card h-48 animate-pulse" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || 'No se encontró al vecino.'}
        </div>
        <Link to="/" className="btn-secondary">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const isMe = String(me?.id) === String(profile.id);

  const resueltas = posts.filter((p) => p.resuelto).length;
  const tieneSello = resueltas >= 1 || posts.length >= 3;
  const miembroDesde = new Date(profile.createdAt).toLocaleDateString('es-PE', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/mi-barrio"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver a mi barrio
      </Link>

      {/* Tarjeta de perfil (sin correo ni dirección exacta) */}
      <section className="card p-6 sm:p-8">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
          {profile.foto ? (
            <img
              src={profile.foto}
              alt={`Foto de ${profile.nombre}`}
              className="h-24 w-24 rounded-full object-cover ring-4 ring-brand-100"
            />
          ) : (
            <Avatar nombre={profile.nombre} apellido={profile.apellido} size="lg" />
          )}

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold text-gray-900">
              {profile.nombre} {profile.apellido}
            </h1>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {profile.barrio}, {profile.distrito}
            </p>

            <div className="mt-3">
              {tieneSello ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-bold text-brand-700 ring-1 ring-inset ring-brand-600/20">
                  <BadgeCheck className="h-4 w-4" aria-hidden="true" /> Visto Buen Vecinal
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-500">
                  <BadgeCheck className="h-4 w-4" aria-hidden="true" /> Sello en progreso
                </span>
              )}
            </div>

            {profile.bio && <p className="mt-4 text-sm leading-relaxed text-gray-600">{profile.bio}</p>}

            {isMe ? (
              <div className="mt-5">
                <Link to="/perfil" className="btn-secondary">
                  Editar mi perfil
                </Link>
              </div>
            ) : (
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                
                <button
                  type="button"
                  onClick={() => setChatOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  Mensaje
                </button>
              </div>
            )}
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-gray-100 pt-5 text-center">
          <div>
            <dt className="text-xs text-gray-500">Publicaciones</dt>
            <dd className="text-xl font-extrabold text-gray-900">{posts.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Resueltas</dt>
            <dd className="text-xl font-extrabold text-brand-700">{resueltas}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Miembro desde</dt>
            <dd className="text-sm font-bold capitalize text-gray-900 sm:text-base">{miembroDesde}</dd>
          </div>
        </dl>
      </section>

      {/* Todas las publicaciones del vecino */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">
          Publicaciones de {profile.nombre}
        </h2>
        <PostList
          posts={posts}
          loading={loadingPosts}
          error={postsError}
          onUpdate={updatePost}
          onDelete={removePost}
          emptyTitle="Este vecino aún no ha publicado nada"
          emptyText="Cuando publique un pedido u oferta aparecerá aquí."
        />
      </section>

      {chatOpen && (
        <ChatModal
          vecino={{ id: profile.id, nombre: profile.nombre, apellido: profile.apellido }}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}