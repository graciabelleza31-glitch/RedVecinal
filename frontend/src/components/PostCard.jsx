import { useState } from 'react';
import { apiRequest } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CATEGORIA_LABEL, TIPOS } from '../constants.js';
import { timeAgo } from '../utils.js';
import Avatar from './Avatar.jsx';
import { BookmarkIcon, CheckIcon, CommentIcon, HeartIcon, TrashIcon } from './Icons.jsx';
import { Link } from 'react-router-dom';

export default function PostCard({ post, onUpdate, onDelete }) {
  const { token } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const tipo = TIPOS[post.tipo];

  const run = async (path, options) => {
    setError('');
    setBusy(true);
    try {
      return await apiRequest(path, { token, ...options });
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const handleLike = async () => {
    const data = await run(`/posts/${post.id}/like`, { method: 'POST' });
    if (data) onUpdate(data.post);
  };

  const handleSave = async () => {
    const data = await run(`/posts/${post.id}/save`, { method: 'POST' });
    if (data) onUpdate(data.post);
  };

  const handleResolve = async () => {
    const data = await run(`/posts/${post.id}/resolve`, { method: 'PATCH' });
    if (data) onUpdate(data.post);
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar esta publicación?')) return;
    const data = await run(`/posts/${post.id}`, { method: 'DELETE' });
    if (data) onDelete(post.id);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const data = await run(`/posts/${post.id}/comments`, {
      method: 'POST',
      body: { texto: comment },
    });
    if (data) {
      onUpdate(data.post);
      setComment('');
    }
  };

  const actionBtn =
    'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100 disabled:opacity-60';

  return (
    <article className={`card p-5 ${post.resuelto ? 'opacity-75' : ''}`}>
      <header className="flex items-start gap-3">
        <Avatar nombre={post.author.nombre} apellido={post.author.apellido} />
        <div className="min-w-0 flex-1">
          <Link
  to={`/vecino/${post.author.id}`}
  className="block truncate text-sm font-semibold text-gray-900 hover:text-brand-700 hover:underline"
>
  {post.author.nombre} {post.author.apellido}
</Link>
          <p className="text-xs text-gray-500">
            {post.barrio} · {timeAgo(post.createdAt)}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tipo.badge}`}
        >
          {tipo.short}
        </span>
      </header>

      <div className="mt-4">
        <h3 className="text-base font-bold text-gray-900">{post.titulo}</h3>
        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-600">
          {post.descripcion}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
            {CATEGORIA_LABEL[post.categoria] || 'General'}
          </span>
          {post.resuelto && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
              <CheckIcon className="h-3.5 w-3.5" /> Resuelto
            </span>
          )}
        </div>
      </div>

      <footer className="mt-4 flex flex-wrap items-center gap-1 border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={handleLike}
          disabled={busy}
          aria-pressed={post.liked}
          className={`${actionBtn} ${post.liked ? 'text-red-500' : ''}`}
        >
          <HeartIcon filled={post.liked} className="h-4 w-4" /> {post.likesCount}
        </button>
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          aria-expanded={showComments}
          className={actionBtn}
        >
          <CommentIcon className="h-4 w-4" /> {post.comments.length}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          aria-pressed={post.saved}
          className={`${actionBtn} ${post.saved ? 'text-brand-600' : ''}`}
        >
          <BookmarkIcon filled={post.saved} className="h-4 w-4" />
          {post.saved ? 'Guardado' : 'Guardar'}
        </button>

        {post.isOwner && (
          <div className="ml-auto flex items-center gap-1">
            <button type="button" onClick={handleResolve} disabled={busy} className={actionBtn}>
              <CheckIcon className="h-4 w-4" />
              {post.resuelto ? 'Reabrir' : 'Marcar resuelto'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              aria-label="Eliminar publicación"
              className={`${actionBtn} hover:text-red-600`}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </footer>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {showComments && (
        <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
          {post.comments.length === 0 && (
            <p className="text-sm text-gray-500">Aún no hay comentarios. Sé el primero en responder.</p>
          )}
          {post.comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5">
              <Avatar nombre={c.author.nombre} apellido={c.author.apellido} size="sm" />
              <div className="min-w-0 flex-1 rounded-xl bg-gray-50 px-3 py-2">
                <p className="text-xs font-semibold text-gray-800">
                  {c.author.nombre} {c.author.apellido}{' '}
                  <span className="font-normal text-gray-400">· {timeAgo(c.createdAt)}</span>
                </p>
                <p className="mt-0.5 whitespace-pre-line text-sm text-gray-700">{c.texto}</p>
              </div>
            </div>
          ))}

          <form onSubmit={handleComment} className="flex gap-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              placeholder="Escribe un comentario…"
              aria-label="Escribe un comentario"
              className="input"
            />
            <button
              type="submit"
              disabled={busy || !comment.trim()}
              className="btn-primary !w-auto shrink-0 px-4"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
