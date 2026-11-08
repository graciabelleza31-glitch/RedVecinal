import { initials } from '../utils.js';

export default function Avatar({ nombre, apellido, size = 'md' }) {
  const sizes = {
    sm: 'h-7 w-7 text-[11px]',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-xl',
  };
  return (
    <span
      className={`${sizes[size]} inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700`}
      aria-hidden="true"
    >
      {initials(nombre, apellido)}
    </span>
  );
}
