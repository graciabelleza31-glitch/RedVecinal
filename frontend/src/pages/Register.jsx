import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';

const initialForm = {
  nombre: '',
  apellido: '',
  email: '',
  distrito: '',
  barrio: '',
  password: '',
  confirmPassword: '',
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (Object.values(form).some((v) => !v.trim())) {
      return setError('Completa todos los campos.');
    }
    if (form.password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres.');
    }
    if (form.password !== form.confirmPassword) {
      return setError('Las contraseñas no coinciden.');
    }
    if (!accepted) {
      return setError('Debes aceptar los términos y condiciones.');
    }

    setSubmitting(true);
    try {
      const { confirmPassword, ...payload } = form;
      await register(payload);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (id, label, props = {}) => (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        value={form[id]}
        onChange={handleChange}
        required
        className="input"
        {...props}
      />
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" stacked />
        </div>

        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-bold text-gray-900">Crea tu cuenta</h1>
          <p className="mt-1 text-sm text-gray-500">
            Únete a la red de apoyo de tu barrio.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {field('nombre', 'Nombre', { autoComplete: 'given-name', placeholder: 'María' })}
              {field('apellido', 'Apellido', { autoComplete: 'family-name', placeholder: 'Quispe' })}
            </div>

            {field('email', 'Correo electrónico', {
              type: 'email',
              autoComplete: 'email',
              placeholder: 'tucorreo@ejemplo.com',
            })}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {field('distrito', 'Ciudad / Distrito', { placeholder: 'San Isidro' })}
              {field('barrio', 'Barrio', { placeholder: 'Urb. Orrantia' })}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {field('password', 'Contraseña', {
                type: 'password',
                autoComplete: 'new-password',
                placeholder: 'Mínimo 6 caracteres',
              })}
              {field('confirmPassword', 'Confirmar contraseña', {
                type: 'password',
                autoComplete: 'new-password',
                placeholder: 'Repite tu contraseña',
              })}
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600"
              />
              <span>
                Acepto los{' '}
                <span className="font-semibold text-brand-600">términos y condiciones</span> y la
                política de privacidad.
              </span>
            </label>

            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
