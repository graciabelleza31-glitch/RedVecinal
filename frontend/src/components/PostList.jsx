import PostCard from './PostCard.jsx';

export default function PostList({
  posts,
  loading,
  error,
  onUpdate,
  onDelete,
  emptyTitle = 'Aún no hay publicaciones',
  emptyText = 'Cuando haya novedades aparecerán aquí.',
}) {
  if (loading) {
    return (
      <div className="space-y-4" role="status" aria-label="Cargando publicaciones">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card animate-pulse p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="space-y-2">
                <div className="h-3 w-32 rounded bg-gray-200" />
                <div className="h-3 w-20 rounded bg-gray-100" />
              </div>
            </div>
            <div className="mt-4 h-4 w-2/3 rounded bg-gray-200" />
            <div className="mt-2 h-3 w-full rounded bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="card px-6 py-12 text-center">
        <p className="font-bold text-gray-900">{emptyTitle}</p>
        <p className="mt-1 text-sm text-gray-500">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  );
}
