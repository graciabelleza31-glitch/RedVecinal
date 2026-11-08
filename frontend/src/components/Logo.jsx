export default function Logo({ size = 'md', stacked = false }) {
  const icon = size === 'lg' ? 'h-14 w-14' : 'h-9 w-9';
  const text = size === 'lg' ? 'text-3xl' : 'text-xl';

  return (
    <div className={`flex items-center gap-2.5 ${stacked ? 'flex-col' : ''}`}>
      <span
        className={`${icon} flex items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm`}
      >
        <svg viewBox="0 0 24 24" className="h-3/5 w-3/5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 11l9-7 9 7" />
          <path d="M5 10v10h14V10" />
          <path d="M9 20v-5h6v5" />
        </svg>
      </span>
      <span className={`${text} font-extrabold tracking-tight text-gray-900`}>
        Red<span className="text-brand-600">Vecinal</span>
      </span>
    </div>
  );
}
