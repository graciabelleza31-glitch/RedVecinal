import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Hand, Heart, LayoutGrid, MapPin, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { TIPOS } from '../constants.js';
import usePosts from '../hooks/usePosts.js';
import PostForm from '../components/PostForm.jsx';
import PostList from '../components/PostList.jsx';
import NeighborsCard from '../components/NeighborsCard.jsx';

/* ---------- Fix de íconos de Leaflet para Vite ---------- */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/* ---------- Íconos de colores (SVG inline, sin archivos externos) ---------- */
const pinIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path d="M16 1C7.7 1 1 7.7 1 16c0 11 15 25 15 25s15-14 15-25C31 7.7 24.3 1 16 1z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
      <circle cx="16" cy="16" r="6" fill="#ffffff"/>
    </svg>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -38],
  });

const ICONS = {
  oferta: pinIcon('#059669'), // verde
  pedido: pinIcon('#dc2626'), // rojo
};
const DEFAULT_ICON = new L.Icon.Default(); // azul para aviso / evento

/* ---------- Coordenadas ---------- */
// Centro por defecto del mapa: cámbialo por el de tu zona
const DEFAULT_CENTER = [-12.0977, -77.0365];

const hashString = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
};

// Usa lat/lng reales si la publicación los tiene; si no, ubica el pin
// de forma estable (siempre en el mismo lugar) cerca del centro.
const getPosition = (post) => {
  if (Number.isFinite(post.lat) && Number.isFinite(post.lng)) return [post.lat, post.lng];
  const h = hashString(String(post.id));
  const angle = ((h % 360) * Math.PI) / 180;
  const radius = 0.0015 + ((Math.floor(h / 360) % 100) / 100) * 0.004;
  return [
    DEFAULT_CENTER[0] + Math.sin(angle) * radius,
    DEFAULT_CENTER[1] + Math.cos(angle) * radius,
  ];
};

function FitBounds({ points }) {
  const map = useMap();
  const key = points.map((p) => p.join(',')).join('|');

  useEffect(() => {
    if (points.length === 0) {
      map.setView(DEFAULT_CENTER, 15);
    } else if (points.length === 1) {
      map.setView(points[0], 16);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 17 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);

  return null;
}

/* ---------- Filtros ---------- */
const FILTERS = [
  { key: 'todo', label: 'Todo', icon: LayoutGrid, params: {}, match: () => true },
  { key: 'pedido', label: 'Necesito ayuda', icon: Hand, params: { tipo: 'pedido' }, match: (p) => p.tipo === 'pedido' },
  { key: 'oferta', label: 'Ofrezco ayuda', icon: Heart, params: { tipo: 'oferta' }, match: (p) => p.tipo === 'oferta' },
  {
    key: 'emprendimiento',
    label: 'Emprendimientos',
    icon: Store,
    params: { categoria: 'emprendimiento' },
    match: (p) => p.categoria === 'emprendimiento',
  },
];

export default function MiBarrio() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('todo');
  const active = FILTERS.find((f) => f.key === filter);

  const path = `/posts?${new URLSearchParams({ scope: 'barrio', ...active.params }).toString()}`;
  const { posts, loading, error, updatePost, removePost, addPost } = usePosts(path);

  const markers = useMemo(
    () => posts.map((post) => ({ post, position: getPosition(post) })),
    [posts]
  );
  const points = useMemo(() => markers.map((m) => m.position), [markers]);

  const handleCreated = (post) => {
    if (active.match(post)) addPost(post);
  };

  return (
    <div className="space-y-6">
      {/* Banner de bienvenida */}
      <div className="rounded-xl bg-brand-600 p-6 text-white shadow-sm sm:p-8">
        <p className="text-sm font-medium text-brand-100">Bienvenido a tu barrio</p>
        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{user?.barrio}</h1>
        <p className="mt-1 text-brand-100">
          {user?.distrito} · Descubre qué ofrecen y qué necesitan tus vecinos.
        </p>
      </div>

      {/* Mapa */}
      <section className="card isolate overflow-hidden" aria-label="Mapa del barrio">
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <h2 className="flex items-center gap-2 font-bold text-gray-900">
            <MapPin className="h-5 w-5 text-brand-600" aria-hidden="true" />
            Mapa del barrio
          </h2>
          <span className="text-sm text-gray-500">{markers.length} en el mapa</span>
        </div>

        <div className="h-72 sm:h-96">
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={15}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds points={points} />

            {markers.map(({ post, position }) => (
              <Marker
                key={post.id}
                position={position}
                icon={ICONS[post.tipo] || DEFAULT_ICON}
              >
                <Popup>
                  <div className="min-w-[160px]">
                    <div className="text-sm font-bold text-gray-900">{post.titulo}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      {TIPOS[post.tipo]?.short} · {post.author.nombre}
                    </div>
                    <Link
                      to={`/vecino/${post.author.id}`}
                      className="mt-1 inline-block text-xs font-semibold text-brand-600"
                    >
                      Ver perfil del vecino
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#059669]" /> Ofrezco ayuda
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#dc2626]" /> Necesito ayuda
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#2a81cb]" /> Aviso / Evento
          </span>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          {/* Filtros */}
          <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtros">
            {FILTERS.map((f) => {
              const Icon = f.icon;
              const isActive = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  aria-pressed={isActive}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {f.label}
                </button>
              );
            })}
          </div>

          <PostForm onCreated={handleCreated} />

          <PostList
            posts={posts}
            loading={loading}
            error={error}
            onUpdate={updatePost}
            onDelete={removePost}
            emptyTitle={
              filter === 'emprendimiento'
                ? 'Aún no hay emprendimientos en tu barrio'
                : 'Tu barrio aún está en silencio'
            }
            emptyText={
              filter === 'emprendimiento'
                ? 'Publica el tuyo eligiendo la categoría “Emprendimiento”.'
                : 'Publica el primer pedido u oferta y anima a tus vecinos a sumarse.'
            }
          />
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <NeighborsCard />
        </aside>
      </div>
    </div>
  );
}