export function timeAgo(dateString) {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diff < 60) return 'hace un momento';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)} d`;
  return new Date(dateString).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
  });
}

export function initials(nombre = '', apellido = '') {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase() || 'V';
}
