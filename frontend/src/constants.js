export const TIPOS = {
  pedido: {
    label: 'Necesito ayuda',
    short: 'Pedido',
    badge: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  },
  oferta: {
    label: 'Ofrezco ayuda',
    short: 'Oferta',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  },
  aviso: {
    label: 'Aviso',
    short: 'Aviso',
    badge: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  },
  evento: {
    label: 'Evento',
    short: 'Evento',
    badge: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  },
};

export const CATEGORIAS = [
  { value: 'general', label: 'General' },
  { value: 'compras', label: 'Compras y mandados' },
  { value: 'salud', label: 'Salud' },
  { value: 'mascotas', label: 'Mascotas' },
  { value: 'herramientas', label: 'Herramientas' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'seguridad', label: 'Seguridad' },
  { value: 'cuidado', label: 'Cuidado de personas' },
  { value: 'emprendimiento', label: 'Emprendimiento' },
];

export const CATEGORIA_LABEL = Object.fromEntries(CATEGORIAS.map((c) => [c.value, c.label]));

export const ALERT_TIPOS = {
  medica: 'Emergencia médica',
  seguridad: 'Seguridad / robo',
  incendio: 'Incendio / humo',
  otro: 'Otra emergencia',
};

// Cambia estos números según tu país
export const EMERGENCY_NUMBERS = [
  { label: 'Policía', number: '105' },
  { label: 'Bomberos', number: '116' },
  { label: 'Ambulancia (SAMU)', number: '106' },
];
