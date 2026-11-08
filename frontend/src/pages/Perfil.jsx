import { useState } from 'react';
import { apiRequest } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import usePosts from '../hooks/usePosts.js';
import Avatar from '../components/Avatar.jsx';
import PostList from '../components/PostList.jsx';

export default function Perfil() {
  const { user, token, updateUser } = useAuth();
  const { posts, loading, error, updatePost, removePost } = usePosts('/posts/mine');

  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    distrito: user?.distrito || '',
    barrio: user?.barrio || '',
    telefono: user?.telefono || '',
    bio: user?.bio || '',
  });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });
  const [savingPwd, setSavingPwd] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handlePwdChange = (e) => setPwd((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setSaving(true);
    try {
      const data = await apiRequest('/users/me', { method: 'PUT', token, body: form });
      updateUser(data.user);
      setProfileMsg({ type: 'ok', text: 'Perfil actualizado.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: '', text: '' });
    if (pwd.newPassword !== pwd.confirm) {
      return setPwdMsg({ type: 'error', text: 'Las contraseñas nuevas no coinciden.' });
    }
    setSavingPwd(true);
    try {
      await apiRequest('/users/me/password', {
        method: 'PUT',
        token,
        body: { currentPassword: pwd.currentPassword, newPassword: pwd.newPassword },
      });
      setPwd({ currentPassword: '', newPassword: '', confirm: '' });
      setPwdMsg({ type: 'ok', text: 'Contraseña actualizada.' });
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.message });
    } finally {
      setSavingPwd(false);
    }
  };

  const Msg = ({ msg }) =>
    msg.text ? (
      <div
        role={msg.type === 'error' ? 'alert' : 'status'}
        className={`rounded-xl px-4 py-3 text-sm ${
          msg.type === 'error'
            ? 'border border-red-200 bg-red-50 text-red-700'
            : 'border border-brand-100 bg-brand-50 text-brand-700'
        }`}
      >
        {msg.text}
      </div>
    ) : null;

  const field = (name, label, props = {}) => (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input id={name} name={name} value={form[name]} onChange={handleChange} className="input" {...props} />
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-1">
        <section className="card p-5 text-center">
          <div className="flex justify-center">
            <Avatar nombre={user?.nombre} apellido={user?.apellido} size="lg" />
          </div>
          <h1 className="mt-3 text-lg font-bold text-gray-900">
            {user?.nombre} {user?.apellido}
          </h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <p className="mt-1 text-sm text-gray-500">
            {user?.barrio}, {user?.distrito}
          </p>
          {user?.bio && <p className="mt-3 text-sm text-gray-600">{user.bio}</p>}
        </section>

        <form onSubmit={handlePassword} className="card space-y-4 p-5" noValidate>
          <h2 className="font-bold text-gray-900">Cambiar contraseña</h2>
          <Msg msg={pwdMsg} />
          <div>
            <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
              Contraseña actual
            </label>
            <input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" value={pwd.currentPassword} onChange={handlePwdChange} className="input" />
          </div>
          <div>
            <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
              Nueva contraseña
            </label>
            <input id="newPassword" name="newPassword" type="password" autoComplete="new-password" value={pwd.newPassword} onChange={handlePwdChange} className="input" />
          </div>
          <div>
            <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-gray-700">
              Confirmar nueva contraseña
            </label>
            <input id="confirm" name="confirm" type="password" autoComplete="new-password" value={pwd.confirm} onChange={handlePwdChange} className="input" />
          </div>
          <button type="submit" disabled={savingPwd} className="btn-primary">
            {savingPwd ? 'Guardando…' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>

      <div className="space-y-6 lg:col-span-2">
        <form onSubmit={handleProfile} className="card space-y-4 p-5 sm:p-6" noValidate>
          <h2 className="font-bold text-gray-900">Mis datos</h2>
          <Msg msg={profileMsg} />
          <div className="grid gap-4 sm:grid-cols-2">
            {field('nombre', 'Nombre', { autoComplete: 'given-name' })}
            {field('apellido', 'Apellido', { autoComplete: 'family-name' })}
            {field('distrito', 'Ciudad / Distrito')}
            {field('barrio', 'Barrio')}
          </div>
          {field('telefono', 'Teléfono (visible en alertas de emergencia)', {
            type: 'tel',
            autoComplete: 'tel',
            placeholder: '999 999 999',
          })}
          <div>
            <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-gray-700">
              Sobre ti
            </label>
            <textarea id="bio" name="bio" rows={3} maxLength={200} value={form.bio} onChange={handleChange} placeholder="Cuéntales a tus vecinos en qué puedes ayudar." className="input resize-y" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary sm:!w-auto sm:px-8">
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Mis publicaciones</h2>
          <PostList
            posts={posts}
            loading={loading}
            error={error}
            onUpdate={updatePost}
            onDelete={removePost}
            emptyTitle="Aún no has publicado nada"
            emptyText="Tus pedidos y ofertas aparecerán aquí."
          />
        </section>
      </div>
    </div>
  );
}
