import { useState } from 'react';
import { apiRequest } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CATEGORIAS, TIPOS } from '../constants.js';

export default function PostForm({ onCreated }) {
  const { token, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState('pedido');
  const [categoria, setCategoria] = useState('general');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setTitulo('');
    setDescripcion('');
    setCategoria('general');
    setTipo('pedido');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!titulo.trim() || !descripcion.trim()) {
      return setError('Escribe un título y una descripción.');
    }
    setSubmitting(true);
    try {
      const data = await apiRequest('/posts', {
        method: 'POST',
        token,
        body: { tipo, categoria, titulo, descripcion },
      });
      onCreated(data.post);
      reset();
      setOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="card w-full px-5 py-4 text-left text-sm text-gray-500 transition hover:bg-gray-50"
      >
        ¿Qué necesitas u ofreces hoy, {user?.nombre}?
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-5" noValidate>
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900">Nueva publicación</h2>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="text-sm font-medium text-gray-500 hover:text-gray-800"
        >
          Cancelar
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-gray-700">Tipo</legend>
        <div className="flex flex-wrap gap-2">
          {Object.entries(TIPOS).map(([key, t]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTipo(key)}
              aria-pressed={tipo === key}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                tipo === key
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="post-categoria" className="mb-1.5 block text-sm font-medium text-gray-700">
          Categoría
        </label>
        <select
          id="post-categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="input"
        >
          {CATEGORIAS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="post-titulo" className="mb-1.5 block text-sm font-medium text-gray-700">
          Título
        </label>
        <input
          id="post-titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={100}
          placeholder="Ej: Necesito alguien que pasee a mi perro el sábado"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="post-desc" className="mb-1.5 block text-sm font-medium text-gray-700">
          Descripción
        </label>
        <textarea
          id="post-desc"
          rows={4}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          maxLength={1000}
          placeholder="Cuenta los detalles: cuándo, dónde y cómo pueden contactarte."
          className="input resize-y"
        />
      </div>

      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? 'Publicando…' : 'Publicar'}
      </button>
    </form>
  );
}
